import { readRepositoryJson, sessionIsValid, upsertRepositoryJson, writeRepositoryFile } from '../lib/github.js';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp']
]);

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', chunk => { raw += chunk; if (raw.length > 12 * 1024 * 1024) reject(new Error('Request too large')); });
    request.on('end', () => resolve(raw ? JSON.parse(raw) : {}));
    request.on('error', reject);
  });
}

function cleanText(value, max = 5000) {
  if (typeof value !== 'string') throw new Error('Text fields must be strings');
  const clean = value.trim();
  if (!clean || clean.length > max) throw new Error('Invalid text field');
  return clean;
}

function cleanUrl(value) {
  const url = cleanText(value, 500);
  if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) throw new Error('Links must use https://, http://, or mailto:');
  return url;
}

function normalizeSite(site) {
  return {
    content: site.content || {},
    profile: site.profile || {},
    links: site.links || {},
    projects: Array.isArray(site.projects) ? site.projects : [],
    certificates: Array.isArray(site.certificates) ? site.certificates : []
  };
}

function requireAuth(request, response) {
  if (!sessionIsValid(request.headers.cookie || '')) {
    response.status(401).json({ error: 'Login required' });
    return false;
  }
  return true;
}

export default async function handler(request, response) {
  if (!requireAuth(request, response)) return;
  try {
    const site = normalizeSite(await readRepositoryJson() || {});
    const input = await readBody(request);
    const action = input.action;

    if (action === 'save-content') {
      if (!input.content || typeof input.content !== 'object' || Array.isArray(input.content)) throw new Error('Invalid content');
      site.content = Object.fromEntries(Object.entries(input.content).map(([id, value]) => [cleanText(id, 100), cleanText(value, 20000)]));
    } else if (action === 'save-profile') {
      site.profile = {
        resumeUrl: cleanText(input.profile?.resumeUrl, 500),
        resumeFilename: cleanText(input.profile?.resumeFilename, 200)
      };
    } else if (action === 'save-links') {
      site.links = {
        email: cleanText(input.links?.email, 200),
        linkedin: cleanUrl(input.links?.linkedin),
        github: cleanUrl(input.links?.github)
      };
    } else if (action === 'save-project') {
      const project = {
        id: cleanText(input.project?.id || `project-${Date.now()}`, 80),
        name: cleanText(input.project?.name, 200),
        description: cleanText(input.project?.description, 2000),
        url: cleanUrl(input.project?.url),
        sortOrder: Number(input.project?.sortOrder || 0),
        isActive: input.project?.isActive !== false
      };
      site.projects = [...site.projects.filter(item => item.id !== project.id), project].sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (action === 'delete-project') {
      site.projects = site.projects.filter(item => item.id !== cleanText(input.id, 80));
    } else if (action === 'save-certificate') {
      const certificate = {
        id: cleanText(input.certificate?.id || `cert-${Date.now()}`, 100),
        name: cleanText(input.certificate?.name, 200),
        issuer: cleanText(input.certificate?.issuer, 200),
        date: cleanText(input.certificate?.date || 'Not specified', 80),
        credentialId: cleanText(input.certificate?.credentialId || 'Not specified', 200),
        credentialUrl: input.certificate?.credentialUrl ? cleanUrl(input.certificate.credentialUrl) : '#',
        icon: cleanText(input.certificate?.icon || '📜', 8),
        fileUrl: input.certificate?.fileUrl || '',
        sortOrder: Number(input.certificate?.sortOrder || 0),
        isActive: input.certificate?.isActive !== false
      };
      site.certificates = [...site.certificates.filter(item => item.id !== certificate.id), certificate].sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (action === 'delete-certificate') {
      site.certificates = site.certificates.filter(item => item.id !== cleanText(input.id, 100));
    } else if (action === 'upload') {
      const type = allowedTypes.get(input.contentType);
      const pathPart = cleanText(input.path, 180).replace(/[^a-zA-Z0-9._/-]/g, '-');
      const content = Buffer.from(input.base64 || '', 'base64');
      if (!type || !content.length || content.length > MAX_UPLOAD_BYTES || !pathPart.startsWith('certs/') && !pathPart.startsWith('assets/')) throw new Error('Invalid upload');
      await writeRepositoryFile(pathPart, content, `Update portfolio asset: ${pathPart}`);
      return response.status(200).json({ ok: true, url: `/${pathPart}` });
    } else {
      return response.status(400).json({ error: 'Unknown admin action' });
    }

    await upsertRepositoryJson('data/site.json', site, `Update portfolio data: ${action}`);
    return response.status(200).json({ ok: true, site });
  } catch (error) {
    console.error(error);
    return response.status(400).json({ error: error.message || 'Invalid request' });
  }
}
