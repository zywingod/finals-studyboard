import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GroupCard from "@/components/GroupCard";
import { getGroups } from "@/lib/services/groupService";

export default async function GroupsPage() {
  const [groups, session] = await Promise.all([
    getGroups(),
    getServerSession(authOptions),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Groups</h1>
        {session && (
          <Link
            href="/groups/new"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + New Group
          </Link>
        )}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}