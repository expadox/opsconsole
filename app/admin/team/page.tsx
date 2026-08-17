import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InviteForm from "./invite-form";
import UserRow from "./user-row";

export default async function TeamPage() {
  const currentUser = await getCurrentUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Team</h1>
      </div>

      {currentUser.role === "ADMIN" && <InviteForm />}

      <div className="mt-6">
        {users.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            canManage={currentUser.role === "ADMIN" && u.id !== currentUser.id}
          />
        ))}
      </div>
    </div>
  );
}
