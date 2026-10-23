import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as groupService from "@/lib/services/groupService";
import { createGroupSchema } from "@/lib/validation";

export async function GET() {
  const groups = await groupService.getGroups();
  return NextResponse.json(groups);
}


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "You must be logged in to create a group." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const newGroup = await groupService.createGroup(
    parsed.data, 
    session.user.id
  );

  return NextResponse.json(newGroup, { status: 201 });
}
