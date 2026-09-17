export const siteConfig = {
  name: "M. Dadu Films",
  tagline: "Good People. Great Stories.",
  description:
    "A creative home for filmmakers, actors, storytellers and dreamers — where talent meets opportunity.",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Talent Network", href: "/member" },
    { label: "Casting Calls", href: "/casting" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  contact: {
    email: "m.dadufilms@gmail.com",
    phone: "+91-9211619085, +91-9169235786",
    address: "Lucknow, Uttar Pradesh, India. Noida, Uttar Pradesh, India.",
  },
  legal: {
    gst: "09FQVPS3838A1Z8",
    registration: "ADD_COMPANY_REGISTRATION",
  },
  socials: {
    instagram: "",
    youtube: "",
    linkedin: "",
  },
} as const;
