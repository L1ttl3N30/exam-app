import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    type,
    durationMinutes,
    priceCents,
    isPublished,
    stripePriceId,
    writingRubricJson
  } = body;

  const test = await prisma.test.create({
    data: {
      title,
      description,
      type,
      durationMinutes,
      priceCents,
      isPublished,
      stripePriceId,
      writingRubricJson
    }
  });

  return NextResponse.json(test);
}
