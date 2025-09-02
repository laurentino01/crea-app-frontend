import React from "react";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function stringToHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function gradientFromName(name: string) {
  const hash = stringToHash(name.trim().toLowerCase());

  // Constrain hues to cool range prioritizing violet/purple/fuchsia
  // Band ~ [255, 315] (violet 270 -> fuchsia/magenta ~300)
  const bandMin = 255;
  const bandMax = 315;
  const bandSize = bandMax - bandMin + 1;

  const h1 = bandMin + (hash % bandSize);
  const offset = 18 + (hash % 22); // 18..39 deg separation
  const h2 = bandMin + ((h1 - bandMin + offset) % bandSize);

  // Slight variation in saturation/lightness, kept vivid and readable
  const s1 = 65 + (hash % 12); // 65..76
  const s2 = 68 + ((hash >> 3) % 10); // 68..77
  const l1 = 50 - ((hash >> 2) % 8); // 42..50 biased darker
  const l2 = 55 - ((hash >> 4) % 10); // 45..55

  const angle = 140 + (hash % 80); // 140-219deg for subtle variety
  return `linear-gradient(${angle}deg, hsl(${h1} ${s1}% ${l1}%), hsl(${h2} ${s2}% ${l2}%))`;
}

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-lg",
  };

  const background = gradientFromName(name || initials || "?");

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-extrabold shadow ${sizeClasses[size]} ${className}`}
      style={{ background }}
      aria-label={`Avatar de ${name}`}
    >
      {initials || "?"}
    </div>
  );
}
