import { apiRequest } from '../api.js';

export async function versionsCommand(product, log, args) {
  if (!args[0] || !args[0].startsWith('@')) {
    log.error('Usage: twext-admin versions @namespace/id [options]');
    return 1;
  }
  const version = args[1] ?? 'latest';
  const data = await apiRequest(
    product,
    'GET',
    `/${args[0]}/versions/${encodeURIComponent(version)}`,
  );
  log.raw(`Namespace:  ${data.namespace}`);
  log.raw(`ID:         ${data.id}`);
  log.raw(`Version:    ${data.version}`);
  log.raw(`Status:     ${data.status}`);
  log.raw(`Name:       ${data.name}`);
  log.raw(`License:    ${data.license}`);
  if (data.author) log.raw(`Author:     ${data.author}`);
  log.raw(`Created:    ${data.createdAt}`);
  if (data.publishedAt) log.raw(`Published:  ${data.publishedAt}`);
  if (data.dist) log.raw(`Download:   ${data.dist.downloadUrl}`);
  return 0;
}

export async function yankCommand(product, log, args) {
  if (!args[0] || !args[0].startsWith('@')) {
    log.error('Usage: twext-admin yank @namespace/id version');
    return 1;
  }
  const version = args[1];
  if (!version) {
    log.error('Provide a version: twext-admin yank @namespace/id 1.0.0');
    return 1;
  }
  await apiRequest(product, 'DELETE', `/${args[0]}/versions/${encodeURIComponent(version)}`);
  log.success(`Yanked @${args[0].slice(1)} v${version}`);
  return 0;
}

export async function downloadCommand(product, log, args, values) {
  if (!args[0] || !args[0].startsWith('@')) {
    log.error('Usage: twext-admin download @namespace/id version [-o output.js]');
    return 1;
  }
  const version = args[1] ?? 'latest';
  const base = product.defaults.apiBase.replace(/\/+$/, '');
  const url = `${base}/${args[0]}/versions/${encodeURIComponent(version)}/download`;
  log.progress(`Downloading ${args[0]} v${version}...`);
  const res = await fetch(url);
  if (!res.ok) {
    log.error(`Download failed: HTTP ${res.status}`);
    return 1;
  }
  const code = await res.text();
  if (values.out) {
    const { writeFileSync, mkdirSync } = await import('node:fs');
    const { dirname } = await import('node:path');
    mkdirSync(dirname(values.out), { recursive: true });
    writeFileSync(values.out, code, 'utf8');
    log.success(`Saved to ${values.out}`);
  } else {
    log.raw(code);
  }
  return 0;
}
