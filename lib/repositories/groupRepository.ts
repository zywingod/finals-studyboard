import { prisma } from "@/lib/prisma";
import { Task } from "./taskRepository";

export type Group = {
  id: string;
  name: string;
  subject: string;
  memberCount: number;
  tasks: Task[];
  ownerId: string;
  owner: {
    id: string;
    name: string;
  };
};

export async function getAll(): Promise<Group[]> {
  return prisma.group.findMany({
    include: {
      tasks: true,
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getById(id: string): Promise<Group | null> {
  return prisma.group.findUnique({
    where: { id },
    include: {
      tasks: true,
      owner: { select: { id: true, name: true } },
    },
  });
}

type NewGroupInput = {
  name: string;
  subject: string;
  memberCount?: number;
  ownerId: string;
};

export async function create(input: NewGroupInput): Promise<Group> {
  return prisma.group.create({
    data: {
      name: input.name,
      subject: input.subject,
      memberCount: input.memberCount ?? 1,
      ownerId: input.ownerId,
    },
    include: {
      tasks: true,
      owner: { select: { id: true, name: true } },
    },
  });
}

type UpdateGroupInput = Partial<{
  name: string;
  subject: string;
  memberCount: number;
}>;

export async function update(
  id: string,
  updates: UpdateGroupInput
): Promise<Group | undefined> {
  try {
    return await prisma.group.update({
      where: { id },
      data: updates,
      include: {
        tasks: true,
        owner: { select: { id: true, name: true } },
      },
    });
  } catch {
    return undefined;
  }
}

export async function remove(id: string): Promise<void> {
  await prisma.group.delete({
    where: { id },
  });
}