export interface EmailGeneration {
  day: number;
  subject: string;
  body: string;
  cta: string;
}

export interface GenerationResult {
  id: string;
  emails: EmailGeneration[];
  promptVersion: string;
}
