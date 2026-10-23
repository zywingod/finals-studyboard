import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as taskService from "@/lib/services/taskService";
import { updateTaskSchema } from "@/lib/validation";
import { emitGroup } from "@/lib/socket";
import { ForbiddenError, NotFoundError } from "@/lib/error";

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

  try{
    const updated = await taskService.updateTask(
      params.id, 
      params.taskId, 
      session.user.id, 
      parsedResponse.data,
      request.headers.get("x-socket-id")
    );
    return NextResponse.json(updated);
  }catch(error){
  if(error instanceof NotFoundError){
    return NextResponse.json({error: error.message}, {status: 404})
  }
  if(error instanceof ForbiddenError){
    return NextResponse.json({error: error.message}, {status: 403})
  }
  throw error;
}
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

  try {
    await taskService.deleteTask(params.id, params.taskId, session.user.id);
    return NextResponse.json({ message: "Task deleted"});
  }catch(error){
    if(error instanceof NotFoundError){
    return NextResponse.json({error: error.message}, {status: 404})
    }
    if(error instanceof ForbiddenError){
      return NextResponse.json({error: error.message}, {status: 403})
    }
    throw error;
  }
}  