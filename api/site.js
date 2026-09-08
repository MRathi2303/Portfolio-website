import { readRepositoryJson } from '../lib/github.js';

const fallback = { content: {}, profile: {}, links: {}, projects: [], certificates: [] };

export default async function handler(_request, response) {
  try {
    const site = await readRepositoryJson() || fallback;
    response.setHeader('cache-control', 'public, max-age=60, s-maxage=300');
    return response.status(200).json(site);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Site data unavailable' });
  }
}
