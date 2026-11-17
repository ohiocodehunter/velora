import slugifyLib from 'slugify';

export function toSlug(text) {
  return slugifyLib(String(text), { lower: true, strict: true, trim: true });
}

/** Generates a slug that is unique for the given model, appending -2, -3 … */
export async function uniqueSlug(Model, text, excludeId = null) {
  const base = toSlug(text) || 'item';
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

export default toSlug;
