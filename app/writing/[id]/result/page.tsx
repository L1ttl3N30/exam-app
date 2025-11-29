import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

type Params = {
  params: { id: string };
  searchParams: { attemptId?: string };
};

export default async function WritingResultPage({ searchParams }: Params) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return <p>Unauthorized</p>;

  const attemptId = searchParams.attemptId;
  if (!attemptId) return <p>Missing attemptId</p>;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { test: true }
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return <p>Result not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Writing Result</h1>
      <p className="font-medium mb-2">{attempt.test.title}</p>
      <p className="mb-2">
        Score:{" "}
        <span className="font-semibold">
          {attempt.score} / {attempt.maxScore}
        </span>
      </p>
      <h2 className="text-lg font-semibold mt-4 mb-2">Feedback</h2>
      <p className="whitespace-pre-wrap text-sm text-slate-800">
        {attempt.feedback}
      </p>
    </div>
  );
}

