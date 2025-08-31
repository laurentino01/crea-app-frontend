import React from "react";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold shadow ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
