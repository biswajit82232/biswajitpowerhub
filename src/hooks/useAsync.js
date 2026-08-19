import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic async data hook with loading/error/data + refetch.
 * refetch() returns a Promise that settles when the load finishes.
 * @param {() => Promise<any>} asyncFn
 * @param {Array} deps
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const genRef = useRef(0);
  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  const run = useCallback(() => {
    const gen = ++genRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    return Promise.resolve()
      .then(() => asyncFnRef.current())
      .then((data) => {
        if (gen !== genRef.current) return data;
        setState({ data, loading: false, error: null });
        return data;
      })
      .catch((error) => {
        if (gen !== genRef.current) throw error;
        setState((s) => ({ data: s.data, loading: false, error }));
        throw error;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run().catch(() => {});
  }, [run]);

  return { ...state, refetch: run };
}
