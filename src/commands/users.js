import { apiRequest } from '../api.js';

export async function usersCommand(product, log, sub, rest, values) {
  switch (sub) {
    case 'list':
    case 'ls':
      return listUsers(product, log, values);
    case 'get':
    case 'show':
      return getUser(product, log, rest);
    case 'update':
    case 'set':
      return updateUser(product, log, rest, values);
    case 'delete':
    case 'rm':
      return deleteUser(product, log, rest);
    default:
      console.log(usersHelp(product));
      return sub ? 1 : 0;
  }
}

async function listUsers(product, log, values) {
  const data = await apiRequest(product, 'GET', '/users', {
    query: { cursor: values.cursor, limit: values.limit },
  });
  if (!data.data.length) {
    log.warn('No users found');
    return 0;
  }
  for (const u of data.data) {
    const role = u.role ? ` ${u.role}` : '';
    log.raw(`${u.namespace}${role}  ${u.displayName || ''}`);
  }
  if (data.pagination.hasMore) {
    log.progress(`More results available. Use --cursor ${data.pagination.nextCursor}`);
  }
  return 0;
}

async function getUser(product, log, args) {
  if (!args[0]) {
    log.error('Usage: twext-admin users get <namespace>');
    return 1;
  }
  const user = await apiRequest(product, 'GET', `/users/${args[0]}`);
  log.raw(`Namespace:  ${user.namespace}`);
  log.raw(`Display:    ${user.displayName || '(none)'}`);
  if (user.role !== undefined) log.raw(`Role:       ${user.role}`);
  log.raw(`Published:  ${user.hasPublished ? 'yes' : 'no'}`);
  log.raw(`Joined:     ${user.createdAt}`);
  if (user.termsAcceptedVersion !== undefined)
    log.raw(`Terms:      ${user.termsAcceptedVersion ?? 'never accepted'}`);
  return 0;
}

async function updateUser(product, log, args, values) {
  if (!args[0]) {
    log.error(
      'Usage: twext-admin users update <namespace> [--role admin|normal] [--display-name "name"]',
    );
    return 1;
  }
  const body = {};
  if (values.role) body.role = values.role;
  if (values['display-name']) body.displayName = values['display-name'];
  if (values.password) body.password = values.password;
  if (!Object.keys(body).length) {
    log.error('No fields to update. Use --role or --display-name.');
    return 1;
  }
  const user = await apiRequest(product, 'PATCH', `/users/${args[0]}`, { body });
  log.success(`Updated ${user.namespace} (role: ${user.role})`);
  return 0;
}

async function deleteUser(product, log, args) {
  if (!args[0]) {
    log.error('Usage: twext-admin users delete <namespace>');
    return 1;
  }
  await apiRequest(product, 'DELETE', `/users/${args[0]}`);
  log.success(`Deleted user ${args[0]}`);
  return 0;
}

function usersHelp(product) {
  return `Usage: ${product.command} users <subcommand> [options]

Subcommands:
  list                           List all accounts
  get <namespace>                View an account
  update <namespace> [options]   Update an account
  delete <namespace>             Delete an account and all its data

Options:
  --role <role>            Set the role (admin or normal)
  --display-name <name>    Set the display name
  --cursor <cursor>        Pagination cursor (list)
  --limit <n>              Results per page (list)`;
}

export { usersHelp };
