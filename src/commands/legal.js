import { apiRequest } from '../api.js';

export async function termsCommand(product, log, sub) {
  if (sub === 'update') {
    log.error('Usage: twext-admin terms update (reads Markdown from stdin)');
    log.raw('');
    log.raw('Paste or pipe your Terms of Service Markdown, then press Ctrl+D.');
    const body = await readStdin();
    if (!body.trim()) {
      log.error('No input received');
      return 1;
    }
    const doc = await apiRequest(product, 'PATCH', '/admin/terms', { body: { body } });
    log.success(`Terms of Service updated (version ${doc.version})`);
    return 0;
  }
  const doc = await apiRequest(product, 'GET', '/terms');
  log.raw(`Terms of Service (v${doc.version}, updated ${doc.updatedAt})`);
  log.raw('');
  log.raw(doc.body);
  return 0;
}

export async function privacyCommand(product, log, sub) {
  if (sub === 'update') {
    log.error('Usage: twext-admin privacy update (reads Markdown from stdin)');
    log.raw('');
    log.raw('Paste or pipe your Privacy Policy Markdown, then press Ctrl+D.');
    const body = await readStdin();
    if (!body.trim()) {
      log.error('No input received');
      return 1;
    }
    const doc = await apiRequest(product, 'PATCH', '/admin/privacy', { body: { body } });
    log.success(`Privacy Policy updated (version ${doc.version})`);
    return 0;
  }
  const doc = await apiRequest(product, 'GET', '/privacy');
  log.raw(`Privacy Policy (v${doc.version}, updated ${doc.updatedAt})`);
  log.raw('');
  log.raw(doc.body);
  return 0;
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.resume();
  });
}
