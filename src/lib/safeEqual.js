import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string compare. Length mismatch still hashes equal-length
 * buffers so the early-return is not a pure short-circuit on secret size.
 */
export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''), 'utf8');
  const right = Buffer.from(String(b ?? ''), 'utf8');
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}
