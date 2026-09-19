import { type PlaceholderKind, SmartImage } from "@/components/ui/smart-image";

type SiteMediaProps = {
  src?: string;
  alt: string;
  kind?: PlaceholderKind;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function SiteMedia({
  src,
  alt,
  kind = "generic",
  className = "aspect-[4/3]",
  imageClassName = "",
  priority = false,
}: SiteMediaProps) {
  return (
    <div className={`relative overflow-hidden bg-[#ecebe8] ${className}`}>
      <SmartImage
        src={src}
        alt={alt}
        placeholderKind={kind}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`object-cover ${imageClassName}`}
      />
    </div>
  );
}
