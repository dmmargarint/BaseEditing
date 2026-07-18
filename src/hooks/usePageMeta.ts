import { useEffect } from 'react';

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (tag) tag.content = description;
  }, [title, description]);
}
