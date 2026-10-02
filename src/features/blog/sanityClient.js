import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export function urlForImage(source) {
  if (!source?.asset?._ref) return null;
  const ref = source.asset._ref; // e.g. image-abc123-800x600-jpg
  const [, id, dimensions, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${import.meta.env.VITE_SANITY_PROJECT_ID}/${import.meta.env.VITE_SANITY_DATASET}/${id}-${dimensions}.${format}`;
}