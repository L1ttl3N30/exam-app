"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  testId: string;
};

export default function WritingClient({ testId }: Props) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setLoading(true);

    const res = await fetch("/api/writing/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, answer })
    });

    setLoading(false);

    if (!res.ok) return;

    const data = await res.json();
    router.push(`/writing/${testId}/result?attemptId=${data.attemptId}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="w-full border rounded p-2 min-h-[250px]"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer here..."
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded bg-emerald-600 text-white px-4 py-2 font-medium self-start disabled:opacity-60"
      >
        {loading ? "Grading..." : "Submit for grading"}
      </button>
    </div>
  );
}

