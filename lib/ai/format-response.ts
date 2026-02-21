/**
 * Response Post-Processor
 * =======================
 * Forces proper formatting even if the AI doesn't fully comply
 * with system prompt formatting rules. Applied to cached responses
 * and as a final pass on completed responses.
 */

export function enforceResponseFormatting(response: string): string {
  let formatted = response;

  // 1. If response is one giant paragraph (no line breaks) and over 200 chars, break it up
  if (!formatted.includes('\n') && formatted.length > 200) {
    // Split on sentence endings followed by common transition words
    formatted = formatted
      .replace(/\. (First|Next|Then|Also|And |But |However|Remember|Finally|Here'?s|You should|You can|To |The |Another|One |If you)/g, '.\n\n$1')
      .replace(/\. (\d\.)/g, '.\n\n$1')
      .replace(/: (First|1\.|•|-\s)/g, ':\n\n$1');
  }

  // 2. Convert inline numbered lists to bullet points
  // Pattern: "First, X. Second, Y. Third, Z."
  formatted = formatted.replace(
    /First,\s*([^.]+)\.\s*(?:Second|Next),\s*([^.]+)\.\s*(?:Third|Then|Finally),\s*([^.]+)\./gi,
    '- $1\n- $2\n- $3'
  );

  // 3. Ensure there's a line break before bullet points that follow sentences
  formatted = formatted.replace(/([.!?])\s*(•|►|- )/g, '$1\n\n$2');

  // 4. Add line break before action-oriented closers
  formatted = formatted.replace(
    /([.!?])\s*(Your move:|Next step:|Try this:|Here's what to do:|Want me to)/g,
    '$1\n\n$2'
  );

  // 5. Clean up excessive line breaks
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // 6. Strip excessive bold — keep only the FIRST bold phrase, remove the rest
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let boldCount = 0;
  formatted = formatted.replace(boldPattern, (match, content) => {
    boldCount++;
    if (boldCount <= 1) {
      return match; // Keep the first bold
    }
    return content; // Strip bold markers from subsequent ones
  });

  // 7. Remove references to external tools (safety net)
  const externalTools = [
    /\b(?:NIL Connections|NILGo|Opendorse|INFLCR|Teamworks)\b/gi,
    /(?:NCAA-approved tools? like|services? like|platforms? like)\s+\w+/gi,
  ];

  for (const pattern of externalTools) {
    formatted = formatted.replace(pattern, 'ChatNIL');
  }

  return formatted.trim();
}
