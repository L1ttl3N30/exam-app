import { ensureOpenAI } from "./openai";

export type WritingRubricConfig = {
  keywords: string[];
  keywordWeight: number;
  structureWeight: number;
  styleWeight: number;
};

export type WritingGradeResult = {
  score: number;
  feedback: string;
};

export async function gradeWritingAnswer(
  answer: string,
  rubric: WritingRubricConfig,
  maxScore: number = 9
): Promise<WritingGradeResult> {
  const openai = ensureOpenAI();

  const systemPrompt = `
You are an IELTS writing examiner. Grade the student's response based on:
- Keywords and content relevance (${Math.round(rubric.keywordWeight * 100)}%)
- Structure and coherence (${Math.round(rubric.structureWeight * 100)}%)
- Style and grammar (${Math.round(rubric.styleWeight * 100)}%)

Return JSON with fields: "score" (0-${maxScore}) and "feedback" (short paragraph).
  `.trim();

  const userPrompt = `
Student answer:
${answer}

Keywords to look for: ${rubric.keywords.join(", ")}
`.trim();

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2
  });

  const content = completion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(content);
    const score = typeof parsed.score === "number" ? parsed.score : 0;
    const feedback =
      typeof parsed.feedback === "string" ? parsed.feedback : "No feedback provided.";
    return { score, feedback };
  } catch {
    return {
      score: 0,
      feedback: "Unable to parse grading result from AI."
    };
  }
}

