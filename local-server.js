import { createHmac, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
const sessionSecret = process.env.SESSION_SECRET || 'local-portfolio-session';
const dataPath = join(root, 'data', 'site.json');
const assetRoot = join(root, 'assets');
const publicRoot = root;
const maxUploadBytes = 8 * 1024 * 1024;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function sign(value) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sessionCookie() {
  const value = `local.${Date.now() + 8 * 60 * 60 * 1000}`;
  return `${value}.${sign(value)}`;
}

function isAuthenticated(request) {
  const match = (request.headers.cookie || '').match(/(?:^|;\s*)portfolio_session=([^;]+)/);
  if (!match) return false;
  const value = decodeURIComponent(match[1]);
  const separator = value.lastIndexOf('.');
  if (separator < 1) return false;
  const payload = value.slice(0, separator);
  const expires = Number(payload.slice(payload.lastIndexOf('.') + 1));
  return expires > Date.now() && safeEqual(value.slice(separator + 1), sign(payload));
}

function json(response, status, body, headers = {}) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 12 * 1024 * 1024) throw new Error('Request too large');
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

async function readSite() {
  return JSON.parse(await readFile(dataPath, 'utf8'));
}

async function writeSite(site) {
  await writeFile(dataPath, `${JSON.stringify(site, null, 2)}\n`, 'utf8');
}

function cleanText(value, max = 5000) {
  const text = String(value || '').trim();
  if (!text || text.length > max) throw new Error('Invalid text field');
  return text;
}

function cleanUrl(value) {
  const url = cleanText(value, 500);
  if (!/^(https?:\/\/|mailto:)/i.test(url)) throw new Error('Links must use http://, https://, or mailto:');
  return url;
}

async function api(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/site') return json(response, 200, await readSite());
  if (request.method === 'GET' && url.pathname === '/api/auth') return json(response, 200, { authenticated: isAuthenticated(request) });

  if (request.method === 'POST' && url.pathname === '/api/auth') {
    const body = await readJson(request);
    if (!safeEqual(String(body.password || ''), adminPassword)) return json(response, 401, { error: 'Invalid password' });
    return json(response, 200, { ok: true }, { 'set-cookie': `portfolio_session=${encodeURIComponent(sessionCookie())}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` });
  }

  if (request.method === 'POST' && url.pathname === '/api/logout') {
    return json(response, 200, { ok: true }, { 'set-cookie': 'portfolio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
  }

  if (!url.pathname.startsWith('/api/admin')) return json(response, 404, { error: 'Not found' });
  if (!isAuthenticated(request)) return json(response, 401, { error: 'Login required' });

  const body = await readJson(request);
  const site = await readSite();
  if (body.action === 'save-content') {
    site.content = Object.fromEntries(Object.entries(body.content || {}).map(([id, value]) => [cleanText(id, 100), cleanText(value, 20000)]));
  } else if (body.action === 'save-links') {
    site.links = { email: cleanText(body.links.email, 200), linkedin: cleanUrl(body.links.linkedin), github: cleanUrl(body.links.github) };
  } else if (body.action === 'save-profile') {
    site.profile = { resumeUrl: cleanText(body.profile.resumeUrl, 500), resumeFilename: cleanText(body.profile.resumeFilename, 200) };
  } else if (body.action === 'save-project') {
    const item = body.project;
    const project = { id: cleanText(item.id, 100), name: cleanText(item.name, 200), description: cleanText(item.description, 2000), url: cleanUrl(item.url), sortOrder: Number(item.sortOrder || 0), isActive: item.isActive !== false };
    site.projects = [...site.projects.filter(entry => entry.id !== project.id), project].sort((a, b) => a.sortOrder - b.sortOrder);
  } else if (body.action === 'delete-project') {
    site.projects = site.projects.filter(entry => entry.id !== cleanText(body.id, 100));
  } else if (body.action === 'save-certificate') {
    const item = body.certificate;
    const certificate = { id: cleanText(item.id, 100), name: cleanText(item.name, 200), issuer: cleanText(item.issuer, 200), date: cleanText(item.date || 'Not specified', 80), credentialId: cleanText(item.credentialId || item.id, 200), credentialUrl: item.credentialUrl ? cleanUrl(item.credentialUrl) : '#', icon: cleanText(item.icon || '📜', 8), fileUrl: item.fileUrl || '', sortOrder: Number(item.sortOrder || 0), isActive: item.isActive !== false };
    site.certificates = [...site.certificates.filter(entry => entry.id !== certificate.id), certificate].sort((a, b) => a.sortOrder - b.sortOrder);
  } else if (body.action === 'delete-certificate') {
    site.certificates = site.certificates.filter(entry => entry.id !== cleanText(body.id, 100));
  } else if (body.action === 'upload') {
    const file = Buffer.from(body.base64 || '', 'base64');
    const relativePath = cleanText(body.path, 180).replace(/[^a-zA-Z0-9._/-]/g, '-');
    if (!file.length || file.length > maxUploadBytes || !/^assets\//.test(relativePath) && !/^certs\//.test(relativePath)) throw new Error('Invalid upload');
    const target = normalize(join(root, relativePath));
    if (!target.startsWith(root)) throw new Error('Invalid upload path');
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, file);
    return json(response, 200, { ok: true, url: `/${relativePath}` });
  } else {
    return json(response, 400, { error: 'Unknown admin action' });
  }
  await writeSite(site);
  return json(response, 200, { ok: true, site });
}

async function staticFile(response, url) {
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const target = normalize(join(publicRoot, pathname));
  if (!target.startsWith(publicRoot)) return response.end('Forbidden');
  try {
    const file = await readFile(target);
    response.writeHead(200, { 'content-type': mimeTypes[extname(target)] || 'application/octet-stream' });
    response.end(file);
  } catch {
    const fallback = await readFile(join(publicRoot, '404.html'));
    response.writeHead(404, { 'content-type': mimeTypes['.html'] });
    response.end(fallback);
  }
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname.startsWith('/api/')) return api(request, response, url);
    return staticFile(response, url);
  } catch (error) {
    console.error(error);
    return json(response, 400, { error: error.message || 'Request failed' });
  }
}).listen(port, () => console.log(`Local portfolio editor: http://localhost:${port} (password: ADMIN_PASSWORD or local default)`));
