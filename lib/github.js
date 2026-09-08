import { createHmac, timingSafeEqual } from 'node:crypto';

const repo = process.env.GITHUB_REPO || 'MRathi2303/Portfolio-website';
const branch = process.env.GITHUB_BRANCH || 'main';
const token = process.env.GITHUB_TOKEN;
const sessionSecret = process.env.SESSION_SECRET;
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionMaxAge = 60 * 60 * 8;

function githubUrl(path) {
  return `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
}

async function githubRequest(path, options = {}) {
  const response = await fetch(githubUrl(path), {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return response.json();
}

export async function readRepositoryJson(path = 'data/site.json') {
  try {
    const file = await githubRequest(path);
    return JSON.parse(Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'));
  } catch (error) {
    if (error.message.includes('(404)')) return null;
    throw error;
  }
}

export async function writeRepositoryFile(path, content, message, sha) {
  if (!token) throw new Error('GITHUB_TOKEN is not configured');
  if (!sha) {
    try {
      sha = (await githubRequest(path)).sha;
    } catch (error) {
      if (!error.message.includes('(404)')) throw error;
    }
  }
  const body = {
    message,
    branch,
    content: Buffer.isBuffer(content) ? content.toString('base64') : Buffer.from(content, 'utf8').toString('base64')
  };
  if (sha) body.sha = sha;
  return githubRequest(path, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export async function upsertRepositoryJson(path, value, message) {
  let sha;
  try {
    sha = (await githubRequest(path)).sha;
  } catch (error) {
    if (!error.message.includes('(404)')) throw error;
  }
  return writeRepositoryFile(path, JSON.stringify(value, null, 2) + '\n', message, sha);
}

export function configurationError() {
  return !sessionSecret || !adminPassword || !token;
}

function sign(value) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(password) {
  return Boolean(adminPassword && password && safeEqual(password, adminPassword));
}

export function createSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionMaxAge;
  const value = `admin.${expires}`;
  return `${value}.${sign(value)}`;
}

export function sessionIsValid(cookieHeader = '') {
  if (!sessionSecret) return false;
  const match = cookieHeader.match(/(?:^|;\s*)portfolio_session=([^;]+)/);
  if (!match) return false;
  const tokenValue = decodeURIComponent(match[1]);
  const separator = tokenValue.lastIndexOf('.');
  if (separator < 1) return false;
  const value = tokenValue.slice(0, separator);
  const expires = Number(value.slice(value.lastIndexOf('.') + 1));
  return expires > Math.floor(Date.now() / 1000) && safeEqual(tokenValue.slice(separator + 1), sign(value));
}

export function sessionCookie(value) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `portfolio_session=${encodeURIComponent(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionMaxAge};${secure}`;
}

export function clearedSessionCookie() {
  return 'portfolio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0';
}
