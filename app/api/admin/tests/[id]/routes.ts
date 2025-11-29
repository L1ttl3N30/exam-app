import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string };
};

export async function GET(_req: NextRequest, { params }: Params) {
  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: { questions: true }
  });

  if (!test) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(test);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const test = await prisma.test.update({
    where: { id: params.id },
    data: body
  });

  return NextResponse.json(test);
}

