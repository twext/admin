import { apiRequest } from '../api.js';

export async function statsCommand(product, log) {
  const stats = await apiRequest(product, 'GET', '/stats');
  log.raw(`Published extensions: ${stats.published}`);
  log.raw(`Pending review:       ${stats.pending}`);
  log.raw(`Authors:              ${stats.authors}`);
  return 0;
}

export async function metaCommand(product, log) {
  const meta = await apiRequest(product, 'GET', '/meta');
  log.raw(`${meta.name} v${meta.version}`);
  log.raw(meta.tagline);
  log.raw(meta.homepage);
  return 0;
}
