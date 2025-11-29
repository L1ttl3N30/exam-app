import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userHasAccessToTest } from "@/lib/access";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId, answers } = await req.json() as {
    testId: string;
    answers: { questionId: string; selectedIndex: number }[];
  };

  const hasAccess = await userHasAccessToTest(session.user.id, testId);
  if (!hasAccess) {
    return NextResponse.json({ error: "No access to test" }, { status: 403 });
  }

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: true }
  });

  if (!test || test.type !== "MCQ") {
    return NextResponse.json({ error: "Test not found or not MCQ" }, { status: 404 });
  }

  const answersMap = new Map(answers.map((a: any) => [a.questionId, a.selectedIndex]));

  let correctCount = 0;
  const total = test.questions.length;

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      testId: test.id,
      type: "MCQ",
      maxScore: total,
      score: 0,
      completedAt: new Date(),
      answers: {
        create: test.questions.map((q) => {
          const selectedIndex = answersMap.get(q.id);
          const isCorrect = selectedIndex === q.correctIndex;
          if (isCorrect) correctCount++;
          return {
            questionId: q.id,
            selectedIndex,
            isCorrect
          };
        })
      }
    },
    include: { answers: true }
  });

  const updated = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      score: correctCount
    }
  });

  return NextResponse.json({
    attemptId: updated.id,
    score: updated.score,
    maxScore: updated.maxScore
  });
}

