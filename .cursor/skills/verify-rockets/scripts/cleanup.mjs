#!/usr/bin/env node
// Stop the verification server recorded by launch.mjs. Does not delete artifacts.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runDir = path.join(skillDir, 'run');
const pidFile = path.join(runDir, 'next.pid');
const portFile = path.join(runDir, 'next.port');
const logFile = path.join(runDir, 'next.log');

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

const pid = Number(await fs.readFile(pidFile, 'utf8').catch(() => ''));
if (!pid) {
  console.log('No recorded verification server.');
  await fs.rm(portFile, { force: true });
  await fs.rm(logFile, { force: true });
  process.exit(0);
}

if (alive(pid)) {
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    process.kill(pid, 'SIGTERM');
  }
  const deadline = Date.now() + 5000;
  while (alive(pid) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (alive(pid)) {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      process.kill(pid, 'SIGKILL');
    }
  }
}

await fs.rm(pidFile, { force: true });
await fs.rm(portFile, { force: true });
await fs.rm(logFile, { force: true });
console.log(`Stopped verification server pid ${pid}. Artifacts were left in place.`);
