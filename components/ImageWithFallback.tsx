"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src"> & { src?: string };

const ImageWithFallback = ({ src = "", alt, ...rest }: Props) => {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...rest}
      alt={alt}
      src={imgSrc || "/assets/images/dummy.jpg"}
      onError={() => setImgSrc("/assets/images/dummy.jpg")}
    />
  );
};

export default ImageWithFallback;
