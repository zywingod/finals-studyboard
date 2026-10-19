"use client";

import { socket } from "@/lib/socketClient";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { set } from "zod";
import { effect } from "zod/v3";

type Notifications = {
    id: string;
    message: string;
}

type TaskPayload = {
    title: string;
    done?: boolean;
}

export default function RealtimeNotifications({groupId}: {groupId: string}) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notifications[]>([]);

    useEffect(() => {
        socket.emit("join-group", groupId);

        function showToast(message: string){
            const id = crypto.randomUUID();
            setNotifications((prev) => [...prev, {id, message}]);

            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, 5000);
        }

        function onTaskCreated(task: TaskPayload){
            showToast(`New task created: ${task.title}`);
            router.refresh();
        }

        function onTaskUpdated(task: TaskPayload){
            showToast(`"${task.title}" marked as ${task.done ? "done" : "not done"}`);
            router.refresh();
        }

        function onTaskDeleted(task: TaskPayload){
            showToast("A task was deleted");
            router.refresh();
        }

        function onGroupDeleted(){
            showToast("This group was deleted");
            router.push("/groups");
        }

        socket.on("task:created", onTaskCreated);
        socket.on("task:updated", onTaskUpdated);
        socket.on("task:deleted", onTaskDeleted);
        socket.on("group:deleted", onGroupDeleted);

        return () => {
            socket.emit("leave-group", groupId);
            socket.off("task:created", onTaskCreated);
            socket.off("task:updated", onTaskUpdated);
            socket.off("task:deleted", onTaskDeleted);
            socket.off("group:deleted", onGroupDeleted);
        }
    }, [groupId, router]); 

    if(notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map((n) => (
                <div 
                    key={n.id} 
                    className="bg-gray-800 text-white px-4 py-2 rounded shadow"
                >
                    {n.message}
                </div>
            ))}
        </div>
    );

}