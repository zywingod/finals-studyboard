import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as groupService from "@/lib/services/groupService";
import { updateGroupSchema } from "@/lib/validation";
import { ForbiddenError, NotFoundError } from "@/lib/error";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const group = await groupService.getGroupById(params.id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
}

export async function PATCH(
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
  const parsed = updateGroupSchema.safeParse(body);
  if ( !parsed.success){
    return NextResponse.json(
      { error: parsed.error.issues[0].message},
      { status: 400 }
    )
  }

  try {
    const updated = await groupService.updateGroup(
      params.id, 
      session.user.id, 
      parsed.data
    );
    return NextResponse.json(updated);  
  }catch(error) {
    if (error instanceof NotFoundError){
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ForbiddenError){
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

export async function DELETE(
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

  try {
    await groupService.deleteGroup(params.id, session.user.id);
    return NextResponse.json({ message: "Group deleted successfully" });
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