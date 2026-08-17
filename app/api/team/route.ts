import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getCurrentUser,
  requireAdmin,
  UnauthenticatedError,
  ForbiddenError,
  DeactivatedError,
} from "@/lib/auth";
import { inviteUserSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await getCurrentUser(); // OPERATOR and ADMIN can both view the roster
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(users);
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    requireAdmin(user); // only ADMIN can invite

    const body = await req.json();
    const parsed = inviteUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid invite data" }, { status: 400 });
    }

    // Invitation goes through Clerk's own flow — no local password/session
    // handling. The invited person's User row is created on their first
    // sign-in (see getCurrentUser's upsert), always starting as OPERATOR
    // regardless of what's requested here; a second, explicit role-change
    // step is required to actually grant ADMIN. That extra step is
    // deliberate — see Project 4/6 briefs on admin access governance.
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: parsed.data.email,
      publicMetadata: { requestedRole: parsed.data.role },
    });

    await logAudit({
      actorId: user.id,
      action: "user.invited",
      target: parsed.data.email,
      metadata: { requestedRole: parsed.data.role },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
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
