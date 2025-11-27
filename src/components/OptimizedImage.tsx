import { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    if (priority) {
      setCurrentSrc(src);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    return () => {
      img.onload = null;
    };
  }, [src, priority]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`${className} ${!isLoaded && !priority ? 'blur-sm' : ''} transition-all duration-300`}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
};
