// Shared by the console scripts, inserted where a script has `// @include shared/api.js` (see `index.ts`).
// Defines `log`, `call` (Penpot RPC API with the session of the user) and `toVerbose`.
const started = Date.now();
const log = (message) => console.log(`[${Math.round((Date.now() - started) / 1000)} s] ${message}`);

// Large files take a while to download, so the progress is reported every few seconds
const call = async (method, body, transit = false) => {
  const response = await fetch(`/api/main/methods/${method}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': transit ? 'application/transit+json' : 'application/json',
      Accept: transit ? 'application/transit+json' : 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`${method} : erreur ${response.status} ${text.slice(0, 500)}`);
    // Kept whole for the validation errors of `update-file`, whose details tell how to fix the file
    try {
      error.body = toVerbose(JSON.parse(text));
    } catch {}
    throw error;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  let lastReport = Date.now();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
    if (Date.now() - lastReport > 3000) {
      log(`  ${method} : ${(size / 1e6).toFixed(0)} Mo reçus…`);
      lastReport = Date.now();
    }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  // Some mutations answer an empty body
  const text = new TextDecoder().decode(bytes);
  const result = text ? JSON.parse(text) : null;
  return transit ? toVerbose(result) : result;
};

// Production instances answer the compact transit JSON (maps as `["^ ", key, value…]`, repeated keys replaced by
// cache references `^0`, `^1`…). It is converted into the verbose one (maps as objects, no cache), simpler to walk
// and also accepted by the backend.
const toVerbose = (root) => {
  if (!Array.isArray(root)) return root;
  let cache = [];
  const read = (value, asMapKey = false) => {
    if (typeof value === 'string') {
      if (value[0] === '^' && value !== '^ ') {
        const index = value.length === 2 ? value.charCodeAt(1) - 48 : (value.charCodeAt(1) - 48) * 44 + value.charCodeAt(2) - 48;
        return cache[index];
      }
      // Cached: map keys, keywords, symbols and tags, longer than 3 characters
      if (value.length > 3 && (asMapKey || (value[0] === '~' && ':$#'.includes(value[1])))) {
        if (cache.length === 44 * 44) cache = [];
        cache.push(value);
      }
      return value;
    }
    if (!Array.isArray(value) || value.length === 0) return value;
    if (value[0] === '^ ') {
      const map = {};
      for (let i = 1; i < value.length; i += 2) {
        const key = read(value[i], true);
        map[key] = read(value[i + 1]);
      }
      return map;
    }
    // Tagged values (`["~#set", […]]`…), read in order since the tag can be cached
    const first = read(value[0]);
    if (value.length === 2 && typeof first === 'string' && first.startsWith('~#')) return { [first]: read(value[1]) };
    return [first, ...value.slice(1).map((item) => read(item))];
  };
  return read(root);
};
