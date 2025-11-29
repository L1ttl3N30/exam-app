import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import QuestionForm from "./question-form";

type Params = {
  params: { id: string };
};

export default async function AdminTestDetailPage({ params }: Params) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return <p>Forbidden.</p>;
  }

  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: "asc" } } }
  });

  if (!test) return <p>Test not found.</p>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="border rounded p-4 bg-white">
        <h1 className="text-2xl font-semibold mb-2">{test.title}</h1>
        <p className="text-sm text-slate-700 mb-2">{test.description}</p>
        <p className="text-xs text-slate-500">
          Type: {test.type} • {test.isPublished ? "Published" : "Draft"}
        </p>
      </div>
      {test.type === "MCQ" && (
        <div className="border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Questions</h2>
          <div className="flex flex-col gap-3 mb-4">
            {test.questions.map((q, idx) => (
              <div key={q.id} className="border rounded p-3 bg-slate-50">
                <p className="font-medium mb-1">
                  {idx + 1}. {q.prompt}
                </p>
                <ul className="text-sm list-disc ml-6 mb-1">
                  {q.options.map((o, i) => (
                    <li key={i}>
                      {o} {q.correctIndex === i && <span className="text-emerald-700">(correct)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <QuestionForm testId={test.id} />
        </div>
      )}
    </div>
  );
}

