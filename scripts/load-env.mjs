/**
 * Shared dotenv reader for the Node scripts.
 *
 * Mirrors Vite's precedence (.env then .env.local overriding it) so `db:check`
 * and `db:migrate` see the same values the app does. `vercel env pull` writes
 * quoted values, so surrounding quotes are stripped.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Values Vercel writes for secrets it will not expose locally. */
const PLACEHOLDERS = new Set(['**ENCRYPTED**', '']);

function parseFile(name, env) {
  let raw;
  try {
    raw = readFileSync(resolve(root, name), 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed
      .slice(i + 1)
      .trim()
      .replace(/^(["'])([\s\S]*)\1$/, '$2');
    env[key] = value;
  }
}

export function loadEnv() {
  const env = {};
  parseFile('.env', env);
  parseFile('.env.local', env);
  for (const [k, v] of Object.entries(env)) {
    if (PLACEHOLDERS.has(v)) delete env[k];
  }
  return { ...env, ...process.env };
}
