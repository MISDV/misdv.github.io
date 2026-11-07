import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { updateMenuPage } from './menu-page.mjs';

const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 16) {
  console.error('Imposta ADMIN_PASSWORD con almeno 16 caratteri.');
  process.exit(1);
}

const port = Number(process.env.ADMIN_PORT || 8787);
const user = process.env.ADMIN_USER || 'admin';
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY || 'MISDV/misdv.github.io';
const branch = process.env.GITHUB_BRANCH || 'main';
const dataFiles = new Set(['dati.json', 'items.json', 'menu.json']);
const files = {
  '/admin/': ['index.html', 'text/html; charset=utf-8'],
  '/admin/editor.js': ['editor.js', 'text/javascript; charset=utf-8'],
  '/admin/editor.css': ['editor.css', 'text/css; charset=utf-8'],
};
const digest = value => createHash('sha256').update(value).digest();
const credentials = digest('Basic ' + Buffer.from(`${user}:${password}`, 'utf8').toString('base64'));
const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
const imagePath = /^img\/[\w-]+\.(?:jpg|jpeg|png|webp)$/i;

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

async function github(path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Giuggioloni-Admin',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 409 || response.status === 422) {
      throw error(409, 'La versione online è cambiata. Ricarica i dati prima di salvare di nuovo.');
    }
    throw error(502, `Operazione sul repository non riuscita (HTTP ${response.status}).`);
  }
  return response.json();
}

const contents = (path, ref = branch) => github(`/contents/${path}?ref=${encodeURIComponent(ref)}`);
const decode = file => Buffer.from(file.content, 'base64').toString('utf8');

async function publishMenu(menu, expectedSha) {
  const branchPath = branch.split('/').map(encodeURIComponent).join('/');
  const ref = await github(`/git/ref/heads/${branchPath}`);
  const head = ref.object.sha;
  const [previous, template, home, base] = await Promise.all([
    contents('menu.json', head), contents('menu/index.html', head),
    contents('index.html', head), github(`/git/commits/${head}`),
  ]);
  if (previous.sha !== expectedSha) throw error(409, 'Il menù online è cambiato. Ricaricalo prima di salvare.');
  const menuJson = JSON.stringify(menu, null, 2) + '\n';
  const entries = [
    { path: 'menu.json', mode: '100644', type: 'blob', content: menuJson },
    { path: 'menu/index.html', mode: '100644', type: 'blob', content: updateMenuPage(decode(template), menu) },
  ];
  const homeHtml = decode(home);
  if (homeHtml.includes('<!-- MENU-CONTENT:START -->')) {
    entries.push({ path: 'index.html', mode: '100644', type: 'blob', content: updateMenuPage(homeHtml, menu) });
  }
  const tree = await github('/git/trees', 'POST', {
    base_tree: base.tree.sha,
    tree: entries,
  });
  const commit = await github('/git/commits', 'POST', {
    message: 'Aggiorna il menù del ristorante',
    tree: tree.sha,
    parents: [head],
  });
  await github(`/git/refs/heads/${branchPath}`, 'PATCH', { sha: commit.sha, force: false });
  return createHash('sha1').update(`blob ${Buffer.byteLength(menuJson)}\0`).update(menuJson).digest('hex');
}

async function readJson(request) {
  if (request.headers['content-type'] !== 'application/json') throw error(415, 'Formato della richiesta non valido.');
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 8 * 1024 * 1024) throw error(413, 'Richiesta troppo grande.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw error(400, 'JSON non valido.');
  }
}

function validate(path, data) {
  if (path === 'items.json') {
    if (!Array.isArray(data) || !data.every(item => item && typeof item.titolo === 'string')) {
      throw error(400, 'Elenco prodotti non valido.');
    }
    return;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw error(400, 'Dati non validi.');
  if (path === 'menu.json' && (!data.days || typeof data.days !== 'object' || Array.isArray(data.days))) {
    throw error(400, 'Giorni del menù non validi.');
  }
}

function validImage(path, content) {
  if (typeof content !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) return false;
  const bytes = Buffer.from(content, 'base64');
  if (bytes.length > 5 * 1024 * 1024) return false;
  if (/\.png$/i.test(path)) return bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  if (/\.webp$/i.test(path)) return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'));
}

createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' https: blob: data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  const json = (status, value) => {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
  };

  try {
    if (!allowedHosts.has(request.headers.host)) throw error(400, 'Host non valido.');
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === '/admin') {
      response.writeHead(308, { Location: '/admin/' }).end();
      return;
    }
    if (!timingSafeEqual(digest(request.headers.authorization || ''), credentials)) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Agriturismo Giuggioloni", charset="UTF-8"');
      throw error(401, 'Password richiesta.');
    }
    const file = files[url.pathname];
    if (file && request.method === 'GET') {
      const [name, type] = file;
      const bytes = await readFile(new URL(name, import.meta.url));
      response.writeHead(200, { 'Content-Type': type }).end(bytes);
      return;
    }
    if (url.pathname !== '/admin/api') throw error(404, 'Pagina non trovata.');
    const path = url.searchParams.get('path') || '';
    if (request.method === 'GET' && dataFiles.has(path)) {
      const file = token ? await contents(path) : null;
      const content = file ? decode(file) : await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
      json(200, { data: JSON.parse(content), sha: file?.sha ?? null, writable: Boolean(token) });
      return;
    }
    if (request.method !== 'PUT') throw error(405, 'Metodo non consentito.');
    if (request.headers.origin !== url.origin || request.headers['sec-fetch-site'] === 'cross-site') {
      throw error(403, 'Origine della richiesta non valida.');
    }
    if (!token) throw error(503, 'Configura il token sul server per pubblicare.');
    if (!dataFiles.has(path) && !imagePath.test(path)) throw error(400, 'File non consentito.');
    const { data, sha, image } = await readJson(request);
    if (imagePath.test(path)) {
      if (!validImage(path, image)) throw error(400, 'Scegli un file JPG, PNG o WebP di massimo 5 MB.');
      await github(`/contents/${path}`, 'PUT', { branch, message: 'Carica una foto del catalogo', content: image });
      json(201, { path });
      return;
    }
    if (typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha)) throw error(409, 'Ricarica i dati prima di salvare.');
    validate(path, data);
    if (path === 'menu.json') {
      json(200, { sha: await publishMenu(data, sha) });
      return;
    }
    const result = await github(`/contents/${path}`, 'PUT', {
      branch, sha, message: `Aggiorna ${path}`,
      content: Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf8').toString('base64'),
    });
    json(200, { sha: result.content.sha });
  } catch (failure) {
    json(failure.status || 500, { error: failure.status ? failure.message : 'Operazione non riuscita. Controlla il servizio e riprova.' });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Area riservata: http://127.0.0.1:${port}/admin/`);
});
