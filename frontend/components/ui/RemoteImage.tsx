"use client";

import Image, { type ImageProps } from "next/image";
import { isAllowedRemoteImage, isValidImageUrl } from "@/lib/remote-images";
import { getImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";

type RemoteImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
};

/** Uses next/image when host is allowed; otherwise native img. Always resolves API-relative paths. */
export function RemoteImage({
  src,
  alt,
  fallback = null,
  fill,
  className,
  width,
  height,
  onError,
  ...props
}: RemoteImageProps) {
  const resolved = getImageUrl(src);
  const isPlaceholder = resolved === PRODUCT_IMAGE_PLACEHOLDER;

  if (isPlaceholder) {
    return <>{fallback}</>;
  }

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER;
    onError?.(e);
  };

  const useNextImage = isValidImageUrl(resolved) && isAllowedRemoteImage(resolved);

  if (useNextImage) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill={fill}
        className={className}
        width={width}
        height={height}
        onError={handleError}
        unoptimized={resolved.startsWith("http://")}
        {...props}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className={["absolute inset-0 h-full w-full object-cover", className].filter(Boolean).join(" ")}
        onError={handleError}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      className={className}
      onError={handleError}
    />
  );
}
