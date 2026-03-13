import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/account/",
          "/api/",
          "/consultations/mounjaro/",
          "/checkout/",
          "/cart",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: [
      "https://rootspharmacy.co.uk/sitemap.xml",
      "https://rootspharmacy.co.uk/google-feed.xml",
    ],
  };
}
