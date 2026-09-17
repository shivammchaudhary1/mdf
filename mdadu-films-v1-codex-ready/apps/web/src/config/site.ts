import { routes } from "@/config/routes";

/**
 * Development fallback configuration.
 *
 * Administrator-editable company/public content will move to the Settings API
 * when that module is implemented. Do not add real mutable business content
 * directly to page components.
 */
export const siteConfig = {
  name: "M. Dadu Films",
  tagline: "Good People. Great Stories.",
  description:
    "A creative home for filmmakers, actors, storytellers and dreamers — where talent meets opportunity.",
  navigation: [
    { label: "Home", href: routes.home },
    { label: "Projects", href: routes.projects },
    { label: "Talent Network", href: routes.member },
    { label: "Casting Calls", href: routes.casting },
    { label: "Blog", href: routes.blog },
    { label: "About", href: routes.about },
    { label: "Contact", href: routes.contact },
  ],
  contact: {
    email: "ADD_REAL_EMAIL",
    phone: "ADD_REAL_PHONE",
    address: "ADD_REAL_ADDRESS",
  },
  legal: {
    gst: "ADD_GST_NUMBER",
    registration: "ADD_COMPANY_REGISTRATION",
  },
  socials: {
    instagram: "",
    youtube: "",
    linkedin: "",
  },
} as const;
