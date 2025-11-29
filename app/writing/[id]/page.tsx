import { prisma } from "@/lib/prisma";
import { userHasAccessToTest } from "@/lib/access";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import WritingClient from "./writing-client";

type Params = {
  params: { id: string };
};

export default async function WritingTestPage({ params }: Params) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return <p>Unauthorized</p>;

  const test = await prisma.test.findUnique({
    where: { id: params.id }
  });

  if (!test || test.type !== "WRITING") {
    return <p>Test not found or not writing.</p>;
  }

  const hasAccess = await userHasAccessToTest(session.user.id, test.id);
  if (!hasAccess) return <p>No access.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">{test.title}</h1>
      <p className="text-sm text-slate-700 mb-4">{test.description}</p>
      <WritingClient testId={test.id} />
    </div>
  );
}

