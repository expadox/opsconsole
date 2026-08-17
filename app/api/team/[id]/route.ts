import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUser,
  requireAdmin,
  UnauthenticatedError,
  ForbiddenError,
  DeactivatedError,
} from "@/lib/auth";
import { updateUserSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    requireAdmin(currentUser);

    // An admin can't deactivate or demote themselves through this route —
    // that has to happen through a second admin, so a single compromised
    // or careless session can't lock everyone else out or grant itself
    // more power than it started with.
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account here" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
    });

    if (parsed.data.role !== undefined) {
      await logAudit({
        actorId: currentUser.id,
        action: "user.role_changed",
        target: params.id,
        metadata: { from: target.role, to: parsed.data.role },
      });
    }
    if (parsed.data.active !== undefined) {
      await logAudit({
        actorId: currentUser.id,
        action: parsed.data.active ? "user.reactivated" : "user.deactivated",
        target: params.id,
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    return handleAuthError(e);
  }
}

function handleAuthError(e: unknown) {
  if (e instanceof UnauthenticatedError) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (e instanceof DeactivatedError) {
    return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
  }
  if (e instanceof ForbiddenError) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  throw e;
}
