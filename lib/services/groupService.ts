import { ForbiddenError, NotFoundError } from "../error";
import * as groupRepositories from "../repositories/groupRepository";
import type { Group } from "../repositories/groupRepository";
import { emitGroup } from "../socket";

export async function getGroups() : Promise<Group[]> {
  return groupRepositories.getAll();
}

export async function getGroupById(id: string) : Promise<Group | null> {
  return groupRepositories.getById(id);
}

type CreateGroupInput = {
  name: string;
  subject: string;
  memberCount?: number;
};

export async function createGroup(
    input: CreateGroupInput,
    ownerId: string
) : Promise<Group> {
  return groupRepositories.create({ ...input, ownerId });
}

type UpdateGroupInput = Partial<{
  name: string;
  subject: string;
  memberCount: number;
}>;

export async function updateGroup(
    groupId: string,
    userId: string,
    updates: UpdateGroupInput
) : Promise<Group | undefined > {
  const group = await groupRepositories.getById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (group.owner.id !== userId) {
    throw new ForbiddenError("You are not the owner of this group");
  }
  return groupRepositories.update(groupId, updates);
}

export async function deleteGroup(
    groupId: string,
    userId: string
) : Promise<void> {
    const group = await groupRepositories.getById(groupId);
    if (!group) {
        throw new NotFoundError("Group not found");
    }
    if (group.owner.id !== userId) {
        throw new ForbiddenError("You are not the owner of this group");
    }
    await groupRepositories.remove(groupId);
    emitGroup(groupId, "group:deleted", { groupId });
}