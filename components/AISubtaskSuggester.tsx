"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AISubtaskSuggester({ groupId }: { groupId: string }) {
    const router = useRouter();
    const [topic, setTopic] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");

    async function handleGenerate(e: FormEvent) {
        e.preventDefault();
        setError("");
        setIsGenerating(true);
        setSuggestions([]);

        const response = await fetch(`/api/groups/${groupId}/tasks/suggest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
        });

        setIsGenerating(false);

        if (!response.ok) {
            const data = await response.json();
            setError(data.error ?? "An error occurred while generating suggestions.");
            return;
        }

        const data: {subtasks: string[]} = await response.json();
        setSuggestions(data.subtasks);
    }

    function toggleChecked(subtask: string) {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(subtask)) {
                next.delete(subtask);
            } else {
                next.add(subtask);
            }
            return next;
        });
    }

    async function handleAddSelected() {
        setIsAdding(true);
        setError("");

        const selected = suggestions.filter((subtask) => checked.has(subtask));
        
        const results = await Promise.all(
            selected.map((title) =>
                fetch(`/api/groups/${groupId}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({title}),
                })
            )
        );

        setIsAdding(false);

        if (results.some((res) => !res.ok)) {
            setError("Some tasks could not be added. Please try again.");
        }

        setSuggestions([]);
        setChecked(new Set());
        router.refresh();
    }

    return (
    <div className="rounded-md border border-dashed p-4">
      <p className="text-sm font-medium">✨ AI Task Breakdown</p>
      <p className="mt-1 text-xs text-gray-500">
        Describe a broad task, and get suggested subtasks to add.
      </p>

      <form onSubmit={handleGenerate} className="mt-3 flex gap-2">
        <input
          type="text"
          required
          placeholder="e.g. Prepare for the midterm exam"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isGenerating}
          className="whitespace-nowrap rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {isGenerating ? "Thinking..." : "Suggest Subtasks"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-3">
          <ul className="flex flex-col gap-1">
            {suggestions.map((subtask) => (
              <li key={subtask} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked.has(subtask)}
                  onChange={() => toggleChecked(subtask)}
                  className="h-4 w-4"
                />
                <span>{subtask}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleAddSelected}
            disabled={isAdding || checked.size === 0}
            className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isAdding ? "Adding..." : `Add Selected (${checked.size})`}
          </button>
        </div>
      )}
    </div>
  );
} 