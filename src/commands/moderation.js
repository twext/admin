import { apiRequest } from '../api.js';

function parsePackageTarget(ref) {
  if (typeof ref !== 'string' || !ref.startsWith('@')) return null;
  const rest = ref.slice(1);
  const slash = rest.indexOf('/');
  if (slash <= 0 || slash === rest.length - 1) return null;
  return { namespace: rest.slice(0, slash), id: rest.slice(slash + 1) };
}

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
  if (!parsePackageTarget(args[0])) {
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
  if (!parsePackageTarget(args[0])) {
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
