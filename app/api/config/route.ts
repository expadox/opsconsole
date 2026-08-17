import { NextResponse } from "next/server";
import { getCurrentUser, UnauthenticatedError, DeactivatedError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await getCurrentUser();
    const settings = await prisma.configSetting.findMany();
    return NextResponse.json(settings);
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
