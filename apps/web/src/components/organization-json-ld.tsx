import { PUBLIC_COMPANY, PUBLIC_SERVICE_AREAS } from "@/config/company";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: PUBLIC_COMPANY.name,
    ...(PUBLIC_COMPANY.legalName ? { legalName: PUBLIC_COMPANY.legalName } : {}),
    url: PUBLIC_COMPANY.website,
    logo: `${PUBLIC_COMPANY.website}/brand/logo.webp`,
    email: PUBLIC_COMPANY.email,
    telephone: PUBLIC_COMPANY.phone,
    description: PUBLIC_COMPANY.description,
    areaServed: ["Lucknow", "Noida", "Uttar Pradesh", "India"],
    knowsAbout: PUBLIC_SERVICE_AREAS,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
