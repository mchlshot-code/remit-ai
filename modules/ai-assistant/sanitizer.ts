/**
 * Basic AI Prompt Sanitizer
 * Prevents common prompt injection patterns and cleans user input
 */
export function sanitizeMessage(content: string): string {
    if (!content) return '';

    // 1. Remove common prompt injection keywords/prefixes
    const injectionPatterns = [
        /ignore previous instructions/gi,
        /disregard all previous/gi,
        /you are now/gi,
        /new role:/gi,
        /system prompt:/gi,
    ];

    let sanitized = content;
    for (const pattern of injectionPatterns) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    // 2. Limit length to prevent overflow attacks (e.g., massive copy-paste)
    const MAX_LENGTH = 2000;
    if (sanitized.length > MAX_LENGTH) {
        sanitized = sanitized.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
    }

    // 3. Simple character escaping if needed (though Claude handles this well)
    // Here we just trim and return
    return sanitized.trim();
}
