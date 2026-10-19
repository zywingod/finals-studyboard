import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGroupById, updateTask, deleteTask } from "@/lib/data";
import { updateTaskSchema } from "@/lib/validation";
import { emitGroup } from "@/lib/socket";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session){
    return NextResponse.json(
      {error: "Unauthorized"},
      {status: 401}
    );
  }

  const body = await request.json();
  const parsedResponse = updateTaskSchema.safeParse(body)
   if ( !parsedResponse.success){
    return NextResponse.json(
      { error: parsedResponse.error.issues[0].message},
      { status: 400 }
    );
  }

  const group = await getGroupById(params.id);

  if (!group) {
    return NextResponse.json(
      { error: "Group not found" }, 
      { status: 404 }
    );
  }

  if (group.ownerId !== session.user.id){
    return NextResponse.json(
      {error: "Only the owner can can modify this task"},
      {status: 403}
    );
  } 


  const updated = await updateTask(params.id, params.taskId, body);

  if (!updated) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  emitGroup(
    params.id,
    "task:updated",
    updated,
    request.headers.get("x-socket-id")
  )

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session){
    return NextResponse.json(
      {error: "Unauthorized"},
      {status: 401}
    );
  }

  const group = await getGroupById(params.id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.ownerId !== session.user.id){
    return NextResponse.json(
      {error: "Only the group owner can can delete this task"},
      {status: 403}
    );
  }

  const deleted = await deleteTask(params.id, params.taskId);

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

    emitGroup(
      params.id,
      "task:deleted",
      request.headers.get("x-socket-id")
    )

  return NextResponse.json({ message: "Task deleted" });
}