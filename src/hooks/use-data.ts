'use client';

import { useState, useEffect } from 'react';

type DataType = 'services' | 'portfolio' | 'team' | 'testimonials' | 'blog';

export function useData<T>(type: DataType) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data/${type}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [type]);

  return { data, loading };
}

export function useSinglePost(slug: string) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/data/blog/${slug}`)
      .then((res) => res.json())
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return { post, loading };
}
