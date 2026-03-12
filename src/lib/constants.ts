/** Standard delivery fee in pence — Royal Mail Tracked 48 */
export const SHIPPING_FEE_MINOR = 395;

export const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
  delivery: "/delivery",
  refunds: "/refunds",
  privacy: "/privacy",
  terms: "/terms",
  signIn: "/sign-in",
  signUp: "/sign-up",
  account: "/account",
  accountOrders: "/account/orders",
  accountConsultations: "/account/consultations",
  accountProfile: "/account/profile",
  accountAddresses: "/account/addresses",
  cart: "/cart",
  checkout: "/checkout",
  checkoutConfirmation: "/checkout/confirmation",
  admin: "/admin",
  consultation: "/consultations/mounjaro",
  consultationUploadPhotos: "/consultations/mounjaro/upload-photos",
  consultationSelectDose: "/consultations/mounjaro/select-dose",
  collection: (slug: string) => `/collections/${slug}` as const,
  product: (slug: string) => `/products/${slug}` as const,
} as const;

export const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.collection("weight-loss"), label: "Weight Loss" },
  { href: ROUTES.collection("vitamins-supplements"), label: "Vitamins & Supplements" },
  { href: ROUTES.collection("digestive-health"), label: "Digestive Health" },
  { href: ROUTES.collection("stress-sleep"), label: "Stress & Sleep" },
  { href: "/blog", label: "Blog" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

export const SHOP_LINKS = [
  { href: ROUTES.collection("weight-loss"), label: "Weight Loss" },
  { href: ROUTES.collection("vitamins-supplements"), label: "Vitamins & Supplements" },
  { href: ROUTES.collection("digestive-health"), label: "Digestive Health" },
  { href: ROUTES.collection("stress-sleep"), label: "Stress & Sleep" },
  { href: ROUTES.collection("joint-support"), label: "Joint Support" },
  { href: ROUTES.collection("skin-care"), label: "Skin Care" },
  { href: ROUTES.collection("first-aid"), label: "First Aid" },
] as const;

export const SUPPORT_LINKS = [
  { href: ROUTES.delivery, label: "Delivery Information" },
  { href: ROUTES.refunds, label: "Returns & Refunds" },
  { href: ROUTES.contact, label: "Contact Us" },
  { href: ROUTES.privacy, label: "Privacy Policy" },
  { href: ROUTES.terms, label: "Terms & Conditions" },
] as const;

export const ADMIN_NAV = [
  { href: ROUTES.admin, label: "Dashboard" },
  { href: "/admin/consultations", label: "Consultations" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/fulfillment", label: "Fulfillment" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/users", label: "Users" },
] as const;
