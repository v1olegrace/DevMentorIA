/**
 * Generates deterministic, educational fallback content when Chrome AI
 * is not available. The current implementation returns canned responses
 * tailored to each action.
 */
/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-object-injection */

const TEMPLATES = {
  explain: ({ snippet }) => ({
    title: 'How the code works',
    summary: [
      'Breaks the input into smaller steps.',
      'Applies each step in order.',
      'Returns the final value back to the caller.'
    ],
    snippet
  }),
  debug: ({ snippet }) => ({
    issues: [
      'Validate user input before processing.',
      'Handle unexpected null or undefined values.',
      'Wrap asynchronous logic with try/catch blocks.'
    ],
    snippet
  }),
  document: ({ snippet }) => ({
    description: 'Auto-generated documentation',
    parameters: [
      { name: 'input', detail: 'Primary data processed by the function.' }
    ],
    returns: 'Result produced after applying the main algorithm.',
    snippet
  }),
  refactor: ({ snippet }) => ({
    suggestions: [
      'Extract helper functions to clarify intent.',
      'Replace mutable variables with const when possible.',
      'Add unit tests that cover success and failure scenarios.'
    ],
    snippet
  }),
  review: ({ snippet }) => ({
    strengths: [
      'Readable naming conventions.',
      'Clear separation of responsibilities.'
    ],
    improvements: [
      'Add inline documentation for complex branches.',
      'Consider performance when processing large datasets.'
    ],
    snippet
  })
};

export class DevMentorEducationalAI {
  generate (type, code, context = {}) {
    const template = TEMPLATES[type] ?? (() => ({ snippet: code }));
    const snippet = code?.slice(0, 400) ?? '';
    return {
      type,
      generatedAt: Date.now(),
      context,
      ...template({ snippet, context })
    };
  }
}

export default DevMentorEducationalAI;
