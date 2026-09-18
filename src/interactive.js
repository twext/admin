import { createInterface } from 'node:readline/promises';
import { dispatch } from './dispatch.js';

const GROUPS = [
  {
    key: 'auth',
    title: 'auth — log in, log out, or view your account',
    items: [
      {
        key: 'login',
        title: 'Log in',
        cmd: ['auth', 'login'],
        args: [{ prompt: 'Namespace' }, { key: 'password', prompt: 'Password', secret: true }],
      },
      { key: 'logout', title: 'Log out', cmd: ['auth', 'logout'] },
      { key: 'me', title: 'Who am I', cmd: ['auth', 'me'] },
    ],
  },
  {
    key: 'users',
    title: 'users — list, view, update, or delete accounts',
    items: [
      { key: 'list', title: 'List accounts', cmd: ['users', 'list'] },
      {
        key: 'get',
        title: 'View an account',
        cmd: ['users', 'get'],
        args: [{ prompt: 'Namespace' }],
      },
      {
        key: 'update',
        title: 'Update an account',
        cmd: ['users', 'update'],
        args: [{ prompt: 'Namespace' }],
        flags: {
          role: 'Role (admin/normal)',
          'display-name': 'Display name',
          password: { desc: 'New password', secret: true },
        },
      },
      {
        key: 'delete',
        title: 'Delete an account',
        cmd: ['users', 'delete'],
        args: [{ prompt: 'Namespace' }],
      },
    ],
  },
  {
    key: 'extensions',
    title: 'extensions — list, view, search, or delete extensions',
    items: [
      { key: 'list', title: 'List extensions', cmd: ['extensions', 'list'] },
      {
        key: 'get',
        title: 'View extension details',
        cmd: ['extensions', 'get'],
        args: [{ prompt: 'Extension (e.g. @someone/my-extension)' }],
      },
      { key: 'search', title: 'Search extensions', cmd: ['search'], args: [{ prompt: 'Query' }] },
      {
        key: 'delete',
        title: 'Delete an extension',
        cmd: ['extensions', 'delete'],
        args: [{ prompt: 'Extension (e.g. @someone/my-extension)' }],
      },
    ],
  },
  {
    key: 'moderation',
    title: 'moderation — review queue, approve, reject',
    items: [
      { key: 'queue', title: 'Show the pending review queue', cmd: ['queue'] },
      {
        key: 'approve',
        title: 'Approve a pending version',
        cmd: ['approve'],
        args: [{ prompt: 'Extension (e.g. @someone/my-extension)' }, { prompt: 'Version' }],
      },
      {
        key: 'reject',
        title: 'Reject a pending version',
        cmd: ['reject'],
        args: [{ prompt: 'Extension (e.g. @someone/my-extension)' }, { prompt: 'Version' }],
        flags: { reason: 'Reason for rejection' },
      },
    ],
  },
  {
    key: 'versions',
    title: 'versions — metadata, yank, download',
    items: [
      {
        key: 'get',
        title: 'View version metadata',
        cmd: ['versions'],
        args: [
          { prompt: 'Extension (e.g. @someone/my-extension)' },
          { prompt: 'Version', default: 'latest' },
        ],
      },
      {
        key: 'yank',
        title: 'Yank (unlist) a version',
        cmd: ['yank'],
        args: [{ prompt: 'Extension (e.g. @someone/my-extension)' }, { prompt: 'Version' }],
      },
      {
        key: 'download',
        title: 'Download a compiled extension',
        cmd: ['download'],
        args: [
          { prompt: 'Extension (e.g. @someone/my-extension)' },
          { prompt: 'Version', default: 'latest' },
        ],
        flags: { out: 'Output file' },
      },
    ],
  },
  {
    key: 'tokens',
    title: 'tokens — manage automation tokens',
    items: [
      { key: 'list', title: 'List tokens', cmd: ['tokens', 'list'] },
      {
        key: 'create',
        title: 'Create a token',
        cmd: ['tokens', 'create'],
        args: [{ prompt: 'Token name' }],
        flags: {
          scopes: 'Scopes (comma-separated, e.g. publish,yank)',
          'expires-in-days': 'Token lifetime in days',
        },
      },
      {
        key: 'update',
        title: 'Update a token',
        cmd: ['tokens', 'update'],
        args: [{ prompt: 'Token ID' }],
        flags: { name: 'New name', scopes: 'Scopes (comma-separated)' },
      },
      {
        key: 'delete',
        title: 'Revoke a token',
        cmd: ['tokens', 'delete'],
        args: [{ prompt: 'Token ID' }],
      },
    ],
  },
  {
    key: 'sessions',
    title: 'sessions — manage login sessions',
    items: [
      { key: 'list', title: 'List sessions', cmd: ['sessions', 'list'] },
      {
        key: 'revoke',
        title: 'Revoke a session',
        cmd: ['sessions', 'revoke'],
        args: [{ prompt: 'Session ID' }],
      },
    ],
  },
  {
    key: 'legal',
    title: 'legal — Terms of Service and Privacy Policy',
    items: [
      { key: 'terms', title: 'View Terms of Service', cmd: ['terms'] },
      { key: 'privacy', title: 'View Privacy Policy', cmd: ['privacy'] },
      { key: 'terms-update', title: 'Update Terms of Service (reads stdin)', hint: 'terms update' },
      {
        key: 'privacy-update',
        title: 'Update Privacy Policy (reads stdin)',
        hint: 'privacy update',
      },
    ],
  },
  {
    key: 'status',
    title: 'status — registry stats and meta',
    items: [
      { key: 'stats', title: 'Show registry-wide counters', cmd: ['stats'] },
      { key: 'meta', title: 'Show TwextHub product info', cmd: ['meta'] },
    ],
  },
];

