import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return <p>Forbidden.</p>;
  }

  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Link
          href="/admin/tests/new"
          className="rounded bg-slate-900 text-white px-3 py-1 text-sm"
        >
          New test
        </Link>
      </div>
      <div className="grid gap-3">
        {tests.map((t) => (
          <Link
            key={t.id}
            href={`/admin/tests/${t.id}`}
            className="border rounded p-3 bg-white flex justify-between"
          >
            <div>
              <p className="font-semibold">{t.title}</p>
              <p className="text-xs text-slate-600">
                {t.type} • {t.isPublished ? "Published" : "Draft"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

