import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

const generateRequestSchema = z.object({
  prospectName: z.string(),
  company: z.string(),
  role: z.string(),
  industry: z.string(),
  painPoints: z.string(),
  objective: z.string(),
  tone: z.string().optional(),
  length: z.string().optional(),
  doNotMention: z.string().optional(),
  isRegeneration: z.boolean().optional(),
});

const aiOutputSchema = z.object({
  emails: z.array(
    z.object({
      day: z.number(),
      subject: z.string(),
      body: z.string(),
      cta: z.string(),
    })
  ).length(5)
});

const PROMPT_VERSION = "v4";

const SYSTEM_PROMPT = `
You are a Senior B2B Sales Copywriter expert at crafting highly converting cold outbound email sequences.
Your task is to write a 5-email drip sequence tailored to the provided prospect profile and objective.

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown formatting, code fences (e.g. \`\`\`json), or any backticks.
2. The JSON must exactly match this structure:
{
  "emails": [
    { "day": 0, "subject": "...", "body": "...", "cta": "..." },
    { "day": 3, "subject": "...", "body": "...", "cta": "..." },
    { "day": 7, "subject": "...", "body": "...", "cta": "..." },
    { "day": 12, "subject": "...", "body": "...", "cta": "..." },
    { "day": 18, "subject": "...", "body": "...", "cta": "..." }
  ]
}
3. The array must contain EXACTLY 5 emails.
4. Use standard day offsets: 0, 3, 7, 12, 18.
5. The 'body' should use \n\n for paragraph breaks. DO NOT use markdown in the body.
6. Make the emails highly personalized, concise, and focused on value.
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = generateRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ message: "Invalid input", errors: (parseResult.error as any).errors }, { status: 400 });
    }

    const input = parseResult.data;

    const userPrompt = `
Create a 5-email sequence for this prospect:
Name: ${input.prospectName}
Company: ${input.company}
Role: ${input.role}
Industry: ${input.industry}
Pain Points: ${input.painPoints}

Outreach Objective: ${input.objective}
Constraints:
- Tone: ${input.tone || "Professional and engaging"}
- Length: ${input.length || "Concise (under 150 words)"}
- Do NOT mention: ${input.doNotMention || "None"}
${input.isRegeneration ? "\nNOTE: This is a regeneration. Please provide a meaningfully different angle and fresh copy compared to standard defaults." : ""}
    `;

    const startTime = Date.now();
    let aiResponseText = "";
    let parsedEmails: z.infer<typeof aiOutputSchema> | null = null;
    let attempt = 0;
    let rawResponseObj = null;

    while (attempt < 2 && !parsedEmails) {
      attempt++;
      try {
        const response = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: input.isRegeneration ? 0.9 : 0.7,
          response_format: { type: "json_object" },
        });

        aiResponseText = response.choices[0].message.content || "";
        
        // Defensively parse JSON (strip markdown fences if model ignored instructions)
        let cleanedText = aiResponseText.trim();
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\n/, "").replace(/\n```$/, "");
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```\n/, "").replace(/\n```$/, "");
        }

        rawResponseObj = JSON.parse(cleanedText);
        parsedEmails = aiOutputSchema.parse(rawResponseObj);

      } catch (e) {
        console.error(`Attempt ${attempt} parsing failed:`, e);
        if (attempt >= 2) {
          return NextResponse.json({ message: "Failed to generate valid sequence after 2 attempts. Please try again." }, { status: 500 });
        }
        // If it fails, the loop will retry once.
      }
    }

    if (!parsedEmails || !rawResponseObj) {
      return NextResponse.json({ message: "Failed to generate valid sequence." }, { status: 500 });
    }

    const responseTimeMs = Date.now() - startTime;

    // Save to database
    const prospectProfileObj = {
      name: input.prospectName,
      company: input.company,
      role: input.role,
      industry: input.industry,
      painPoints: input.painPoints
    };
    
    const constraintsObj = {
      tone: input.tone,
      length: input.length,
      doNotMention: input.doNotMention
    };

    const generation = await prisma.generation.create({
      data: {
        userId: session.user.id,
        prospectProfile: JSON.stringify(prospectProfileObj),
        objective: input.objective,
        constraints: JSON.stringify(constraintsObj),
        promptVersion: PROMPT_VERSION,
        rawAiResponse: JSON.stringify(rawResponseObj),
        emails: JSON.stringify(parsedEmails.emails),
        responseTimeMs,
      }
    });

    return NextResponse.json({
      id: generation.id,
      emails: parsedEmails.emails,
      promptVersion: PROMPT_VERSION,
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
