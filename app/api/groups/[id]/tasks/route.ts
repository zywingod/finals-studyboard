import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as groupService from "@/lib/services/groupService";
import * as taskService from "@/lib/services/taskService";
import { createTaskSchema } from "@/lib/validation";
import { ForbiddenError, NotFoundError } from "@/lib/error";


// GET /api/groups/:id/tasks — list a group's tasks. Stays PUBLIC.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const group = await groupService.getGroupById(params.id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group.tasks);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session){
    return NextResponse.json(
      {error: "Unauthorized"},
      {status: 401}
    );
  }

  const body = await request.json();
  const parsedResponse = createTaskSchema.safeParse(body)
   if ( !parsedResponse.success){
    return NextResponse.json(
      { error: parsedResponse.error.issues[0].message},
      { status: 400 }
    );
  }

  try {
    const newTask = await taskService.createTask(
      params.id,
      session.user.id,
      parsedResponse.data.title,
      request.headers.get("x-socket-id")
    );
    return NextResponse.json(newTask, { status: 201 });
    }catch (error) {
      if (error instanceof NotFoundError){
    return NextResponse.json({ error: error.message }, { status: 404 })
    }
      if (error instanceof ForbiddenError){
    return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}