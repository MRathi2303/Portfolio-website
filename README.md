# Moon Rathi | blaze.portfolio os

A personal portfolio for Moon Rathi, a DevOps engineering intern and cloud computing specialist. The experience is presented as a terminal-inspired desktop environment: interactive, information-dense, and intentionally different from a conventional portfolio template.

The repository contains the complete front end, local content editor, serverless production API, and deployment configuration for the portfolio.

## Portfolio Direction

- Terminal and desktop operating-system visual language
- Responsive presentation for professional profile, experience, education, projects, skills, certifications, contact, and resume content
- Interactive command-line style navigation and section reveals
- One-click certificate viewer with support for public verification links and uploaded PDF/image assets
- Private sudo editor for content, projects, certificates, links, and resume metadata
- GitHub-backed production persistence through Vercel serverless functions
- Local-first editing with JSON metadata and filesystem asset storage

## Technology

- Semantic HTML, modern CSS, and vanilla JavaScript
- Node.js local editor server
- Vercel serverless functions
- GitHub Contents API for production persistence
- Docker and Docker Compose
- GitHub Actions for syntax, integrity, container, and deployment-readiness checks

## Architecture

The root application is the production source of truth. The local server and Vercel functions share the same browser client and data shape, while persistence changes by environment:

- **Local:** `local-server.js` serves the portfolio and persists metadata to `data/site.json`. Uploaded assets are written to `assets/` and `certs/`.
- **Vercel:** `api/site.js`, `api/auth.js`, and `api/admin.js` expose the public data and authenticated editor APIs. `lib/github.js` persists metadata and assets through a server-only GitHub token.
- **Docker:** The container runs the Node local editor server on port `4173`, with Compose mounts for editable data and assets.
- **CI:** `.github/workflows/ci-cd.yml` validates source syntax, JSON files, assets, and the container smoke path.

The legacy `portfolio-fullstack` directory is retained as historical reference material and is ignored by the root repository. It is not part of the active application or deployment path.

## Repository Layout

```text
.
├── index.html                 # Portfolio document and editor modals
├── styles.css                 # Terminal desktop visual system
├── script.js                  # UI behavior, viewer, sudo editor, and API client
├── local-server.js             # Local portfolio server and authenticated editor API
├── api/
│   ├── auth.js                 # Production login/session endpoint
│   ├── site.js                 # Public portfolio data endpoint
│   └── admin.js                # Authenticated content, CRUD, and upload endpoint
├── lib/github.js               # GitHub persistence and signed session utilities
├── data/site.json              # Editable portfolio metadata
├── certs/                      # Public certificate assets
├── Dockerfile                  # Node-based container image
├── docker-compose.yml          # Local container orchestration
├── vercel.json                 # Vercel headers and project configuration
└── .github/workflows/ci-cd.yml # Repository validation workflow
```

## Local Development

The repository uses a dependency-light Node runtime. The primary local command is:

```bash
npm start
```

The local editor accepts `admin` as its default password for development. Set `ADMIN_PASSWORD` and `SESSION_SECRET` in the process environment when using a different local configuration. Local metadata and uploaded assets are intentionally kept outside the production GitHub persistence path.

## Container Runtime

Docker runs the same Node server used by local development rather than a separate static-only server. Compose mounts `data/`, `assets/`, and `certs/` so local content and uploaded files survive container recreation.

```bash
docker compose up --build
```

The container listens on port `4173`; Compose publishes it on port `8080`.

## Production Configuration

Vercel deploys the root project and its `api/` functions. Production editor access requires these environment variables in the Vercel project settings:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Private sudo password |
| `SESSION_SECRET` | Expiring session-cookie signing key |
| `GITHUB_TOKEN` | Server-only GitHub Contents read/write token |
| `GITHUB_REPO` | Repository in `owner/name` format |
| `GITHUB_BRANCH` | Branch receiving editor updates, normally `main` |

Secrets must remain in the deployment environment. They are never stored in source files, committed metadata, or browser storage.

## Quality Checks

The CI workflow validates JavaScript syntax, JSON configuration, required assets, the container build, public page delivery, API delivery, and resume delivery. Production deployment is managed independently by the connected Vercel project.

## Profile

**Moon Rathi** is a DevOps Engineering Intern at Mactores and a B.Tech Computer Science student specializing in Cloud Computing. Primary areas of interest include AWS, Terraform, Docker, CI/CD, Linux, Python, Bash, and AI-assisted engineering workflows.

- GitHub: [MRathi2303](https://github.com/MRathi2303)
- LinkedIn: [moon-rathi](https://linkedin.com/in/moon-rathi)
- Email: [moonrathi111@gmail.com](mailto:moonrathi111@gmail.com)

## License

MIT License.
