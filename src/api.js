import { readFileSync, writeFileSync, existsSync, unlinkSync, chmodSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

function configDir() {
  if (process.env.XDG_CONFIG_HOME) return process.env.XDG_CONFIG_HOME;
  if (process.platform === 'win32')
    return process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support');
  return join(homedir(), '.config');
}

function tokenPath() {
  return join(configDir(), '.twext-admin-token');
}

export function loadToken() {
  const p = tokenPath();
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8').trim() || null;
}

export function saveToken(token) {
  const p = tokenPath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, token + '\n', 'utf8');
  chmodSync(p, 0o600);
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
  const activeToken = token !== undefined ? token : loadToken();
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
