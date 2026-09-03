export function estimateReadingTime(body) {
  if (!Array.isArray(body)) return null;
  const words = body
    .filter((block) => block._type === 'block')
    .flatMap((block) => block.children || [])
    .map((span) => span.text || '')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words === 0) return null;
  return Math.max(1, Math.round(words / 200));
}