import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * AUTHORIZATION — single source of truth for OpsConsole.
 *
 * Every user of this app is internal staff by definition (Cloudflare
 * Access, Project 4, already gated who can reach this domain at all).
 * That does NOT mean app-level authorization is unnecessary — Cloudflare
 * Access answers "can this person reach the app," this file answers
 * "what is this person allowed to DO inside it." Treating perimeter
 * access as equivalent to in-app authorization is exactly the mistake
 * this product exists to teach people not to make.
 */

export class UnauthenticatedError extends Error {}
export class ForbiddenError extends Error {}
export class DeactivatedError extends Error {}

export async function getCurrentUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) throw new UnauthenticatedError("No active session");

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@placeholder.local`, // replaced by a Clerk webhook in production
      role: "OPERATOR", // new users default to the lowest-privilege role, never ADMIN
    },
  });

  // A deactivated row still exists (for audit continuity) but must never
  // be treated as an active session — this is the check that makes
  // "deactivate" actually mean something rather than being cosmetic.
  if (!user.active) throw new DeactivatedError("Account deactivated");

  return user;
}

export function requireAdmin(user: User) {
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Admin role required");
  }
}
