import * as taskRepository from "@/lib/repositories/taskRepository";
import type { Task } from "@/lib/repositories/taskRepository";
import * as groupRepository from "@/lib/repositories/groupRepository";
import { ForbiddenError, NotFoundError } from "../error";
import { emitGroup } from "../socket";

export async function createTask(
  groupId: string,
  userId: string,
  title: string,
  excludedSocketId?: string | null
): Promise<Task | undefined> {
  const group = await groupRepository.getById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (group.owner.id !== userId) {
    throw new ForbiddenError("You are not the owner of this group");
  }
  const task = await taskRepository.create(groupId, title);

  emitGroup(groupId, "task:created", task, excludedSocketId);
  return task;
}

type UpdateTaskInput = Partial<{
  title: string;
  done: boolean;
}>;

export async function updateTask(
  groupId: string,
  taskId: string,
  userId: string,
  updates: UpdateTaskInput,
  excludedSocketId?: string | null
): Promise<Task | undefined> {
  const group = await groupRepository.getById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (group.owner.id !== userId) {
    throw new ForbiddenError("You are not the owner of this group");
  }

  const existingTask = await taskRepository.getById(taskId, groupId);
  if (!existingTask) {
    throw new NotFoundError("Task not found");
  }
  const updated = await taskRepository.update(groupId, taskId, updates);
  emitGroup(groupId, "task:updated", updated, excludedSocketId);
  return updated;
}

export async function deleteTask(
  groupId: string,
  taskId: string,
  userId: string,
): Promise<void> {
  const group = await groupRepository.getById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (group.owner.id !== userId) {
    throw new ForbiddenError("You are not the owner of this group");
  }

  const existingTask = await taskRepository.getById(taskId, groupId);
  if (!existingTask) {
    throw new NotFoundError("Task not found");
  }

  await taskRepository.remove(taskId);
  emitGroup(groupId, "task:deleted", { taskId });
}