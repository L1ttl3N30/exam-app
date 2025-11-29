import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TestCard } from "@/components/TestCard";
import { userHasAccessToTest } from "@/lib/access";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return (
      <div>
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  const tests = await prisma.test.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });

  const accessMap = new Map<string, boolean>();
  for (const test of tests) {
    const hasAccess = await userHasAccessToTest(session.user.id, test.id);
    accessMap.set(test.id, hasAccess);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/api/stripe/checkout"
            className="hidden"
          >
            Hidden
          </Link>
        </div>
      </div>
      <section>
        <h2 className="text-lg font-semibold mb-2">Tests</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((t) => (
            <TestCard
              key={t.id}
              id={t.id}
              title={t.title}
              description={t.description}
              type={t.type}
              durationMinutes={t.durationMinutes}
              hasAccess={accessMap.get(t.id) ?? false}
            />
          ))}
        </div>
      </section>
      <section className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Subscriptions</h2>
        <p className="text-sm text-slate-700 mb-2">
          Subscribe weekly or monthly for unlimited access to all tests.
        </p>
        <div className="flex gap-2">
          <SubscriptionButton mode="weekly" />
          <SubscriptionButton mode="monthly" />
        </div>
      </section>
    </div>
  );
}

async function getCheckoutUrl(mode: "weekly" | "monthly") {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode })
  });

  if (!res.ok) return "#";
  const data = await res.json();
  return data.url as string;
}

// This is a simple client-less link; for a real app you would use a client button.
// To keep things server-safe, we just show instructions here.
function SubscriptionButton({ mode }: { mode: "weekly" | "monthly" }) {
  return (
    <form
      action={`/api/stripe/checkout`}
      method="POST"
      className="inline"
    >
      <input type="hidden" name="mode" value={mode} />
      <button
        type="submit"
        className="rounded bg-emerald-600 text-white text-sm px-3 py-1"
      >
        {mode === "weekly" ? "Weekly subscription" : "Monthly subscription"}
      </button>
    </form>
  );
}

