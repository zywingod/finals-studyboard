import Link from "next/link";
import { Group } from "@/lib/repositories/groupRepository";

// Purely presentational, no interactivity -> stays a Server Component.
export default function GroupCard({ group }: { group: Group }) {
  const completedCount = group.tasks.filter((t) => t.done).length;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="block rounded-lg border p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold text-emerald-700">{group.name}</h3>
      <p className="text-sm text-gray-500">{group.subject}</p>
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>{group.memberCount} members</span>
        <span>
          {completedCount}/{group.tasks.length} tasks done
        </span>
      </div>
    </Link>
  );
}