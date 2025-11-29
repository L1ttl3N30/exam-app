import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { testId, prompt, options, correctIndex, order } = body;

  const question = await prisma.question.create({
    data: {
      testId,
      prompt,
      options,
      correctIndex,
      order: order ?? 0
    }
  });

  return NextResponse.json(question);
}

