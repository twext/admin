import { apiRequest } from '../api.js';

export async function queueCommand(product, log, values) {
  const data = await apiRequest(product, 'GET', '/versions', {
    query: { status: 'pending', cursor: values.cursor, limit: values.limit },
  });
  if (!data.data.length) {
    log.success('Review queue is empty');
    return 0;
  }
  for (const v of data.data) {
    log.raw(`@${v.namespace}/${v.id}  v${v.version}  ${v.name}`);
    if (v.description) log.bullet(v.description);
    log.bullet(`Submitted: ${v.createdAt}`);
  }
  if (data.pagination.hasMore) {
    log.progress(`More results available. Use --cursor ${data.pagination.nextCursor}`);
  }
  return 0;
}

export async function approveCommand(product, log, args, values) {
  if (!args[0] || !args[0].startsWith('@')) {
    log.error('Usage: twext-admin approve @namespace/id version');
    return 1;
  }
  const version = args[1];
  if (!version) {
    log.error('Provide a version: twext-admin approve @namespace/id 1.0.0');
    return 1;
  }
  void values;
  const result = await apiRequest(product, 'PATCH', `/${args[0]}/versions/${version}`, {
    body: { status: 'approved' },
  });
  log.success(`Approved @${result.namespace}/${result.id} v${result.version}`);
  return 0;
}

export async function rejectCommand(product, log, args, values) {
  if (!args[0] || !args[0].startsWith('@')) {
    log.error('Usage: twext-admin reject @namespace/id version [--reason "..."]');
    return 1;
  }
  const version = args[1];
  if (!version) {
    log.error('Provide a version: twext-admin reject @namespace/id 1.0.0');
    return 1;
  }
  void values;
  const reason = values.reason;
  if (!reason) {
    log.error('Provide a reason: --reason "Inappropriate content"');
    return 1;
  }
  const result = await apiRequest(product, 'PATCH', `/${args[0]}/versions/${version}`, {
    body: { status: 'rejected', reason },
  });
  log.success(`Rejected @${result.namespace}/${result.id} v${result.version}`);
  return 0;
}
