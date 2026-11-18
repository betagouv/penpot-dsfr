// Relinks the orphan component copies of a mockups file to the components of its DSFR libraries.
//
// Penpot derives the id of a component (and of its main instance) from the Figma component key, which differs for every
// copy or version of a Figma library. Mockups converted from a Figma file using another DSFR file than the one converted
// for Penpot (the team's own copy, the official file, an older version…) therefore have copies whose component does not
// exist: Penpot offers to "Restore main component". The elements inside a copy are still found, their ids deriving from
// the Figma node ids, stable across copies and versions:
// - a nested copy refers to the copy placed inside a library main, which tells its component;
// - a top-level copy gets the component whose main contains most of the elements its descendants refer to;
// - without any match (all its elements were excluded from the DSFR files), a component with the same name is used
//   when there is exactly one.
// Only the libraries linked to the file are searched.
//
// To paste into the browser console from the dashboard of the team in Penpot, right after importing the mockups and
// before opening them: the file and the libraries to link are asked, the latest DSFR version being suggested. The
// libraries are linked to the file, then the copies and the fonts are relinked in a single save, with `ignore-touched`.
(async () => {
  const teamId = location.href.match(/team-id=([0-9a-f-]{36})/)?.[1];
  if (!teamId) throw new Error('Ouvrez d’abord une page de votre équipe dans Penpot (son adresse doit contenir « team-id= »)');

  // @include shared/api.js
  // @include shared/fonts.js

  // Since Penpot 2.19.3, every save validates the whole file and detaches the copies whose component is not found
  // ("auto-repair"). Opening the file saves small fixes right away (fonts, text layouts), so the copies would be
  // detached before being relinked: the file is chosen from the dashboard, and must not have been opened
  if (/file-id=/.test(location.href)) {
    throw new Error('Lancez ce script depuis le tableau de bord de l’équipe, sans ouvrir le fichier de maquettes');
  }
  const files = [];
  for (const project of await call('get-projects', { teamId })) {
    // Projects in the trash are listed too, while their files are not marked as deleted
    if (project.deletedAt) continue;
    files.push(...(await call('get-project-files', { projectId: project.id })));
  }
  const mockups = files.filter((file) => !file.isShared);
  const fileAnswer = prompt(
    'Numéro du fichier de maquettes à relier au DSFR (importé, jamais ouvert) :\n' +
      mockups.map((file, index) => `${index + 1}. ${file.name}`).join('\n')
  );
  const fileId = mockups[Number(fileAnswer) - 1]?.id;
  if (!fileId) throw new Error('Aucun fichier choisi');

  // Libraries to link to the file. Suggested: for each DSFR library (Composants, Fondamentaux, Pictogrammes), the
  // highest version, then the most recent import when the same version was imported several times
  const sharedFiles = files.filter((file) => file.isShared);
  const versionOf = (name) => (name.match(/v(\d+)\.(\d+)(?:\.(\d+))?/) ?? []).slice(1).map((part) => Number(part ?? 0));
  const compareVersions = (a, b) => [0, 1, 2].map((i) => (a[i] ?? -1) - (b[i] ?? -1)).find((diff) => diff) ?? 0;
  const bestByKind = new Map();
  for (const library of sharedFiles) {
    if (!/^DSFR\b/i.test(library.name)) continue;
    const kind = library.name
      .split(/\s+-\s+/)
      .at(-1)
      .trim()
      .toLowerCase();
    const best = bestByKind.get(kind);
    const order = best && (compareVersions(versionOf(library.name), versionOf(best.name)) || new Date(library.createdAt) - new Date(best.createdAt));
    if (!best || order > 0) bestByKind.set(kind, library);
  }
  const suggested = [...bestByKind.values()].map((library) => sharedFiles.indexOf(library) + 1).sort((a, b) => a - b);
  // Libraries imported several times have the same name: their import date tells them apart
  const sameName = (library) => sharedFiles.filter((other) => other.name === library.name).length > 1;
  const librariesAnswer = prompt(
    'Numéros des bibliothèques à relier au fichier, séparés par des virgules (la version la plus récente du DSFR est proposée) :\n' +
      sharedFiles
        .map(
          (library, index) =>
            `${index + 1}. ${library.name}${sameName(library) ? ` (importée le ${new Date(library.createdAt).toLocaleString()})` : ''}`
        )
        .join('\n'),
    suggested.join(', ')
  );
  const chosenLibraries = (librariesAnswer ?? '')
    .split(/[^0-9]+/)
    .map((number) => sharedFiles[Number(number) - 1])
    .filter(Boolean);
  if (!chosenLibraries.length) throw new Error('Aucune bibliothèque choisie');
  const alreadyLinked = new Set((await call('get-file-libraries', { fileId })).map((library) => library.id));
  for (const library of chosenLibraries) {
    if (alreadyLinked.has(library.id)) continue;
    await call('link-file-to-library', { fileId, libraryId: library.id });
    log(`Bibliothèque « ${library.name} » reliée au fichier`);
  }

  const shapeOf = (wrapped) => wrapped?.['~#shape'] ?? wrapped;
  const objectsOf = (file) => {
    const objects = new Map();
    for (const [pageId, page] of Object.entries(file['~:data']?.['~:pages-index'] ?? {})) {
      for (const [id, wrapped] of Object.entries(page?.['~:objects'] ?? {})) objects.set(id, { shape: shapeOf(wrapped), pageId });
    }
    return objects;
  };
  // Names compared without case, accents nor punctuation
  const simplify = (text) =>
    String(text ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  log('Chargement du fichier…');
  const file = await call('get-file', { '~:id': `~u${fileId}` }, true);
  const fileObjects = objectsOf(file);
  log(`« ${file['~:name']} » : ${fileObjects.size} élément(s)`);

  // Libraries linked to the file (directly or through another library), with for each shape the main containing it
  // The chosen ones first: the elements of a component keep the same ids in every version and import of a DSFR
  // library, so an element found in several libraries is relinked to the chosen one
  const libraries = [];
  const chosenIds = chosenLibraries.map((library) => library.id);
  const linked = (await call('get-file-libraries', { fileId })).sort(
    (a, b) => (chosenIds.indexOf(a.id) + 1 || Infinity) - (chosenIds.indexOf(b.id) + 1 || Infinity)
  );
  for (const { id, name } of linked) {
    log(`Bibliothèque « ${name} » : chargement…`);
    const library = await call('get-file', { '~:id': `~u${id}` }, true);
    const objects = objectsOf(library);
    const components = library['~:data']['~:components'] ?? {};
    const owners = new Map();
    const byName = new Map();
    for (const [componentId, component] of Object.entries(components)) {
      if (component['~:deleted']) continue;
      const mainId = component['~:main-instance-id'];
      const walk = (shapeId) => {
        const entry = objects.get(shapeId);
        if (!entry) return;
        owners.set(shapeId, { componentId, mainId });
        for (const childId of entry.shape['~:shapes'] ?? []) walk(childId);
      };
      walk(mainId);
      const key = simplify(`${component['~:path'] ?? ''} ${component['~:name']}`);
      byName.set(key, [...(byName.get(key) ?? []), { componentId, mainId }]);
    }
    libraries.push({ id: `~u${id}`, name, objects, components, owners, byName });
  }
  if (!libraries.length) throw new Error('Ce fichier n’est relié à aucune bibliothèque : ajoutez-lui d’abord les bibliothèques du DSFR');

  const componentExists = (fileRef, componentId) => {
    const component = libraries.find((library) => library.id === fileRef)?.components[componentId];
    return !!component && !component['~:deleted'];
  };

  const changes = [];
  const relinked = { nested: 0, voted: 0, named: 0 };
  const warnings = [];
  const set = (attr, val) => ({ '~:type': '~:set', '~:attr': attr, '~:val': val, '~:ignore-touched': true });
  const relink = (shapeId, pageId, libraryId, componentId, mainId) => {
    changes.push({
      '~:type': '~:mod-obj',
      '~:id': shapeId,
      '~:page-id': pageId,
      '~:operations': [set('~:component-id', componentId), set('~:component-file', libraryId), ...(mainId ? [set('~:shape-ref', mainId)] : [])],
    });
  };
  // A copy whose component cannot be found is detached like Penpot's repair would do, Penpot not always detecting it
  // (component from a library unknown to the file): it keeps its look, without the broken link
  const detach = (shapeId, pageId) =>
    changes.push({
      '~:type': '~:mod-obj',
      '~:id': shapeId,
      '~:page-id': pageId,
      '~:operations': [
        ...['~:component-id', '~:component-file', '~:component-root', '~:shape-ref', '~:remote-synced'].map((attr) => set(attr, null)),
        { '~:type': '~:set-touched', '~:touched': null },
      ],
    });

  for (const [shapeId, { shape, pageId }] of fileObjects) {
    const componentId = shape['~:component-id'];
    if (!componentId || componentExists(shape['~:component-file'], componentId)) continue;
    const name = shape['~:name'];

    // Nested copy: the element it refers to is a copy inside a library main, carrying its component
    const reference = libraries
      .map((library) => ({ library, target: library.objects.get(shape['~:shape-ref'])?.shape }))
      .find(({ target }) => target?.['~:component-id']);
    if (reference) {
      const { library, target } = reference;
      relink(shapeId, pageId, target['~:component-file'] ?? library.id, target['~:component-id']);
      relinked.nested++;
      continue;
    }

    // Top-level copy: vote of its descendants for the main containing the elements they refer to
    const votes = new Map();
    let total = 0;
    const walk = (childId) => {
      const child = fileObjects.get(childId)?.shape;
      if (!child) return;
      total++;
      const library = libraries.find((candidate) => candidate.owners.has(child['~:shape-ref']));
      if (library) {
        const owner = library.owners.get(child['~:shape-ref']);
        const key = `${library.id}|${owner.componentId}|${owner.mainId}`;
        votes.set(key, (votes.get(key) ?? 0) + 1);
      }
      for (const grandChildId of child['~:shapes'] ?? []) walk(grandChildId);
    };
    for (const childId of shape['~:shapes'] ?? []) walk(childId);

    const [best] = [...votes.entries()].sort((a, b) => b[1] - a[1]);
    if (best) {
      const [libraryId, votedId, mainId] = best[0].split('|');
      const component = libraries.find((library) => library.id === libraryId).components[votedId];
      const componentName = `${component['~:path'] ?? ''} / ${component['~:name']}`;
      relink(shapeId, pageId, libraryId, votedId, mainId);
      relinked.voted++;
      if (!simplify(componentName).includes(simplify(name))) warnings.push(`« ${name} » relié à « ${componentName} » (nom différent)`);
      continue;
    }

    // No match at all: a component with the same name, when there is exactly one
    const candidates = libraries.flatMap((library) =>
      [...library.byName.entries()]
        .filter(([key]) => key.endsWith(simplify(name)))
        .flatMap(([, list]) => list.map((entry) => ({ ...entry, libraryId: library.id })))
    );
    if (candidates.length === 1) {
      const [{ libraryId, componentId: namedId, mainId }] = candidates;
      relink(shapeId, pageId, libraryId, namedId, mainId);
      relinked.named++;
      warnings.push(`« ${name} » relié par son nom (${total} élément(s) sans correspondance)`);
    } else if (String(name).startsWith('🚫')) {
      // Helpers of the Figma DSFR files (layout grids…), excluded from the files converted for Penpot
      detach(shapeId, pageId);
      warnings.push('Élément « 🚫 » (repère du fichier Figma, absent du DSFR pour Penpot) détaché, sans effet sur l’affichage');
    } else {
      detach(shapeId, pageId);
      warnings.push(
        `« ${name} » non relié, détaché (${candidates.length ? `${candidates.length} composants de même nom` : 'aucune correspondance'})`
      );
    }
  }

  // Fonts relinked in the same save: mockups converted from Figma have empty font ids (`""`), and a save of the font
  // script before this one would trigger the auto-repair detaching the copies
  const teamFonts = await loadTeamFonts();
  const missingFamilies = new Set();
  // The Figma plugin writes `sourcesanspro` (Penpot's default font) when Figma does not give the font of a text style
  // from a library, with an empty font id that Penpot sets to `sourcesanspro` once the file is opened. Inside a
  // component copy, the font is taken back from the same text of the library main, the nodes of both contents (root,
  // paragraphs, text runs) being matched by position
  const fontKeys = ['~:font-family', '~:font-id', '~:font-variant-id', '~:font-weight', '~:font-style'];
  const isFallbackFont = (node) => node?.['~:font-family'] === 'sourcesanspro' && (!node['~:font-id'] || node['~:font-id'] === 'sourcesanspro');
  const restoreFromMain = (content, mainContent) => {
    let count = 0;
    let firstMainRun = null;
    const findFirstRun = (node) => {
      if (firstMainRun || !node || typeof node !== 'object') return;
      if (node['~:font-family'] && node['~:text'] !== undefined) firstMainRun = node;
      else (node['~:children'] ?? []).forEach(findFirstRun);
    };
    findFirstRun(mainContent);
    const walk = (node, mainNode) => {
      if (!node || typeof node !== 'object') return;
      if (isFallbackFont(node)) {
        const source = mainNode?.['~:font-family'] && !isFallbackFont(mainNode) ? mainNode : firstMainRun;
        if (source) {
          for (const key of fontKeys) if (source[key] !== undefined) node[key] = source[key];
          count++;
        }
      }
      (node['~:children'] ?? []).forEach((child, index) => walk(child, mainNode?.['~:children']?.[index]));
    };
    walk(content, mainContent);
    return count;
  };
  const mainTextOf = (shape) => {
    for (const library of libraries) {
      const main = library.objects.get(shape['~:shape-ref'])?.shape;
      if (main?.['~:type'] === '~:text') return main;
    }
    return null;
  };

  let fontChanges = 0;
  for (const [shapeId, { shape, pageId }] of fileObjects) {
    if (shape['~:type'] !== '~:text') continue;
    const main = mainTextOf(shape);
    const restored = main ? restoreFromMain(shape['~:content'], main['~:content']) : 0;
    const relinked = relinkFonts(teamFonts, shape['~:content'], missingFamilies);
    // A layout measured with the fallback font (file opened before) no longer matches the restored font: it is cleared
    // so Penpot measures the text again, as it does when it fixes fonts itself
    const staleLayout =
      (shape['~:position-data'] ?? []).some((entry) => entry?.['~:font-family'] === 'sourcesanspro') &&
      !JSON.stringify(shape['~:content']).includes('"sourcesanspro"');
    if (!relinked && !restored && !staleLayout) continue;
    changes.push({
      '~:type': '~:mod-obj',
      '~:id': shapeId,
      '~:page-id': pageId,
      '~:operations': [set('~:content', shape['~:content']), ...(restored || staleLayout ? [set('~:position-data', null)] : [])],
    });
    fontChanges++;
  }
  for (const typography of Object.values(file['~:data']['~:typographies'] ?? {})) {
    if (!relinkFonts(teamFonts, typography, missingFamilies)) continue;
    changes.push({ '~:type': '~:mod-typography', '~:typography': typography });
    fontChanges++;
  }
  log(`${fontChanges} texte(s) et typographie(s) à relier à la police de l’équipe`);
  if (missingFamilies.size) console.warn(`Polices absentes de l’équipe : ${[...missingFamilies].join(', ')}`);

  log(
    `${relinked.voted + relinked.nested + relinked.named} copie(s) à relier : ${relinked.voted} par leurs éléments, ${relinked.nested} imbriquée(s), ${relinked.named} par leur nom`
  );
  // Identical warnings grouped (many copies of the same component in a file)
  const counts = new Map();
  for (const warning of warnings) counts.set(warning, (counts.get(warning) ?? 0) + 1);
  for (const [warning, count] of counts) console.warn(count > 1 ? `${warning} ×${count}` : warning);

  // The backend validates the whole file at each save and rejects it when its references are broken. Besides the
  // copies relinked here, the file can have errors this script cannot relink, the details of the rejection telling how
  // to fix them like Penpot's own repair does:
  // - a nested copy swapped in Figma (another icon in a button…) needs the "swap slot" of the element it replaces;
  // - a copy whose component is still not found (elements excluded from the DSFR files…) is detached, and so are the
  //   copies then left inside a shape that is not a copy anymore;
  // - a copy head gets or loses its root flag depending on whether it is inside another copy.
  const touchedOf = (shapeId) => (fileObjects.get(shapeId)?.shape['~:touched']?.['~#set'] ?? []).filter(Boolean);
  const fixesFor = (details) => {
    const fixes = [];
    for (const detail of details) {
      const code = detail['~:code'];
      const shapeId = `~u${String(detail['~:shape-id']).replace(/^~u/, '')}`;
      const pageId = detail['~:page-id'];
      if (code === '~:missing-slot' && detail['~:args']?.['~:swap-slot']) {
        const slot = String(detail['~:args']['~:swap-slot']).replace(/^~u/, '');
        const touched = [...touchedOf(shapeId).filter((group) => !String(group).startsWith('~:swap-slot-')), `~:swap-slot-${slot}`];
        fixes.push({
          '~:type': '~:mod-obj',
          '~:id': shapeId,
          '~:page-id': pageId,
          '~:operations': [{ '~:type': '~:set-touched', '~:touched': { '~#set': touched } }],
        });
      } else if (['~:component-not-found', '~:ref-shape-not-found', '~:not-head-copy-not-allowed', '~:not-head-main-not-allowed'].includes(code)) {
        fixes.push({
          '~:type': '~:mod-obj',
          '~:id': shapeId,
          '~:page-id': pageId,
          '~:operations': [
            ...['~:component-id', '~:component-file', '~:component-root', '~:shape-ref', '~:remote-synced'].map((attr) => set(attr, null)),
            { '~:type': '~:set-touched', '~:touched': null },
          ],
        });
      } else if (code === '~:root-copy-not-allowed' || code === '~:nested-copy-not-allowed') {
        // A copy head inside another copy is not a root, a copy head outside of any copy is one
        const root = code === '~:nested-copy-not-allowed' ? true : null;
        fixes.push({ '~:type': '~:mod-obj', '~:id': shapeId, '~:page-id': pageId, '~:operations': [set('~:component-root', root)] });
      } else {
        return null;
      }
    }
    return fixes;
  };

  // Batches of about 5 MB, an older revn being accepted by the backend while each save increments it
  const batches = [];
  let batchSize = Infinity;
  for (const change of changes) {
    const size = JSON.stringify(change).length;
    if (batchSize + size > 5e6) {
      batches.push([]);
      batchSize = 0;
    }
    batches.at(-1).push(change);
    batchSize += size;
  }
  let revn = file['~:revn'];
  const sessionId = `~u${crypto.randomUUID()}`;
  for (let batch of batches) {
    for (let attempt = 1; ; attempt++) {
      try {
        await call(
          'update-file',
          {
            '~:id': `~u${fileId}`,
            '~:session-id': sessionId,
            '~:revn': revn,
            '~:vern': file['~:vern'],
            '~:features': file['~:features'],
            '~:changes': batch,
          },
          true
        );
        revn++;
        break;
      } catch (error) {
        const details = error.body?.['~:code'] === '~:referential-integrity' ? error.body['~:details'] : null;
        const fixes = details && attempt < 8 ? fixesFor(details) : null;
        if (!fixes) throw error;
        const counts = {};
        for (const detail of details) counts[detail['~:code'].slice(2)] = (counts[detail['~:code'].slice(2)] ?? 0) + 1;
        log(`Enregistrement refusé par Penpot (${JSON.stringify(counts)}), correction et nouvel essai…`);
        batch = [...batch, ...fixes];
      }
    }
  }
  log(changes.length ? 'Terminé : vous pouvez ouvrir le fichier.' : 'Terminé : rien à relier, vous pouvez ouvrir le fichier.');
})().catch((error) => console.error('Le script s’est arrêté :', error));
