import { apiRequest } from '../api.js';

export async function tokensCommand(product, log, sub, rest, values) {
  switch (sub) {
    case 'list':
    case 'ls':
      return listTokens(product, log, values);
    case 'create':
    case 'new':
      return createToken(product, log, rest, values);
    case 'update':
    case 'set':
      return updateToken(product, log, rest, values);
    case 'delete':
    case 'rm':
      return deleteToken(product, log, rest);
    default:
      console.log(tokensHelp(product));
      return sub ? 1 : 0;
  }
}

async function listTokens(product, log, values) {
  const data = await apiRequest(product, 'GET', '/tokens', {
    query: { namespace: values.namespace, cursor: values.cursor, limit: values.limit },
  });
  if (!data.data.length) {
    log.warn('No automation tokens');
    return 0;
  }
  for (const t of data.data) {
    log.raw(`${t.id}  ${t.name}  [${t.scopes.join(', ')}]`);
    if (t.expiresAt) log.bullet(`Expires: ${t.expiresAt}`);
    if (t.lastUsedAt) log.bullet(`Last used: ${t.lastUsedAt}`);
  }
  if (data.pagination.hasMore) {
    log.progress(`More results available. Use --cursor ${data.pagination.nextCursor}`);
  }
  return 0;
}

async function createToken(product, log, args, values) {
  const name = args[0] ?? values.name;
  if (!name) {
    log.error('Usage: twext-admin tokens create <name> --scopes publish,yank');
    return 1;
  }
  const scopes = (values.scopes ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!scopes.length) {
    log.error('Provide scopes: --scopes publish,yank');
    return 1;
  }
  const body = { name, scopes };
  if (values['expires-in-days']) {
    const days = Number(values['expires-in-days']);
    if (!Number.isFinite(days) || days <= 0) {
      log.error('Invalid --expires-in-days value; provide a positive number of days');
      return 1;
    }
    body.expiresInDays = days;
  }
  if (!process.stdout.isTTY) {
    log.error('Cannot display the token: stdout is not an interactive terminal');
    return 1;
  }
  const data = await apiRequest(product, 'POST', '/tokens', { body });
  log.success(`Created token "${data.name}" (${data.id})`);
  log.warn(`Save this token now — it won't be shown again:`);
  log.secret(data.token);
  return 0;
}

async function updateToken(product, log, args, values) {
  if (!args[0]) {
    log.error('Usage: twext-admin tokens update <id> [--name "..."] [--scopes publish,yank]');
    return 1;
  }
  const body = {};
  if (values.name) body.name = values.name;
  if (values.scopes)
    body.scopes = values.scopes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  if (!Object.keys(body).length) {
    log.error('No fields to update. Use --name or --scopes.');
    return 1;
  }
  const data = await apiRequest(product, 'PATCH', `/tokens/${args[0]}`, { body });
  log.success(`Updated token "${data.name}" (${data.id})`);
  return 0;
}

async function deleteToken(product, log, args) {
  if (!args[0]) {
    log.error('Usage: twext-admin tokens delete <id>');
    return 1;
  }
  await apiRequest(product, 'DELETE', `/tokens/${args[0]}`);
  log.success(`Deleted token ${args[0]}`);
  return 0;
}

function tokensHelp(product) {
  return `Usage: ${product.command} tokens <subcommand> [options]

Subcommands:
  list                             List your automation tokens
  create <name> [options]          Create a new automation token
  update <id> [options]            Rename or rescope a token
  delete <id>                      Revoke a token

Options:
  --scopes <publish,yank>    Comma-separated scopes (create, update)
  --name <name>              New name (update)
  --expires-in-days <n>      Token lifetime in days (create)
  --namespace <ns>           Inspect another user's tokens (admin, list)
  --cursor <cursor>          Pagination cursor (list)
  --limit <n>                Results per page (list)`;
}

export { tokensHelp };
