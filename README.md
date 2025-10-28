<div align="center">

# DevMentor AI - On-Device Code Mentor for Chrome

**Manifest V3 extension that explains, reviews, and teaches code directly in the browser using Chrome Built-in AI, with deterministic fallbacks when AI capabilities are unavailable.**

[Chrome 130+](https://www.google.com/chrome/) | [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) | [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/) | MIT License

</div>

---

## 1. Overview

DevMentor AI is a privacy-first developer assistant that runs entirely on the user machine. It intercepts code you are reading on GitHub, StackOverflow, MDN, or any supported site, and provides guided explanations, reviews, documentation drafts, and refactoring suggestions. When Chrome built-in AI APIs are unavailable, the extension falls back to a deterministic heuristic engine so every request still returns a result.

Key traits:

- 100% local execution. Chrome Built-in AI (Prompt, Writer, Rewriter, Proofreader, Summarizer, Language Detector) is used when available; otherwise, a bundled heuristic analyzer steps in. No source code leaves the browser.
- Multi-surface UX. Users interact through the popup, persistent sidebar, keyboard shortcuts, and a DevTools panel dedicated to privacy and telemetry.
- Educational focus. Storytelling and gamification systems reinforce explanations, turning raw analysis into guided learning.
- Integration aware. GitHub, StackOverflow, MDN, and package registry data can be pulled on demand with user-provided tokens.

---

## 2. Capabilities

| Capability | Description | Implementation |
|------------|-------------|----------------|
| Code explanation | Multi-layer explanation with context, patterns, and analogies | `chromeBuiltinAI.analyzeCode(type='explain')` with heuristic fallback |
| Bug hunting | Identifies unsafe flows and suggests fixes | `chromeBuiltinAI.analyzeCode(type='debug')` plus static scan |
| Documentation draft | Generates documentation outlines and examples | `chromeBuiltinAI.analyzeCode(type='document')` plus Markdown templates |
| Refactor suggestions | Highlights complexity and structure improvements | `chromeBuiltinAI.analyzeCode(type='refactor')` plus structural metrics |
| Code review | Summarises risk, quality, and next actions | `chromeBuiltinAI.analyzeCode(type='review')` |
| Storytelling mode | Converts code into educational scenes | Service worker `generate-story` with deterministic fallback |
| Gamification | XP, levels, badges, streaks | Stored via `chrome.storage.local` |
| Telemetry dashboard | Privacy counters, storage usage, AI readiness | DevTools panel (`devtools/panel.html`) |
| Integrations | GitHub, StackOverflow, MDN, npm/PyPI | Background modules (`background/modules/*`) with caching |

The popup tracks AI readiness in real time. If `chrome.runtime.sendMessage` is unavailable (for example inside an embedded frame), a MAIN-world bridge relays the request to the service worker. If the service worker does not respond within 1.5 seconds, the local analysis fallback is returned.

---

## 3. Architecture

The codebase is partitioned into three logical layers that mirror the Chrome runtime:

1. Extension runtime (service worker, content scripts, devtools) - all Manifest V3 entry points and background orchestration live here.
2. Application surfaces (React bundle) - the popup and options UI compiled with Vite, React, and TypeScript.
3. Shared libraries - reusable utilities for telemetry, analytics, integration clients, and fallback heuristics.

```
DevMentorIA/
|-- manifest.json               # Manifest V3 entry point
|-- background/                 # Service worker and orchestration modules
|   |-- service-worker.js       # Chrome AI orchestration, messaging, storage
|   `-- modules/                # AI managers, integrations, session control
|-- content/                    # Content script bundle
|   |-- content-script.js       # Injection, selection capture, bridge wiring
|   |-- sidebar-panel.js        # Persistent sidebar host
|   `-- assets/styles/          # Scoped styling injected per page
|-- devtools/                   # Custom DevTools panel
|   |-- devtools.html           # Panel registration
|   `-- panel.html / panel.js   # Privacy and telemetry dashboards
|-- frontend-custom/            # React/Vite UI for popup and options
|   |-- src/                    # Components, hooks, i18n, state management
|   `-- dist/                   # Built assets consumed by the extension
|-- tests/                      # Unit and behavioural harnesses
`-- utils/                      # Shared analytics, telemetry, helpers
```

### Runtime surfaces

- **Service worker (`background/service-worker.js`)**
  - Handles lifecycle events, AI capability probing, message routing, fallback orchestration, caching, alarms, and integration adapters.
- **Content scripts (`content/`)**
  - Mount the sidebar UI, listen for selection events, and run the MAIN-world bridge that relays messages when `chrome.runtime` is not reachable.
- **Popup and options (`frontend-custom/`)**
  - React-based experience with analysis controls, storytelling, gamification, GitHub insights, and settings. Automatically degrades to local heuristics when AI channels fail.
- **DevTools panel (`devtools/panel.html`)**
  - Presents operational metrics: AI availability, privacy counters, storage usage, and quick maintenance actions for developers.

---

## 4. Getting Started

### 4.1 Prerequisites

1. Chrome 130 or later (or Chromium with Chrome Built-in AI support).
2. Enable Chrome Built-in AI once per profile:
   - Visit `chrome://flags`.
   - Enable the following flags and relaunch:
     - `#optimization-guide-on-device-model`
     - `#prompt-api-for-gemini-nano`
     - `#summarization-api-for-gemini-nano`
     - `#writer-rewriter-api-for-gemini-nano`
   - After relaunch, allow 5-10 minutes for the Gemini Nano model to download. Confirm with `await chrome.ai.languageModel.capabilities()`; the `available` field should read `readily`.

### 4.2 Installation (Load Unpacked)

1. Clone the repository:
   ```bash
   git clone https://github.com/v1olegrace/DevMentorIA.git
   cd DevMentorIA
   ```
2. Build UI assets (optional for first run; prebuilt assets exist in `dist-frontend/`):
   ```bash
   cd frontend-custom
   npm install
   npm run build
   cd ..
   ```
3. Load the extension:
   - Open `chrome://extensions/`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the repository root (`DevMentorIA/`).

### 4.3 Verifying AI availability

Open the extension popup. If AI is still initialising, the UI falls back to local heuristics. You can confirm readiness in the DevTools panel (`Chrome Menu > More Tools > Developer Tools > DevMentor AI`).

---

## 5. Usage Guide

### Popup workflow

1. Paste code into the main input or select code on a supported page and click **Analyze**.
2. Choose a function (Explain, Bugs, Docs, Optimize, Review).
3. Results appear in the sidebar when injection succeeds, or in the console/popup when messaging fails.
4. Use the **Storytelling** tab to turn the last analyzed snippet into an educational narrative.
5. Explore **Gamification** to monitor XP, levels, streaks, and badges.

### Sidebar workflow

- Automatically injected on supported domains.
- Displays analysis, allows minimize / maximize, and supports keyboard shortcuts (see the DevTools panel for mappings).
- Provides quick actions for copying or expanding results.

### DevTools panel

- Shows AI capability status, privacy counters (network requests, bytes sent), storage usage, and quick actions (clear storage, export, reset).

### GitHub integration

- Configure the GitHub token via popup settings to unlock higher rate limits.
- Features include repository analysis, trend detection, code search, and dependency insights.
- Calls are routed directly to GitHub; tokens never leave the browser.

---

## 6. Development Workflow

| Task | Command |
|------|---------|
| Install popup dependencies | `cd frontend-custom && npm install` |
| Start popup in dev mode | `npm run dev` |
| Build popup assets | `npm run build` |
| Lint React code | `npm run lint` |
| Run extension tests | `npm test` (repository root) |

Development tips:

1. Run `npm run dev` inside `frontend-custom` to iterate UI components with hot reload.
2. After making changes, build the assets (`npm run build`).
3. Reload the extension via `chrome://extensions/` to pick up new bundles.

---

## 7. Privacy and Security

- No remote processing. All AI calls use the browser-resident Chrome Built-in AI implementation. The fallback engine also runs locally.
- Opt-in integrations. GitHub and other APIs activate only when configured by the user. Tokens are stored with `chrome.storage.local` and never leave the browser.
- Telemetry transparency. The DevTools privacy dashboard exposes counters for outbound requests, data volume, and processing location.
- Strict content security policy. Extension pages and the service worker comply with Manifest V3 CSP. No `eval`, inline scripts, or remote script loading is performed.

---

## 8. Troubleshooting

| Symptom | Resolution |
|---------|------------|
| Popup stuck on "initialising" | Ensure Chrome 130+, required flags enabled, and Gemini Nano downloaded. The DevTools panel displays readiness details. |
| "Could not establish connection. Receiving end does not exist." | Content script was not injected on the current domain. Use the popup input directly or switch to a supported domain. |
| GitHub rate limiting | Add a personal access token in **Settings > Integrations** within the popup. |
| Sidebar not appearing | The page may block script injection. Use the popup or DevTools panel; the analysis still completes via the fallback channel. |
| Disable analytics | Use the DevTools Settings tab to export or clear storage. No remote analytics exist. |

---

## 9. Testing Strategy

- `npm test` (repository root) runs unit and integration harnesses covering core background logic.
- Additional scripted flows inside `tests/` focus on AI request handling, storage cleanup, and GitHub integration behaviour.
- For popup UI work, rely on Vite component testing and manual verification via the Chrome extension loader.

---

## 10. Roadmap

- Optional Gemini Pro cloud handoff for users who opt in.
- Additional static analysis heuristics for more languages.
- Team sharing of analysis results via secure sync.
- Automatic import of project context from local repositories.

---

## 11. License

This project is licensed under the [MIT License](./LICENSE).

---

## 12. Contributing

Contributions are welcome. Fork the repository, open a pull request with detailed rationale, and include test coverage or manual validation steps. For feature requests or bug reports, use [GitHub Issues](https://github.com/v1olegrace/DevMentorIA/issues).

---

<div align="center">

Built to execute entirely at the edge.

</div>
