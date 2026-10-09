import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Input a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters "),
});

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  subject: z.string().trim().min(1, "Subject is required").max(100),
  memberCount: z.number().int().positive().optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200).optional(),
    done: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.done !== undefined, {
    message: "Nothing to update",
  });