import { NextResponse } from "next/server";
import { getCurrentUser, UnauthenticatedError, DeactivatedError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await getCurrentUser();
    const entries = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: true },
    });
    return NextResponse.json(entries);
  } catch (e) {
    if (e instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (e instanceof DeactivatedError) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }
    throw e;
  }
}
