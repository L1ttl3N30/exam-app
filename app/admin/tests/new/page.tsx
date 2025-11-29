"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"MCQ" | "WRITING">("MCQ");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priceCents, setPriceCents] = useState(50000);
  const [isPublished, setIsPublished] = useState(false);
  const [stripePriceId, setStripePriceId] = useState("");
  const [rubricKeywords, setRubricKeywords] = useState("character, plot");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const writingRubricJson =
      type === "WRITING"
        ? {
            keywords: rubricKeywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
            keywordWeight: 0.4,
            structureWeight: 0.3,
            styleWeight: 0.3
          }
        : null;

    const res = await fetch("/api/admin/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        type,
        durationMinutes,
        priceCents,
        isPublished,
        stripePriceId: stripePriceId || null,
        writingRubricJson
      })
    });

    setLoading(false);

    if (!res.ok) return;

    const data = await res.json();
    router.push(`/admin/tests/${data.id}`);
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create test</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white rounded p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "MCQ" | "WRITING")}
              className="border rounded px-2 py-1"
            >
              <option value="MCQ">MCQ</option>
              <option value="WRITING">Writing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (VND cents)</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-32"
              value={priceCents}
              onChange={(e) => setPriceCents(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stripe Price ID</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={stripePriceId}
            onChange={(e) => setStripePriceId(e.target.value)}
            placeholder="price_..."
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="published"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="published" className="text-sm">
            Published
          </label>
        </div>
        {type === "WRITING" && (
          <div>
            <label className="block text-sm font-medium mb-1">Rubric keywords</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={rubricKeywords}
              onChange={(e) => setRubricKeywords(e.target.value)}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-slate-900 text-white px-4 py-2 font-medium self-start disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create test"}
        </button>
      </form>
    </div>
  );
}

