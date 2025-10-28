import type { FunctionType } from "@/components/FunctionBar";

function collectMetrics(code: string) {
  const trimmed = code.trim();
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const functionMatches = trimmed.match(/function\s+\w+|=>/g) || [];
  const classMatches = trimmed.match(/class\s+\w+/g) || [];
  const asyncMatches = trimmed.match(/async\s+|\bawait\b/g) || [];
  const controlFlowMatches = trimmed.match(/for\s*\(|while\s*\(|switch\s*\(/g) || [];
  const importMatches = trimmed.match(/import\s+|require\(/g) || [];
  const commentMatches = trimmed.match(/\/\/|\/\*|\*/g) || [];
  const todoMatches = trimmed.match(/TODO|FIXME/gi) || [];
  const hasErrorHandling = /try\s*{[\s\S]*?catch\s*\(/.test(trimmed);
  const hasTests = /(describe|it|test)\s*\(/.test(trimmed);

  return {
    lineCount: lines.length,
    functionCount: functionMatches.length,
    classCount: classMatches.length,
    asyncCount: asyncMatches.length,
    controlFlowCount: controlFlowMatches.length,
    importCount: importMatches.length,
    commentCount: commentMatches.length,
    todoCount: todoMatches.length,
    hasErrorHandling,
    hasTests,
  };
}

function detectHighlights(code: string): string[] {
  const highlights: string[] = [];
  if (/fetch|axios|http\.|XMLHttpRequest/i.test(code)) {
    highlights.push("- Performs HTTP/remote requests.");
  }
  if (/useState|useEffect|setState|dispatch\(.*\)/i.test(code)) {
    highlights.push("- Manages state in a UI flow (React style hooks detected).");
  }
  if (/SELECT\s+|INSERT\s+|UPDATE\s+|DELETE\s+/i.test(code)) {
    highlights.push("- Interacts with a database or SQL-like statements.");
  }
  if (/new\s+Promise|async\s+function|await\s+/i.test(code)) {
    highlights.push("- Uses asynchronous flows/promises.");
  }
  if (/console\.log|console\.error/i.test(code)) {
    highlights.push("- Includes logging statements.");
  }
  if (/try\s*{[\s\S]*?catch\s*\(/.test(code)) {
    highlights.push("- Contains explicit error handling logic.");
  }
  if (/class\s+\w+|constructor\s*\(/.test(code)) {
    highlights.push("- Uses object oriented patterns (class/constructor).");
  }
  if (/module\.exports|export\s+default|export\s+{/.test(code)) {
    highlights.push("- Exposes functionality via modules/exports.");
  }
  if (/\/\/\s*@ts-ignore|any\s+/i.test(code)) {
    highlights.push("- Uses broad typing or suppressions that may hide issues.");
  }
  return highlights;
}

function lintSuggestions(code: string): string[] {
  const suggestions: string[] = [];
  if (!/try\s*{[\s\S]*?catch\s*\(/.test(code) && /await|Promise|fetch|axios/i.test(code)) {
    suggestions.push("- Wrap asynchronous calls with try/catch so failures surface gracefully.");
  }
  if (!/default\s*:\s*/.test(code) && /switch\s*\(/.test(code)) {
    suggestions.push("- Add a default branch to switch statements to cover unexpected values.");
  }
  if (!/return\s+|=>/.test(code) && /function\s+\w+\s*\(/.test(code)) {
    suggestions.push("- Ensure functions return meaningful values or explicitly document side-effects.");
  }
  if (!/^\s*['"`][^'"`]+['"`]\s*:\s*/m.test(code) && /{[\s\S]*}/.test(code)) {
    suggestions.push("- Consider extracting configuration objects/constants for readability.");
  }
  if (!/console\./.test(code) && /(catch\s*\(|throws|throw\s+)/.test(code)) {
    suggestions.push("- Provide logging or telemetry inside error paths for easier debugging.");
  }
  if (!/(describe|it|test)\s*\(/.test(code)) {
    suggestions.push("- Create at least one automated test that covers the happy path and edge cases.");
  }
  if ((code.match(/==[^=]/g) || []).length > 0) {
    suggestions.push("- Replace loose equality (==) with strict equality (===) to avoid coercion bugs.");
  }
  if ((code.match(/var\s+/g) || []).length > 0) {
    suggestions.push("- Prefer const/let instead of var to respect block scoping.");
  }
  return suggestions;
}

function formatList(items: string[], emptyFallback: string) {
  if (!items.length) {
    return `${emptyFallback}`;
  }
  return items.join("\n");
}

function buildExplainSection(code: string) {
  const highlights = detectHighlights(code);
  const lines = [
    "#### What the code is doing",
    formatList(highlights, "- Uses general application logic with no strong signals detected."),
    "",
    "#### How it flows",
    "- Inputs: inspect function parameters and external dependencies.",
    "- Processing: pay attention to conditionals and loops to understand the core algorithm.",
    "- Outputs: note return statements, side-effects (state updates, DOM changes) and exports.",
  ];
  return lines.join("\n");
}

function buildBugSection(code: string, metrics: ReturnType<typeof collectMetrics>) {
  const findings: string[] = [];
  if (!metrics.hasErrorHandling && /async|await|fetch|axios|Promise/i.test(code)) {
    findings.push("- No error handling detected around asynchronous behaviour.");
  }
  if ((code.match(/console\.log|console\.error/g) || []).length > 10) {
    findings.push("- Excessive console logging may hint at debugging leftovers.");
  }
  if ((code.match(/TODO|FIXME/gi) || []).length > 0) {
    findings.push("- TODO/FIXME markers indicate incomplete logic.");
  }
  if (/JSON\.parse\s*\([^)]*\)/.test(code) && !/try\s*{[\s\S]*?catch\s*\(/.test(code)) {
    findings.push("- JSON.parse without try/catch can crash on malformed payloads.");
  }
  if (/setTimeout\s*\([^,]+,\s*0\)/.test(code)) {
    findings.push("- setTimeout with zero delay may hide race conditions; validate assumptions.");
  }
  if (!findings.length) {
    findings.push("- No obvious red flags detected. Run automated/static analysis for deeper coverage.");
  }
  return findings.join("\n");
}

function buildDocsSection(code: string, metrics: ReturnType<typeof collectMetrics>) {
  const signatureHints = (code.match(/function\s+([a-zA-Z0-9_]+)/g) || []).map((match) => match.replace("function", "").trim());
  const docLines = [
    "#### Suggested Documentation Outline",
    "",
    "```markdown",
    "## Summary",
    "Explain in one or two sentences what this module/function solves.",
    "",
    "## Parameters",
  ];

  if (signatureHints.length) {
    signatureHints.slice(0, 5).forEach((name) => {
      docLines.push(`- \`${name}\`: describe purpose, type, and constraints.`);
    });
  } else {
    docLines.push("- Document each parameter and structural dependency.");
  }

  docLines.push(
    "",
    "## Returns",
    "- Clarify return types or side-effects (state updates, DOM mutations, emitted events).",
    "",
    "## Operational Notes",
    "- Pre-conditions: inputs, required environment variables, authentication, feature flags.",
    "- Post-conditions: outputs, persisted state, emitted telemetry.",
    "",
    "## Examples",
    "```js",
    "// Add small examples that demonstrate how to call the main API.",
    "```",
    "",
    `Reference stats: ${metrics.lineCount} lines, ${metrics.functionCount} functions, ${metrics.controlFlowCount} control-flow blocks.`,
  );

  return docLines.join("\n");
}

function buildOptimizeSection(metrics: ReturnType<typeof collectMetrics>) {
  const suggestions: string[] = [];
  if (metrics.controlFlowCount > 5) {
    suggestions.push("- Break large conditional/loop blocks into smaller helpers to reduce cognitive load.");
  }
  if (metrics.functionCount > 8) {
    suggestions.push("- Group related functions into dedicated modules or classes to clarify ownership.");
  }
  if (metrics.importCount === 0 && metrics.lineCount > 80) {
    suggestions.push("- Evaluate splitting the file into cohesive modules to encourage reuse.");
  }
  if (!metrics.hasErrorHandling) {
    suggestions.push("- Introduce guard clauses or error handling to fail fast before doing expensive work.");
  }
  if (!suggestions.length) {
    suggestions.push("- Structure already compact; focus on micro-optimisations only if profiling reveals bottlenecks.");
  }
  return suggestions.join("\n");
}

function buildReviewSection(code: string, metrics: ReturnType<typeof collectMetrics>) {
  const score = Math.max(
    0,
    Math.min(
      10,
      10 -
        Math.floor(
          metrics.lineCount / 120 +
            metrics.functionCount / 6 +
            (metrics.hasErrorHandling ? 0 : 1) +
            (metrics.hasTests ? 0 : 1),
        ),
    ),
  );

  return [
    "#### Quality Snapshot",
    `- Size: ${metrics.lineCount} lines, ${metrics.functionCount} functions.`,
    `- Error handling: ${metrics.hasErrorHandling ? "present" : "missing"}.`,
    `- Tests detected: ${metrics.hasTests ? "yes" : "not detected"}.`,
    `- Comments/TODOs: ${metrics.commentCount} comments, ${metrics.todoCount} TODO/FIXME references.`,
    "",
    `**Estimated score:** ${score}/10 (heuristic based on size, structure and safety signals).`,
    "",
    "#### Next review steps",
    ...lintSuggestions(code),
  ].join("\n");
}

export function generateFallbackAnalysis(code: string, type: FunctionType): string {
  const trimmed = code?.trim() || "";
  if (!trimmed) {
    return "No code provided. Paste or select code to generate an analysis.";
  }

  const metrics = collectMetrics(trimmed);
  const lintAdvice = lintSuggestions(trimmed);

  const base = [
    "### Local Insight (fallback mode)",
    "_Chrome Built-in AI is unavailable; generated with heuristic analysis._",
    "",
    "#### Quick metrics",
    `- Total lines: ${metrics.lineCount}`,
    `- Functions/methods: ${metrics.functionCount}`,
    `- Classes: ${metrics.classCount}`,
    `- Async usage: ${metrics.asyncCount}`,
    `- Control-flow blocks: ${metrics.controlFlowCount}`,
    `- Imports: ${metrics.importCount}`,
    `- Comments: ${metrics.commentCount}`,
    metrics.todoCount ? `- TODO/FIXME markers: ${metrics.todoCount}` : "",
    metrics.hasErrorHandling ? "- Error handling detected." : "- No explicit error handling detected.",
    metrics.hasTests ? "- Test helpers present (describe/it/test)." : "- No automated tests referenced.",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  let focusSection = "";
  switch (type) {
    case "bugs":
      focusSection = `#### Potential issues\n${buildBugSection(trimmed, metrics)}\n`;
      break;
    case "docs":
      focusSection = `${buildDocsSection(trimmed, metrics)}\n`;
      break;
    case "optimize":
      focusSection = `#### Optimisation ideas\n${buildOptimizeSection(metrics)}\n`;
      break;
    case "review":
      focusSection = `${buildReviewSection(trimmed, metrics)}\n`;
      break;
    case "explain":
    default:
      focusSection = `${buildExplainSection(trimmed)}\n`;
      break;
  }

  const lintSection = lintAdvice.length
    ? `#### General advice\n${lintAdvice.join("\n")}\n`
    : "#### General advice\n- Codebase already follows several safe defaults.\n";

  return [base, focusSection, lintSection].join("\n").trim();
}
