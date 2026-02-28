import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoomList } from "@/components/rooms/RoomList";

export default async function RoomsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user's rooms
  const memberships = await prisma.roomMember.findMany({
    where: { userId: session.userId },
    include: {
      room: {
        include: {
          owner: {
            select: { username: true },
          },
          _count: {
            select: {
              members: true,
              clipboard: true,
            },
          },
        },
      },
    },
  });

  const rooms = memberships.map((membership) => ({
    id: membership.room.id,
    name: membership.room.name,
    description: membership.room.description,
    code: membership.room.code,
    role: membership.role,
    memberCount: membership.room._count.members,
    clipboardCount: membership.room._count.clipboard,
    createdAt: membership.room.createdAt,
  }));

  return <RoomList initialRooms={rooms} />;
}
