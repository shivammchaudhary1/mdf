import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  darkInk?: boolean;
};

export function BrandLogo({
  className = "",
  darkInk = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/logo.webp"
      alt="M. Dadu Films"
      width={190}
      height={107}
      priority
      className={`h-auto w-[132px] object-contain ${darkInk ? "brightness-0" : ""} ${className}`}
    />
  );
}
