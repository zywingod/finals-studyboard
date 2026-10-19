"use client";

import { useState, FormEvent } from "react";
import { useRouter } from 'next/navigation';
import Button from "./Button";
import { socket } from "@/lib/socketClient";

export default function NewTaskForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch(`/api/groups/${groupId}/tasks`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Socket-Id": socket.id ?? "",
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add task.");
      setIsSubmitting(false);
      return;
    }

    setTitle("");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          required
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
      </form>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}