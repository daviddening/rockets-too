#!/usr/bin/env node
// Start a private Next dev server for rockets-too verification.
// Does not run log.js, and refuses to attach to a server this run did not start.

import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(skillDir, '../../..');
const runDir = path.join(skillDir, 'run');
const port = Number(process.env.VERIFY_PORT || 4173);
const pidFile = path.join(runDir, 'next.pid');
const portFile = path.join(runDir, 'next.port');
const logFile = path.join(runDir, 'next.log');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function portInUse(targetPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    server.listen(targetPort, '127.0.0.1');
  });
}

async function waitForReady() {
  const deadline = Date.now() + 60_000;
  const url = `http://127.0.0.1:${port}/`;
  while (Date.now() < deadline) {
    const log = await fs.readFile(logFile, 'utf8').catch(() => '');
    if (!log.includes('Ready')) {
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }
    try {
      const response = await fetch(url);
      const body = await response.text();
      if (response.status === 200 && body.includes('Phaser Nextjs Template')) {
        return;
      }
    } catch {
      // Server announced Ready before it accepted connections.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  fail(`Timed out waiting for ${url} to serve the Phaser Nextjs Template title. See ${logFile}`);
}

const existingPid = Number(await fs.readFile(pidFile, 'utf8').catch(() => ''));
if (existingPid && alive(existingPid)) {
  fail(`A verification server is already running as pid ${existingPid}. Run cleanup.mjs before launching another.`);
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  fail(`VERIFY_PORT must be a TCP port. Got ${process.env.VERIFY_PORT}`);
}

if (await portInUse(port)) {
  fail(`127.0.0.1:${port} is already in use. Refusing to drive a server this run did not start. Set VERIFY_PORT to a free port.`);
}

const nextBin = path.join(repoRoot, 'node_modules/next/dist/bin/next');
try {
  await fs.access(nextBin);
} catch {
  fail(`Missing ${nextBin}. Run npm install in ${repoRoot} first.`);
}

await fs.mkdir(runDir, { recursive: true });
const logFd = createWriteStream(logFile, { flags: 'w' });
const child = spawn(process.execPath, [nextBin, 'dev', '-p', String(port), '-H', '127.0.0.1'], {
  cwd: repoRoot,
  detached: true,
  stdio: ['ignore', logFd, logFd],
});
child.unref();
await fs.writeFile(pidFile, `${child.pid}\n`);
await fs.writeFile(portFile, `${port}\n`);

if (!child.pid) {
  fail('Next dev did not start.');
}

await waitForReady();
console.log(`pid ${child.pid}`);
console.log(`url http://127.0.0.1:${port}/`);
console.log(`log ${logFile}`);
console.log('HTTP title is up. The game is usable only after the browser shows a canvas and an enabled Toggle Movement button.');
