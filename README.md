<div align="center">

# DevMentor AI â€“ Onâ€‘Device Code Mentor for Chrome

**Manifest V3 extension that explains, reviews, and teaches code directly in the browser using Chrome Builtâ€‘in AI, with deterministic fallbacks when AI capabilities are unavailable.**

[Chrome 130+](https://www.google.com/chrome/) â€¢ [Chrome Builtâ€‘in AI](https://developer.chrome.com/docs/ai/built-in) â€¢ [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/) â€¢ MIT License

</div>

---

## 1. Overview

DevMentor AI is a privacy-first developer assistant that runs entirely on the userâ€™s machine. It intercepts code you are reading on GitHub, StackOverflow, MDN, or any supported site, and provides guided explanations, reviews, documentation drafts, and refactoring suggestions. When Chromeâ€™s on-device AI APIs are unavailable, the extension falls back to a deterministic heuristic engine, ensuring every request returns a result.

Key traits:

- **100% local execution.** Chrome Built-in AI (Prompt, Writer, Rewriter, Proofreader, Summarizer, Language Detector) is used when available; otherwise, a bundled heuristic analyzer steps in. No source code leaves the browser.
- **Multi-surface UX.** Users interact through the popup, persistent sidebar, keyboard shortcuts, and a DevTools panel dedicated to privacy and telemetry.
- **Educational focus.** Storytelling and gamification systems reinforce what the AI explains, turning raw analysis into guided learning.
- **Integration aware.** GitHub, StackOverflow, MDN, and package registry data can be pulled on demand with user-provided tokens.

---

## 2. Capabilities

| Capability | Description | Implementation |
|------------|-------------|----------------|
| Code explanation | Multi-layer explanation with context, patterns, and analogies | `chromeBuiltinAI.analyzeCode(type='explain')` with heuristics fallback |
| Bug hunting | Identifies unsafe flows and suggests fixes | `chromeBuiltinAI.analyzeCode(type='debug')` + heuristic scan |
| Documentation draft | Generates documentation outlines and examples | `chromeBuiltinAI.analyzeCode(type='document')` + Markdown templates |
| Refactor suggestions | Highlights complexity and structure improvements | `chromeBuiltinAI.analyzeCode(type='refactor')` + static metrics |
| Code review | Summarises risk, quality, and next actions | `chromeBuiltinAI.analyzeCode(type='review')` |
| Storytelling mode | Converts code into educational scenes | Service worker `generate-story` + deterministic scene builder |
| Gamification | XP, levels, badges, streaks | Stored via `chrome.storage.local` |
| Telemetry dashboard | Privacy counters, storage usage, AI readiness | DevTools panel (`devtools/panel.html`) |
| Integrations | GitHub, StackOverflow, MDN, npm/PyPI | Background modules (`background/modules/*`) with caching |

The popup automatically tracks AI readiness. If `chrome.runtime.sendMessage` is unavailable (e.g., running inside an embedded frame), a MAIN-world bridge relays messages to the service worker. If the service worker cannot respond within 1.5s, the local analysis fallback is returned.

---

## 3. Architecture

The codebase is partitioned into three logical layers that mirror the browser runtime:

1. **Extension runtime (service worker, content scripts, devtools)** – all MV3 entry points and background orchestration live here.
2. **Application surfaces (React bundle)** – the popup/options UI compiled with Vite/React/TypeScript.
3. **Shared libraries** – reusable utilities for telemetry, analytics, integration clients, and local heuristics.

`
DevMentorIA/
├── manifest.json               # Manifest V3 entry point
├── background/                 # Service worker + orchestration modules
│   ├── service-worker.js       # Chrome AI orchestration, messaging, storage
│   └── modules/                # AI managers, integrations, session control
├── content/                    # Content script bundle
│   ├── content-script.js       # Injection, selection capture, bridge wiring
│   ├── sidebar-panel.js        # Persistent sidebar host
│   └── assets/styles/          # Scoped styling injected per page
├── devtools/                   # Custom DevTools panel
│   ├── devtools.html           # Panel registration
│   └── panel.html / panel.js   # Privacy + telemetry dashboards
├── frontend-custom/            # React/Vite UI for popup & options
│   ├── src/                    # Components, hooks, i18n, state management
│   └── dist/                   # Built assets consumed by the extension
├── tests/                      # Unit and behavioural harnesses
└── utils/                      # Shared analytics, telemetry, helpers
`

### Runtime surfaces

- **Service Worker (ackground/service-worker.js)**  
  Owns lifecycle events, AI capability probing, message routing, fallback orchestration, caching, alarms, and integration adapters (GitHub, StackOverflow, MDN, package registries). It is the single source of truth for Chrome Built‑in AI sessions.

- **Content Scripts (content/)**  
  Mount the sidebar UI, listen for selection events, and run the MAIN-world bridge that relays messages for surfaces where chrome.runtime is unavailable. Also responsible for injecting CSS and keeping panel state in sync.

- **Popup / Options (rontend-custom)**  
  React-based experience compiled with Vite. Hosts analysis controls, storytelling, gamification, GitHub insights, and settings. Automatically degrades to local heuristics when the AI channel is unavailable.

- **DevTools Panel (devtools/panel.html)**  
  Presents operational metrics: AI availability, privacy counters (network requests, bytes sent), storage usage, and quick maintenance actions for developers.
---

## 4. Getting Started

### 4.1 Prerequisites

1. **Chrome 130 or later** (or Chromium with Chrome Built-in AI support).  
2. **Chrome Built-in AI** must be enabled once per profile:
   - Visit `chrome://flags`.
   - Enable the following flags and relaunch:
     - `#optimization-guide-on-device-model`
     - `#prompt-api-for-gemini-nano`
     - `#summarization-api-for-gemini-nano`
     - `#writer-rewriter-api-for-gemini-nano`
   - After relaunch, allow 5â€“10 minutes for the Gemini Nano model to download (check console with `await chrome.ai.languageModel.capabilities()`; status should be `readily`).

### 4.2 Installation (Load Unpacked)

1. Clone the repository:
   ```bash
   git clone https://github.com/v1olegrace/DevMentorIA.git
   cd DevMentorIA
   ```
2. Build UI assets (optional for first run; prebuilt assets live in `dist-frontend/`):
   ```bash
   cd frontend-custom
   npm install
   npm run build
   cd ..
   ```
   The `npm run build` step generates assets in `frontend-custom/dist` which are consumed by the extension.
3. Load the extension:
   - Open `chrome://extensions/`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the repository root (`DevMentorIA/`).

### 4.3 Verifying AI availability

Open the extension popup. If AI is still initialising, the popup falls back to local heuristics, but you can confirm readiness by checking the DevTools panel (`Chrome Menu > More Tools > Developer Tools > DevMentor AI`) which surfaces AI status.

---

## 5. Usage Guide

### Popup

1. Paste code into the main input or select code on a supported page and click **Analyze**.  
2. Choose a function (Explain, Bugs, Docs, Optimize, Review).  
3. Results appear either within the page sidebar (if injection succeeded) or in the console/popup if messaging fails.  
4. Use the **Storytelling** tab to turn the last analyzed snippet into an educational narrative.  
5. Explore **Gamification** to monitor XP, levels, streaks, and badges.

### Sidebar

- Automatically injected on supported domains.  
- Displays analysis, allows min/max, supports keyboard shortcuts (see DevTools panel for mappings).  
- Provides quick actions for copying or expanding results.

### DevTools Panel

- Shows live AI capability status, privacy counters (network requests, bytes sent), storage usage, and quick actions (clear storage, export, reset).  
- Tabs: Analysis history, privacy dashboard, metrics, settings.

### GitHub Integration

- Configure the GitHub token via popup settings to unlock higher rate limits.  
- Features include repository analysis, trend detection, code search, and dependency insights.  
- Calls are routed directly to GitHub; tokens never leave the browser.

---

## 6. Development Workflow

| Task | Command |
|------|---------|
| Install popup dependencies | `cd frontend-custom && npm install` |
| Start popup in dev mode | `npm run dev` (serves at `http://localhost:5173`) |
| Build popup assets | `npm run build` |
| ESLint (popup) | `npm run lint` |
| Run unit tests (extension) | `npm test` from repository root |

During development:

1. Run `npm run dev` inside `frontend-custom` to iterate UI components with hot reload.  
2. After changes, build the assets (`npm run build`).  
3. Reload the extension via `chrome://extensions/` â†’ `Reload` button to pick up new bundles.

---

## 7. Repository Structure

| Path | Description |
|------|-------------|
| `background/` | Service worker and AI modules orchestrating extension behaviour |
| `content/` | Content scripts, sidebar host, MAIN-world bridge |
| `frontend-custom/` | React/Vite source for popup/options UI |
| `devtools/` | DevTools integration assets |
| `utils/` | Shared analytics, telemetry, helper utilities |
| `tests/` | Unit and behavioural tests |
| `scripts/` | Build integration scripts (copying assets, HTML path fixes) |

---

## 8. Privacy & Security

- **No remote processing.** All AI calls target the local Chrome Built-in AI implementation; the fallback engine runs locally.  
- **Opt-in integrations.** GitHub or other APIs activate only when configured by the user. Tokens are stored using `chrome.storage.local`, encrypted by Chrome.  
- **Telemetry transparency.** DevTools privacy dashboard exposes counters for outbound requests, data volume, and processing location.  
- **Content Security Policy.** Extension pages and service worker enforce MV3 CSP restrictions; no `eval`, inline script injection, or remote script loading is performed.

---

## 9. Troubleshooting

| Symptom | Resolution |
|---------|------------|
| Popup stuck on â€œinitialisingâ€ | Ensure Chrome 130+, flags enabled, and Gemini Nano downloaded. The popup automatically falls back, but DevTools > DevMentor AI shows readiness details. |
| â€œCould not establish connection. Receiving end does not exist.â€ | Content script not injected on current domain. Use the popup input directly or switch to a supported domain. |
| GitHub rate limiting | Add a personal access token in **Settings â†’ Integrations** within the popup. |
| Sidebar not appearing | Page may block script injection. Use the popup or DevTools panel instead; analysis results are still delivered via fallback logging. |
| Want to disable analytics | Use DevTools â†’ Settings tab to export/clear storage; no remote analytics exist. |

---

## 10. Testing Strategy

- `npm test` (root) runs unit and integration harnesses covering core background logic.  
- Additional scripted flows reside in `tests/` and focus on AI request handling, storage cleanup, and GitHub integration behaviour.  
- When working on popup UI, rely on component-level testing within the Vite project and manual validation via Chromeâ€™s extension reloader.

---

## 11. Roadmap

- Optional Gemini Pro cloud handoff for users who opt-in.  
- Expanded static analysis rules for additional languages.  
- Team sharing of analysis results via secure sync.  
- Automatic import of project context from local repositories.

---

## 12. License

This project is licensed under the [MIT License](./LICENSE).

---

## 13. Contributing

Contributions are welcome. Fork the repository, open a pull request with detailed rationale, and include test coverage or manual validation steps. For feature requests or bugs, use [GitHub Issues](https://github.com/v1olegrace/DevMentorIA/issues).

---

<div align="center">

**Designed, engineered, and documented to run entirely at the edge.**

</div>


