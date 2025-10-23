export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/,/g, '')       // Remove commas
    .replace(/\s+/g, '-')    // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove anything weird (optional)
}
export function denormalize(str: string): string {
  return str
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}

