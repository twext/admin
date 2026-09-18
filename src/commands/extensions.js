import { apiRequest } from '../api.js';

export async function extensionsCommand(product, log, sub, rest, values) {
  switch (sub) {
    case 'list':
    case 'ls':
      return listExtensions(product, log, values);
    case 'get':
    case 'show':
      return getExtension(product, log, rest);
    case 'delete':
    case 'rm':
      return deleteExtension(product, log, rest);
    default:
      console.log(extensionsHelp(product));
      return sub ? 1 : 0;
  }
}

async function listExtensions(product, log, values) {
  const data = await apiRequest(product, 'GET', '/extensions', {
    query: { cursor: values.cursor, limit: values.limit },
  });
  if (!data.data.length) {
    log.warn('No extensions found');
    return 0;
  }
  for (const ext of data.data) {
    log.raw(`@${ext.namespace}/${ext.id}  v${ext.version}  ${ext.name}`);
  }
  if (data.pagination.hasMore) {
    log.progress(`More results available. Use --cursor ${data.pagination.nextCursor}`);
  }
  return 0;
}

async function getExtension(product, log, args) {
  const ref = args[0];
  if (!ref || !ref.startsWith('@')) {
    log.error('Usage: twext-admin extensions get @namespace/id');
    return 1;
  }
  const ext = await apiRequest(product, 'GET', `/${ref}`);
  log.raw(`Name:        ${ext.name}`);
  log.raw(`ID:          ${ext.id}`);
  log.raw(`Namespace:   ${ext.namespace}`);
  log.raw(`Author:      ${ext.author || '(none)'}`);
  log.raw(`License:     ${ext.license}`);
  log.raw(`Description: ${ext.description || '(none)'}`);
  log.raw(`Published:   ${ext.publishedAt}`);
  if (ext.color1)
    log.raw(
      `Color:       ${ext.color1}${ext.color2 ? ' ' + ext.color2 : ''}${ext.color3 ? ' ' + ext.color3 : ''}`,
    );
  log.raw(`Versions:`);
  for (const v of ext.versions) {
    const marker = v.status === 'published' ? '' : ` [${v.status}]`;
    log.bullet(`v${v.version}${marker}  (${v.createdAt})`);
  }
  return 0;
}

async function deleteExtension(product, log, args) {
  const ref = args[0];
  if (!ref || !ref.startsWith('@')) {
    log.error('Usage: twext-admin extensions delete @namespace/id');
    return 1;
  }
  await apiRequest(product, 'DELETE', `/${ref}`);
  log.success(`Deleted ${ref}`);
  return 0;
}

export async function searchCommand(product, log, args, values) {
  const query = args[0] ?? values.query;
  if (!query) {
    console.log(searchHelp(product));
    return 1;
  }
  const data = await apiRequest(product, 'GET', '/search', {
    query: { query, cursor: values.cursor, limit: values.limit },
  });
  if (!data.data.length) {
    log.warn('No results');
    return 0;
  }
  for (const ext of data.data) {
    log.raw(`@${ext.namespace}/${ext.id}  v${ext.version}  ${ext.name}`);
    if (ext.description) log.bullet(ext.description);
  }
  if (data.pagination.hasMore) {
    log.progress(`More results available. Use --cursor ${data.pagination.nextCursor}`);
  }
  return 0;
}

function extensionsHelp(product) {
  return `Usage: ${product.command} extensions <subcommand> [options]

Subcommands:
  list                         List published extensions
  get <@namespace/id>          View extension details and versions
  delete <@namespace/id>       Delete an extension and all its versions

Options:
  --cursor <cursor>   Pagination cursor (list)
  --limit <n>         Results per page (list)`;
}

function searchHelp(product) {
  return `Usage: ${product.command} search <query> [options]

Options:
  --cursor <cursor>   Pagination cursor
  --limit <n>         Results per page`;
}

export { extensionsHelp, searchHelp };
