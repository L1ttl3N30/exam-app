import { prisma } from "@/lib/prisma";
import { userHasAccessToTest } from "@/lib/access";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import TestClient from "./test-client";

type Params = {
  params: { id: string };
};

export default async function TestPage({ params }: Params) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return <p>You must be logged in.</p>;
  }

  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: "asc" } } }
  });

  if (!test || test.type !== "MCQ") {
    return <p>Test not found or not MCQ.</p>;
  }

  const hasAccess = await userHasAccessToTest(session.user.id, test.id);
  if (!hasAccess) {
    return <p>You do not have access to this test.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">{test.title}</h1>
      <p className="text-sm text-slate-700 mb-4">{test.description}</p>
      <TestClient test={test} />
    </div>
  );
}

