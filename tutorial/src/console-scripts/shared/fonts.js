// Shared by the console scripts, inserted where a script has `// @include shared/fonts.js` (see `index.ts`), after
// `shared/api.js`. Expects `teamId` to be defined.
//
// Custom fonts belong to a team, each with its own id: texts of a file coming from another team (import) or from a
// converter (empty id) refer to unknown ids, shown as "Missing font". They are relinked to the team font having the
// same family.

// Family name → font id of the team, and all the valid ids
const loadTeamFonts = async () => {
  const familyToId = new Map();
  const validIds = new Set();
  for (const variant of await call('get-font-variants', { teamId })) {
    const id = `custom-${variant.fontId}`;
    validIds.add(id);
    if (!familyToId.has(variant.fontFamily)) familyToId.set(variant.fontFamily, id);
  }
  return { familyToId, validIds };
};

// Replaces in place every unknown font id whose family exists in the team, returns the number of replacements.
// Families without a team font are added to `missingFamilies` (font not added to the team, or under another name)
const relinkFonts = ({ familyToId, validIds }, value, missingFamilies) => {
  let count = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    const fontId = node['~:font-id'];
    if (typeof fontId === 'string' && (fontId === '' || (fontId.startsWith('custom-') && !validIds.has(fontId)))) {
      const replacement = familyToId.get(node['~:font-family']);
      if (replacement) {
        node['~:font-id'] = replacement;
        // Custom font variants are named `<style>-<weight>` (`normal-500`), some converters only write the weight
        const variantId = node['~:font-variant-id'];
        if (typeof variantId === 'string' && /^\d+$/.test(variantId)) {
          node['~:font-variant-id'] = `${node['~:font-style'] || 'normal'}-${variantId}`;
        }
        count++;
      } else if (node['~:font-family'] === 'sourcesanspro') {
        // Penpot's built-in default font, left by the Figma plugin when it did not get the font of a text style
        node['~:font-id'] = 'sourcesanspro';
        if (/^(normal-)?400$/.test(node['~:font-variant-id'] ?? '')) node['~:font-variant-id'] = 'regular';
        count++;
      } else missingFamilies.add(node['~:font-family']);
    }
    Object.values(node).forEach(walk);
  };
  walk(value);
  return count;
};
