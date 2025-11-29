import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeWritingAnswer, WritingRubricConfig } from "@/lib/grading";
import { userHasAccessToTest } from "@/lib/access";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId, answer } = await req.json() as {
    testId: string;
    answer: string;
  };

  const hasAccess = await userHasAccessToTest(session.user.id, testId);
  if (!hasAccess) {
    return NextResponse.json({ error: "No access to test" }, { status: 403 });
  }

  const test = await prisma.test.findUnique({
    where: { id: testId }
  });

  if (!test || test.type !== "WRITING") {
    return NextResponse.json({ error: "Test not found or not writing" }, { status: 404 });
  }

  const rubricJson = (test.writingRubricJson as any) || {};
  const rubric: WritingRubricConfig = {
    keywords: rubricJson.keywords || [],
    keywordWeight: rubricJson.keywordWeight ?? 0.4,
    structureWeight: rubricJson.structureWeight ?? 0.3,
    styleWeight: rubricJson.styleWeight ?? 0.3
  };

  const result = await gradeWritingAnswer(answer, rubric, 9);

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      testId: test.id,
      type: "WRITING",
      score: result.score,
      maxScore: 9,
      feedback: result.feedback,
      completedAt: new Date()
    }
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score: attempt.score,
    maxScore: attempt.maxScore,
    feedback: attempt.feedback
  });
}
