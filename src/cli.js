#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { loadProduct } from './config.js';
import { createLogger } from './log.js';
import { dispatch, helpText } from './dispatch.js';
import { interactiveShell } from './interactive.js';

const OPTIONS = {
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
  url: { type: 'string', short: 'u' },
  out: { type: 'string', short: 'o' },
  limit: { type: 'string' },
  cursor: { type: 'string' },
  role: { type: 'string' },
  'display-name': { type: 'string' },
  query: { type: 'string' },
  reason: { type: 'string' },
  scopes: { type: 'string' },
  name: { type: 'string' },
  'expires-in-days': { type: 'string' },
  namespace: { type: 'string' },
};

async function main(args) {
  const product = loadProduct();
  const log = createLogger(product);
  const { values, positionals } = parseArgs({ args, options: OPTIONS, allowPositionals: true });

  if (values.url) {
    let url;
    try {
      url = new URL(values.url);
    } catch {
      url = null;
    }
    if (!url || url.protocol !== 'https:') {
      log.error(`Invalid --url "${values.url}": must use the https: protocol`);
      return 1;
    }
    product.defaults.apiBase = values.url;
  }
  if (values.version) {
    console.log(`${product.name} ${product.version}`);
    return 0;
  }
  if (values.help) {
    console.log(helpText(product));
    return 0;
  }

  if (positionals.length === 0) {
    if (process.stdin.isTTY) return interactiveShell(product, log);
    console.log(helpText(product));
    return 0;
  }

  return dispatch(product, log, positionals, values);
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    const log = createLogger(loadProduct());
    log.error(err.message ?? String(err));
    process.exitCode = 1;
  });
