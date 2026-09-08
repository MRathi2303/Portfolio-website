# Moon Rathi — Personal Portfolio (`blaze.portfolio os`)

A terminal and desktop OS-themed developer portfolio built from scratch using vanilla HTML5, CSS3, and JavaScript. 

Inspired by Linux terminal environments, window managers, and my daily work with cloud infrastructure and DevOps tooling.

---

## ⚡ Live Demo

- **Repository**: [github.com/MRathi2303/Portfolio-website](https://github.com/MRathi2303/Portfolio-website)
- **Deployment**: Configured for instant deployment on [Vercel](https://vercel.com) via `vercel.json`.

---

## 🖥️ What's Inside

- **OS Boot Screen & GRUB Menu**: A lightweight boot loader animation simulating kernel initialization, with an option to launch directly or skip ahead with any key.
- **Interactive CLI Terminal**: Press **`~`** (backtick) or click the terminal launcher in the dock/top-bar to open a working bash-style shell. Supports commands like:
  - `cd <section>` — Jump directly to `projects`, `skills`, `certs`, `about`, `experience`, or `contact`.
  - `cat <file>` — Scroll to and display content blocks.
  - `whoami` & `neofetch` — Print developer bio, machine info, and current stack.
  - `./hire.sh` — Run an interactive availability check script.
  - `sudo` — Authenticate and enter Admin Edit mode.
  - `help` & `clear` — Standard terminal utilities.
- **Sudo Admin Mode**: Press `Ctrl + Alt + S` (or `Cmd + Alt + S`) to authenticate with the private deployment password and edit content stored in GitHub.
- **Interactive Resume & Certificate Uploader**: Upload resume PDFs and certificate PDFs/images through the authenticated editor. Files are committed by the server to GitHub; the GitHub token is never sent to the browser.
- **Certificate Viewer Modal**: Clicking any certificate in the certifications list pops up an official terminal credential card showing issuer details, verification status, and credential IDs with direct download options.
- **Simulated `wget` Resume Downloader**: Animates progress bar downloading my actual resume PDF (`Moon_Rathi_Resume.pdf`).
- **No Heavy Frameworks**: Built with zero external UI libraries or heavy JS bundles — fast first paints, non-blocking fonts, and minimal memory footprint.

---

## 🗂️ Project Structure

```text
.
├── index.html              # Main webpage with all sections and modals
├── styles.css              # Custom styling, CRT scanlines, and responsive layout
├── script.js               # CLI parser, typewriter animations, and sudo mode logic
├── Moon_Rathi_Resume.pdf   # Bundled resume file
├── 404.html                # Terminal-styled 404 page
├── api/                    # Vercel serverless auth, data, and admin APIs
├── data/site.json          # Public editable portfolio data
├── lib/github.js           # Server-only GitHub persistence and sessions
├── vercel.json             # Vercel routing and security headers
├── package.json            # Project manifest
├── robots.txt              # Search engine crawler directives
└── .gitignore              # Clean repository ignore list
```

---

## 🚀 Running Locally

No build tools or bundlers are required:

1. Clone the repository:
   ```bash
   git clone https://github.com/MRathi2303/Portfolio-website.git
   cd Portfolio-website
   ```

2. Open in your browser:
   - Start the local editor server:
     ```bash
     npm start
     ```

3. Visit `http://localhost:8000` in your browser.

---

## 🐳 Running with Docker

Run the entire portfolio inside an optimized Alpine Linux + Nginx container:

```bash
# Build and run with Docker Compose
docker compose up -d

# Or build and run directly with Docker
docker build -t moonrathi/portfolio-web .
docker run -d -p 8080:80 moonrathi/portfolio-web
```

Access the site at `http://localhost:8080`.

---

## ⚙️ GitHub Actions CI/CD Pipeline

The repository includes an automated workflow in `.github/workflows/ci-cd.yml` that runs on every push:
1. **Quality & Syntax Check**: Validates JavaScript syntax, JSON configs (`vercel.json`, `package.json`), and static file integrity.
2. **Container Build & Smoke Test**: Automatically builds the Alpine Nginx Docker container and verifies HTTP 200 responses.
3. **Lighthouse Audit**: Evaluates performance, best practices, and SEO readiness.

---

## ☁️ Deploying to Vercel

The project includes a ready-to-go `vercel.json`:

1. Fork or push this repository to your GitHub account.
2. Go to [vercel.com/new](https://vercel.com/new) and import `Portfolio-website`.
3. Leave all build settings at default (Static Site) and click **Deploy**.

### Private editor configuration

Add these environment variables in Vercel Project Settings:

- `ADMIN_PASSWORD`: private sudo password.
- `SESSION_SECRET`: long random value for signing expiring admin cookies.
- `GITHUB_TOKEN`: fine-grained token with Contents read/write access.
- `GITHUB_REPO`: repository in `owner/name` form.
- `GITHUB_BRANCH`: branch receiving editor changes, normally `main`.

Never put these values in source files or browser storage. Rotate them from Vercel when needed.

---

## 📜 Resume & Certification Storage

- **Local editor data**: Text and certificate metadata are stored in `data/site.json`; uploads are stored in local `assets/` and `certs/` folders. The local sudo password defaults to `admin`; set `ADMIN_PASSWORD` before `npm start` to use another password.

---

## 👤 About Me

- **Name**: Moon Rathi
- **Role**: DevOps Engineering Intern at **Mactores**
- **Education**: B.Tech in Computer Science (Minor in Cloud Computing) @ IILM University
- **Certifications**: 
  - Claude Certified Architect – Foundations (*Anthropic*, 2026)
  - 100 Days of Cloud – AWS Certification (*KodeKloud*, 2026)
  - Cloud Foundations (*AWS Academy*, 2026)
  - Docker for Absolute Beginners (*KodeKloud*, 2026)
  - Introduction to Cloud Computing (*Infosys Springboard*, 2026)
- **Primary Stack**: AWS (EC2, S3, Lambda, ECS, RDS, DynamoDB, Bedrock), Terraform, Docker, GitHub Actions, Linux, Python, Bash.

### Connect:
- ✉️ **Email**: [moonrathi111@gmail.com](mailto:moonrathi111@gmail.com)
- 💼 **LinkedIn**: [linkedin.com/in/moon-rathi](https://linkedin.com/in/moon-rathi)
- 🐙 **GitHub**: [github.com/MRathi2303](https://github.com/MRathi2303)

---

## 📄 License

MIT License. Feel free to use this as inspiration for your own portfolio!
