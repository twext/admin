import { createInterface } from 'node:readline';

export function readSecret(prompt) {
  if (process.stdin.isTTY && process.stdout.isTTY) return readSecretTTY(prompt);
  return readStdin();
}

function readSecretTTY(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(`${prompt} `);
    const write = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (s) => {
      if (/\n/.test(s)) write('\n');
    };
    rl.question('', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data.trim()));
    process.stdin.resume();
  });
}
