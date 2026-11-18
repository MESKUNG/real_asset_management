"use client";

import Image from "next/image";
import { useState } from "react";

type StaffProfileImageProps = {
  src: string;
  alt: string;
  initials: string;
  size: number;
};

export default function StaffProfileImage({
  src,
  alt,
  initials,
  size,
}: StaffProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const shouldShowImage = src.startsWith("https://") && !hasError;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 font-semibold uppercase text-violet-600"
      style={{ width: size, height: size }}
    >
      {shouldShowImage ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          onError={() => setHasError(true)}
          className="size-full object-cover"
        />
      ) : (
        <span role="img" aria-label={alt} className="text-sm">
          {initials || "?"}
        </span>
      )}
    </span>
  );
}
