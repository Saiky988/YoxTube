import { useEffect, useRef } from 'react';

const SITE_NAME = 'YoxTube';

/**
 * Cập nhật document.title theo từng trang.
 * - Truyền string → "Trang chủ — YoxTube"
 * - Truyền undefined/null → giữ "YoxTube — Cinematic Streaming" (mặc định)
 * - Tự phục hồi title trước đó khi component unmount.
 */
export function useDocumentTitle(title?: string | null) {
  const prevTitle = useRef(document.title);

  useEffect(() => {
    if (title) {
      document.title = `${title} — ${SITE_NAME}`;
    } else {
      document.title = `${SITE_NAME} — Cinematic Streaming`;
    }

    return () => {
      document.title = prevTitle.current;
    };
  }, [title]);
}
