#!/usr/bin/env node
// Read-only health check for the verification server this skill started.

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(skillDir, '../../..');
const runDir = path.join(skillDir, 'run');

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

async function processTree(rootPid) {
  const { stdout } = await execFileAsync('ps', ['-ax', '-o', 'pid=,ppid=']);
  const children = new Map();
  for (const line of stdout.split('\n')) {
    const match = line.trim().match(/^(\d+)\s+(\d+)$/);
    if (!match) continue;
    const pid = Number(match[1]);
    const ppid = Number(match[2]);
    const list = children.get(ppid) || [];
    list.push(pid);
    children.set(ppid, list);
  }
  const owned = new Set([rootPid]);
  const stack = [rootPid];
  while (stack.length) {
    const current = stack.pop();
    for (const child of children.get(current) || []) {
      if (!owned.has(child)) {
        owned.add(child);
        stack.push(child);
      }
    }
  }
  return owned;
}

const pid = Number(await fs.readFile(path.join(runDir, 'next.pid'), 'utf8').catch(() => ''));
const port = Number(await fs.readFile(path.join(runDir, 'next.port'), 'utf8').catch(() => ''));
if (!pid || !port) {
  fail('No verification server is recorded. Run launch.mjs first.');
}
if (!alive(pid)) {
  fail(`Recorded pid ${pid} is not running. Run cleanup.mjs, then launch.mjs.`);
}

let listeners = '';
try {
  const { stdout } = await execFileAsync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t']);
  listeners = stdout;
} catch (error) {
  if (error.code !== 1) throw error;
}
const listenPids = listeners.split('\n').map((line) => Number(line.trim())).filter(Boolean);
const owned = await processTree(pid);
if (listenPids.length === 0 || !listenPids.some((listenPid) => owned.has(listenPid))) {
  fail(`127.0.0.1:${port} is not listened to by pid ${pid}. Refusing to drive it.`);
}

const packageJson = JSON.parse(await fs.readFile(path.join(repoRoot, 'package.json'), 'utf8'));
const url = `http://127.0.0.1:${port}/`;
const response = await fetch(url);
const body = await response.text();
if (response.status !== 200 || !body.includes('<title') || !body.includes('Phaser Nextjs Template')) {
  fail(`${url} did not return the Phaser Nextjs Template page (status ${response.status}).`);
}
if (body.includes('Application error') || body.includes('__next_error__')) {
  fail(`${url} returned an error page.`);
}

const nextPkg = JSON.parse(await fs.readFile(path.join(repoRoot, 'node_modules/next/package.json'), 'utf8'));
console.log(`url ${url}`);
console.log(`pid ${pid}`);
console.log(`port ${port}`);
console.log(`package ${packageJson.name}@${packageJson.version}`);
console.log(`next ${nextPkg.version}`);
console.log('http-ok');
console.log('browser-unconfirmed: open the url and require #game-container canvas, buttons Change Scene, Toggle Movement, and Add New Sprite, and Toggle Movement enabled.');
