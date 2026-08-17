import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUser,
  requireAdmin,
  UnauthenticatedError,
  ForbiddenError,
  DeactivatedError,
} from "@/lib/auth";
import { updateConfigSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const user = await getCurrentUser();
    requireAdmin(user); // OPERATOR can view config (Project spec) but never edit it

    const body = await req.json();
    const parsed = updateConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    const previous = await prisma.configSetting.findUnique({
      where: { key: params.key },
    });

    const updated = await prisma.configSetting.upsert({
      where: { key: params.key },
      create: { key: params.key, value: parsed.data.value, updatedBy: user.id },
      update: { value: parsed.data.value, updatedBy: user.id },
    });

    // Old/new value logged for accountability — this is exactly the kind
    // of change a go-live checklist (Project 6) needs to be able to trace.
    await logAudit({
      actorId: user.id,
      action: "config.updated",
      target: params.key,
      metadata: { from: previous?.value ?? null, to: parsed.data.value },
    });

    return NextResponse.json(updated);
  } catch (e) {
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
}
