import type { Server as IOServer } from "socket.io"; //route handler ng socket.io related functions

//server-side helpers or functions
export function getIO(): IOServer | undefined {
    return(globalThis as unknown as {io?: IOServer}).io;
}

export function emitGroup(
    groupId: string,
    event: string,
    payload: unknown,
    excludedSocketId?: string | null
): void {
    const io = getIO();
    if (!io) return;

    const room = `group:${groupId}`;
    const target = excludedSocketId ? io.to(room).except(excludedSocketId) : io.to(room);
    target.emit(event, payload);
}