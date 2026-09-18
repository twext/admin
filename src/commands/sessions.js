import { apiRequest } from '../api.js';

export async function sessionsCommand(product, log, sub, rest, values) {
  switch (sub) {
    case 'list':
    case 'ls':
      return listSessions(product, log, values);
    case 'revoke':
    case 'delete':
    case 'rm':
      return revokeSession(product, log, rest);
    default:
      console.log(sessionsHelp(product));
      return sub ? 1 : 0;
  }
}

async function listSessions(product, log, values) {
  const data = await apiRequest(product, 'GET', '/sessions', {
    query: { namespace: values.namespace, cursor: values.cursor, limit: values.limit },
  });
  if (!data.data.length) {
    log.warn('No active sessions');
    return 0;
  }
  for (const s of data.data) {
    log.raw(`ID:        ${s.id}`);
    log.bullet(`Created:   ${s.createdAt}`);
    log.bullet(`Expires:   ${s.expiresAt}`);
    if (s.lastUsedAt) log.bullet(`Last used: ${s.lastUsedAt}`);
  }
  if (data.pagination.hasMore) {
    log.progress(`More results available. Use --cursor ${data.pagination.nextCursor}`);
  }
  return 0;
}

async function revokeSession(product, log, args) {
  if (!args[0]) {
    log.error('Usage: twext-admin sessions revoke <id>');
    return 1;
  }
  await apiRequest(product, 'DELETE', `/sessions/${args[0]}`);
  log.success(`Revoked session ${args[0]}`);
  return 0;
}

function sessionsHelp(product) {
  return `Usage: ${product.command} sessions <subcommand> [options]

Subcommands:
  list               List active sessions
  revoke <id>        Revoke a session

Options:
  --namespace <ns>   Inspect another user's sessions (admin, list)
  --cursor <cursor>  Pagination cursor (list)
  --limit <n>        Results per page (list)`;
}

export { sessionsHelp };
