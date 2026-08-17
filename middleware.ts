import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only the sign-in pages are public. Cloudflare Access (Project 4) is the
// perimeter control that decides who can reach this domain at all — this
// middleware is the app-layer session check underneath it. Two layers,
// on purpose: losing one shouldn't mean losing both.
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
