import { configurationError, createSession, clearedSessionCookie, passwordMatches, sessionCookie, sessionIsValid } from '../lib/github.js';

function body(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', chunk => { raw += chunk; if (raw.length > 10000) reject(new Error('Request too large')); });
    request.on('end', () => resolve(raw ? JSON.parse(raw) : {}));
    request.on('error', reject);
  });
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') return response.status(200).json({ authenticated: sessionIsValid(request.headers.cookie || '') });
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
    const action = request.query?.action || 'login';
    if (action === 'logout') {
      response.setHeader('set-cookie', clearedSessionCookie());
      return response.status(200).json({ ok: true });
    }
    if (configurationError()) return response.status(503).json({ error: 'Admin authentication is not configured' });
    const input = await body(request);
    if (!passwordMatches(input.password)) return response.status(401).json({ error: 'Invalid password' });
    response.setHeader('set-cookie', sessionCookie(createSession()));
    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(400).json({ error: error.message || 'Invalid request' });
  }
}
