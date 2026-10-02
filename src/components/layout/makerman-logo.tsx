import { Link } from "@tanstack/react-router";

interface MakermanLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  showLink?: boolean;
}

export function MakermanLogo({
  className = "",
  size = "md",
  showLink = true,
}: MakermanLogoProps) {
  const sizeClasses = {
    sm: "h-11 md:h-12 w-auto",
    md: "h-14 md:h-16 w-auto",
    lg: "h-20 md:h-24 w-auto",
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src="/images/makerman-logo.png"
        alt="MAKERMAN — Feeling Happiness"
        className={`${sizeClasses} object-contain transition-transform duration-300 hover:scale-[1.02] mix-blend-multiply dark:mix-blend-normal`}
        loading="eager"
        decoding="async"
        width={300}
        height={194}
      />
    </div>
  );

  if (!showLink) {
    return content;
  }

  return (
    <Link
      to="/"
      aria-label="Makerman — Home"
      className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
    >
      {content}
    </Link>
  );
}
