/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Page, Text, View, Document as PdfDocument, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  emailContainer: { marginBottom: 20, paddingBottom: 15, borderBottom: "1pt solid #ccc" },
  day: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  subject: { fontSize: 12, fontWeight: "bold", marginBottom: 10 },
  body: { fontSize: 10, lineHeight: 1.5, marginBottom: 10 },
  cta: { fontSize: 10, fontStyle: "italic", color: "#555" },
});

const MyPdfDocument = ({ emails }: { emails: any[] }) => (
  <PdfDocument>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Sales Email Sequence</Text>
      {emails.map((email, idx) => (
        <View key={idx} style={styles.emailContainer}>
          <Text style={styles.day}>Day {email.day}</Text>
          <Text style={styles.subject}>Subject: {email.subject}</Text>
          <Text style={styles.body}>{email.body}</Text>
          <Text style={styles.cta}>CTA: {email.cta}</Text>
        </View>
      ))}
    </Page>
  </PdfDocument>
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const generation = await prisma.generation.findUnique({
      where: { id: params.id },
    });

    if (!generation) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (generation.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const emails = JSON.parse(generation.emails);

    if (format === "txt") {
      const text = emails
        .map(
          (e: any) =>
            `--- Day ${e.day} ---\nSubject: ${e.subject}\n\n${e.body}\n\nCTA: ${e.cta}\n`
        )
        .join("\n\n");
      return new NextResponse(text, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="sequence-${params.id}.txt"`,
        },
      });
    }

    if (format === "docx") {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: emails.flatMap((e: any) => [
              new Paragraph({
                children: [
                  new TextRun({ text: `Day ${e.day}`, bold: true, size: 28 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Subject: ${e.subject}`, bold: true, size: 24 }),
                ],
                spacing: { after: 200 },
              }),
              ...e.body.split("\n").map(
                (line: string) =>
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 22 })],
                  })
              ),
              new Paragraph({
                children: [
                  new TextRun({ text: `CTA: ${e.cta}`, italics: true, size: 20, color: "555555" }),
                ],
                spacing: { before: 200, after: 400 },
              }),
            ]),
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="sequence-${params.id}.docx"`,
        },
      });
    }

    if (format === "pdf") {
      const buffer = await renderToBuffer(<MyPdfDocument emails={emails} />);
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="sequence-${params.id}.pdf"`,
        },
      });
    }

    return NextResponse.json({ message: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
