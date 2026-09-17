import { apiRequest, saveToken, clearToken } from '../api.js';

export async function loginCommand(product, log, args) {
  if (args.length < 2) {
    log.error('Usage: twext-admin auth login <namespace> <password>');
    return 1;
  }
  const [namespace, password] = args;
  log.progress(`Logging in as ${namespace}...`);
  const data = await apiRequest(product, 'POST', '/auth/login', {
    token: null,
    body: { namespace, password },
  });
  saveToken(data.token);
  const role = data.user.role ? ` (role: ${data.user.role})` : '';
  log.success(`Logged in as ${data.user.namespace}${role}`);
  return 0;
}

export async function logoutCommand(product, log) {
  try {
    await apiRequest(product, 'POST', '/auth/logout');
    log.success('Logged out');
  } finally {
    clearToken();
  }
  return 0;
}

export async function meCommand(product, log) {
  const user = await apiRequest(product, 'GET', '/auth/me');
  log.raw(`Namespace:  ${user.namespace}`);
  log.raw(`Display:    ${user.displayName || '(none)'}`);
  if (user.role !== undefined) log.raw(`Role:       ${user.role}`);
  log.raw(`Published:  ${user.hasPublished ? 'yes' : 'no'}`);
  log.raw(`Joined:     ${user.createdAt}`);
  if (user.termsAcceptedVersion !== undefined)
    log.raw(`Terms:      ${user.termsAcceptedVersion ?? 'never accepted'}`);
  return 0;
}
