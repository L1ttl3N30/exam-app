"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Test, Question } from "@prisma/client";

type TestWithQuestions = Test & { questions: Question[] };

type Props = {
  test: TestWithQuestions;
};

export default function TestClient({ test }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChange(questionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }

  async function handleSubmit(auto = false) {
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      testId: test.id,
      answers: test.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1
      }))
    };

    const res = await fetch("/api/tests/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(`/tests/${test.id}/result?attemptId=${data.attemptId}`);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-700">
          Time left:{" "}
          <span className={timeLeft < 60 ? "text-red-600 font-semibold" : ""}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </p>
        <button
          disabled={submitting}
          onClick={() => handleSubmit(false)}
          className="rounded bg-emerald-600 text-white px-3 py-1 text-sm"
        >
          Submit
        </button>
      </div>
      {test.questions.map((q, idx) => (
        <div key={q.id} className="border rounded p-3 bg-white">
          <p className="font-medium mb-2">
            {idx + 1}. {q.prompt}
          </p>
          <div className="flex flex-col gap-1">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === i}
                  onChange={() => onChange(q.id, i)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

