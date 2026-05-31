import { useMemo, useRef, useState } from "react";

import {
  buildBookPlaceholderCover,
  normalizeThumbnailUrl,
  resolveFallbackBookCover,
} from "../../lib/bookCoverResolver";

const MISSING_COVER_SENTINEL = "/__mindcare_missing_cover__.png";

const BookCoverImage = ({ title, author, thumbnail, alt, className = "", loading = "lazy" }) => {
  const placeholder = useMemo(() => buildBookPlaceholderCover(title, author), [title, author]);
  const initialSrc = normalizeThumbnailUrl(thumbnail) || MISSING_COVER_SENTINEL;
  const [src, setSrc] = useState(initialSrc);
  const hasTriedFallbackRef = useRef(false);

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
    />
  );
};

export default BookCoverImage;
