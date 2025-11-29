import Link from "next/link";
import { TestType } from "@prisma/client";

type Props = {
  id: string;
  title: string;
  description: string;
  type: TestType;
  durationMinutes: number;
  hasAccess: boolean;
};

export function TestCard({ id, title, description, type, durationMinutes, hasAccess }: Props) {
  const href = type === "MCQ" ? `/tests/${id}` : `/writing/${id}`;

  return (
    <div className="border rounded p-4 flex flex-col gap-2 bg-white shadow-sm">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-slate-700">{description}</p>
      <p className="text-xs text-slate-500">Duration: {durationMinutes} minutes</p>
      <div className="flex gap-2 mt-2">
        {hasAccess && (
          <Link
            href={href}
            className="rounded bg-slate-900 text-white text-sm px-3 py-1"
          >
            Start
          </Link>
        )}
        {!hasAccess && (
          <Link
            href={`/dashboard?purchase=${id}`}
            className="rounded bg-emerald-600 text-white text-sm px-3 py-1"
          >
            Purchase
          </Link>
        )}
      </div>
    </div>
  );
}

