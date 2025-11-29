"use client";

import { useState } from "react";

type Props = {
  testId: string;
};

export default function QuestionForm({ testId }: Props) {
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId,
        prompt,
        options,
        correctIndex,
        order: 0
      })
    });

    setLoading(false);
    setPrompt("");
    setOptions(["", "", "", ""]);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="font-semibold">Add MCQ question</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Prompt</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((opt, i) => (
          <div key={i}>
            <label className="block text-xs mb-1">Option {i + 1}</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Correct option</label>
        <select
          className="border rounded px-2 py-1"
          value={correctIndex}
          onChange={(e) => setCorrectIndex(Number(e.target.value))}
        >
          <option value={0}>Option 1</option>
          <option value={1}>Option 2</option>
          <option value={2}>Option 3</option>
          <option value={3}>Option 4</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-slate-900 text-white px-3 py-1 text-sm self-start disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add question"}
      </button>
    </form>
  );
}