export async function interactiveShell(product, log) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    log.info(`${product.name} ${product.version} — interactive mode`);
    log.info(`Pick a section, then an action. 'q' quits, 'b' goes back.`);
    log.info('');
    while (true) {
      const group = await pickGroup(rl, log);
      if (!group) return 0;
      const item = await pickItem(rl, log, group);
      if (!item) return 0;
      if (item === 'back') continue;
      if (item.hint) {
        log.warn(`This reads from stdin, so use the CLI instead: ${product.command} ${item.hint}`);
        continue;
      }
      const built = await buildArgs(rl, item);
      if (built === undefined) return 0;
      if (built === null) continue;
      const code = await dispatch(product, log, built.positionals, built.values);
      if (code) log.progress(`(exit code ${code})`);
      await ask(rl, '\nPress Enter to continue. ');
    }
  } finally {
    rl.close();
  }
}

async function ask(rl, prompt) {
  try {
    const answer = await rl.question(prompt);
    return answer === null || answer === undefined ? null : answer;
  } catch {
    return null;
  }
}

async function askSecret(rl, prompt) {
  process.stdout.write(prompt);
  const out = process.stdout;
  const orig = out.write.bind(out);
  out.write = (chunk) => {
    if (/\n/.test(String(chunk))) return orig(chunk);
    return true;
  };
  try {
    return await rl.question('');
  } catch {
    return null;
  } finally {
    out.write = orig;
  }
}

function resolveSelection(list, input) {
  const n = Number(input);
  if (input && Number.isInteger(n) && n >= 1 && n <= list.length) return list[n - 1];
  return list.find((entry) => entry.key === input);
}

async function pickGroup(rl, log) {
  while (true) {
    log.raw('Sections:');
    GROUPS.forEach((group, i) => log.raw(`  ${i + 1}) ${group.title}`));
    log.raw('  q) Quit');
    const answer = await ask(rl, '> ');
    if (answer === null || /^q$/i.test(answer.trim())) return null;
    const group = resolveSelection(GROUPS, answer.trim());
    if (group) return group;
    log.error('Invalid choice');
  }
}

async function pickItem(rl, log, group) {
  while (true) {
    log.raw(`${group.title}:`);
    group.items.forEach((item, i) => log.raw(`  ${i + 1}) ${item.title}`));
    log.raw('  b) Back    q) Quit');
    const answer = await ask(rl, '> ');
    if (answer === null || /^q$/i.test(answer.trim())) return null;
    if (/^b$/i.test(answer.trim())) return 'back';
    const item = resolveSelection(group.items, answer.trim());
    if (item) return item;
    log.error('Invalid choice');
  }
}

async function buildArgs(rl, item) {
  const positionals = [...item.cmd];
  const values = {};
  for (const arg of item.args ?? []) {
    const suffix = arg.default ? ` [${arg.default}]` : '';
    const prompt = `${arg.prompt}${suffix}: `;
    const answer = arg.secret ? await askSecret(rl, prompt) : await ask(rl, prompt);
    if (answer === null || answer === undefined) return undefined;
    const value = answer.trim() || arg.default || '';
    if (!value) return null;
    if (arg.key) values[arg.key] = value;
    else positionals.push(value);
  }
  for (const [name, def] of Object.entries(item.flags ?? {})) {
    const desc = typeof def === 'string' ? def : def.desc;
    const secret = typeof def === 'object' && def.secret;
    const answer = secret
      ? await askSecret(rl, `${desc} (--${name}): `)
      : await ask(rl, `${desc} (--${name}): `);
    if (answer === null || answer === undefined) return undefined;
    const value = answer.trim();
    if (value) values[name] = value;
  }
  return { positionals, values };
}
