import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes — accessible without auth
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/delivery",
  "/refunds",
  "/return-policy",
  "/blog(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/collections(.*)",
  "/supplements",
  "/products(.*)",
  "/cart",
  "/checkout/guest(.*)",
  "/checkout/confirmation(.*)",
  "/consultations/mounjaro",
  "/api/search",
  "/api/clerk/webhook",
  "/api/mollie/webhook",
  "/api/inngest(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
