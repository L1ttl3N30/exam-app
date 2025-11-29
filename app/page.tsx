import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authConfig);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-3xl font-bold mb-4 text-center">
        IELTS Test Platform
      </h1>
      <p className="text-slate-700 mb-6 text-center max-w-xl">
        Practice MCQ and writing tests, get instant AI-powered feedback, and manage your access
        via one-time purchases or subscriptions.
      </p>
      <div className="flex gap-4">
        {session?.user ? (
          <Link
            href="/dashboard"
            className="rounded bg-slate-900 text-white px-4 py-2 font-medium"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="rounded bg-slate-900 text-white px-4 py-2 font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="rounded border border-slate-900 px-4 py-2 font-medium"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

