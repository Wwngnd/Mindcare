import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildBookPlaceholderCover,
  normalizeThumbnailUrl,
  resolveFallbackBookCover,
} from "../../lib/bookCoverResolver";

const BookCoverImage = ({
  title,
  author,
  thumbnail,
  alt,
  className = "",
  loading = "lazy",
  preferResolvedCover = false,
}) => {
  const placeholder = useMemo(() => buildBookPlaceholderCover(title, author), [title, author]);
  const normalizedThumbnail = normalizeThumbnailUrl(thumbnail);
  const shouldResolveFallbackFirst = preferResolvedCover || !normalizedThumbnail;
  const initialSrc = shouldResolveFallbackFirst ? placeholder : normalizedThumbnail;
  const [src, setSrc] = useState(initialSrc);
  const hasTriedFallbackRef = useRef(false);

  useEffect(() => {
    if (!shouldResolveFallbackFirst) return undefined;

    let cancelled = false;
    hasTriedFallbackRef.current = true;

    resolveFallbackBookCover(title, author)
      .then((fallback) => {
        if (cancelled) return;
        const normalizedFallback = normalizeThumbnailUrl(fallback);
        setSrc(normalizedFallback || normalizedThumbnail || placeholder);
      })
      .catch(() => {
        if (!cancelled) setSrc(normalizedThumbnail || placeholder);
      });

    return () => {
      cancelled = true;
    };
  }, [author, normalizedThumbnail, placeholder, shouldResolveFallbackFirst, title]);

  const handleError = () => {
    if (!src || src.startsWith("data:image/svg+xml")) {
      setSrc(placeholder);
      return;
    }

    if (hasTriedFallbackRef.current) {
      setSrc(placeholder);
      return;
    }

    hasTriedFallbackRef.current = true;
    resolveFallbackBookCover(title, author)
      .then((fallback) => {
        const normalizedFallback = normalizeThumbnailUrl(fallback);
        if (!normalizedFallback || normalizedFallback === src) {
          setSrc(placeholder);
          return;
        }
        setSrc(normalizedFallback);
      })
      .catch(() => {
        setSrc(placeholder);
      });
  };

  return (
    <img
      src={src}
      alt={alt || title}
      className={className}
      loading={loading}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
};

export default BookCoverImage;
