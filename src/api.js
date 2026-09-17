import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

function tokenPath() {
  return join(process.cwd(), '.twext-admin-token');
}

export function loadToken() {
  const p = tokenPath();
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8').trim() || null;
}

export function saveToken(token) {
  writeFileSync(tokenPath(), token + '\n', 'utf8');
}

export function clearToken() {
  const p = tokenPath();
  if (existsSync(p)) unlinkSync(p);
}

export async function apiRequest(product, method, path, { token, body, query } = {}) {
  const base = product.defaults.apiBase.replace(/\/+$/, '');
  const url = new URL(`${base}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers = { 'Content-Type': 'application/json' };
  const activeToken = token ?? loadToken();
  if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url.toString(), opts);
  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail = data?.detail ?? data?.title ?? text ?? `HTTP ${res.status}`;
    throw new Error(detail);
  }

  return data;
}
