import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../api';

const PAGE_SIZE = 15;

// Filtre, sayfalama ve eski isteklerin elenmesi aynı yerde yönetilir.
export function useFeedPosts(type, client = api) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const requestId = useRef(0);
  const pending = useRef(false);
  const activeType = useRef(type);

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (activeType.current !== type) return;
    if (pageNum > 1 && pending.current) return;
    const id = ++requestId.current;
    pending.current = true;
    if (pageNum === 1) {
      setLoading(true);
      setLoadingMore(false);
      setHasMore(false);
      if (reset) { setPosts([]); setTotal(0); }
    } else setLoadingMore(true);
    try {
      const params = { page: pageNum, limit: PAGE_SIZE };
      if (type !== 'all') params.type = type;
      const res = await client.get('/posts', { params });
      if (id !== requestId.current) return;
      const incoming = res.data.posts || [];
      const serverTotal = res.data.total ?? incoming.length;
      setPosts(previous => reset || pageNum === 1 ? incoming : [...previous, ...incoming]);
      setTotal(serverTotal);
      setHasMore(pageNum * PAGE_SIZE < serverTotal);
      setPage(pageNum);
    } catch (error) {
      if (id === requestId.current) console.error(error);
    } finally {
      if (id === requestId.current) {
        pending.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [type, client]);

  useEffect(() => {
    activeType.current = type;
    fetchPosts(1, true);
    return () => { requestId.current += 1; pending.current = false; };
  }, [fetchPosts, type]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) fetchPosts(page + 1);
  };

  return { posts, setPosts, loading, loadingMore, hasMore, total, fetchPosts, handleLoadMore };
}
