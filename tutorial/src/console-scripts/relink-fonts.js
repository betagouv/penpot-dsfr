// Relinks the texts and typographies of all the team files to the team custom fonts having the same family.
//
// Custom fonts belong to a team, each with its own id. An imported `.penpot` file keeps the font ids of the team it
// was exported from, so its texts show "Missing font" ("Police supprimée"). Penpot only fixes them by family name
// page by page, when a page is opened: libraries, never opened, keep the unknown ids and so does every new instance
// of their components.
//
// To paste into the browser console from any page of the team in Penpot (dashboard included), then open the files
// (or refresh the tabs where they are open).
// It only uses the Penpot API with the session of the user, the transit format keeping the types of the data
// (uuids, keywords), and `ignore-touched` so no component copy is marked as overridden.
(async () => {
  const teamId = location.href.match(/team-id=([0-9a-f-]{36})/)?.[1];
  if (!teamId) throw new Error('Ouvrez d’abord une page de votre équipe dans Penpot (son adresse doit contenir « team-id= »)');

  // @include shared/api.js
  // @include shared/fonts.js

  const teamFonts = await loadTeamFonts();
  log(`Polices de l’équipe : ${[...teamFonts.familyToId.keys()].join(', ') || 'aucune'}`);
  let missingFamilies;
  const relink = (value) => relinkFonts(teamFonts, value, missingFamilies);

  const set = (attr, val) => ({ '~:type': '~:set', '~:attr': attr, '~:val': val, '~:ignore-touched': true });

  // All the files of the team: the libraries for their main components and typographies, but also the files using
  // them, whose component copies keep their own content with the old font ids. Not `get-team-shared-files`, which
  // computes a summary of each library by loading them all on the server.
  // Projects in the trash are listed too (with the date of their permanent deletion as `deletedAt`), while their
  // files are not marked as deleted: they are skipped
  const files = [];
  for (const project of await call('get-projects', { teamId })) {
    if (project.deletedAt) continue;
    files.push(...(await call('get-project-files', { projectId: project.id })));
  }
  log(`${files.length} fichier(s) dans l’équipe`);

  // Relinking the typographies of a library updates their modification date, so Penpot would then offer to update
  // every file using them ("There are updates in shared libraries"), the sync always seeing a difference since it
  // copies the whole typography (path, date…) into the texts. Files up to date with a library before the script are
  // marked as synced again at the end. Updates already pending are left untouched. A link never synced (right after
  // an import) counts as up to date: the files of a release are consistent.
  //
  // This is a shortcut: Penpot calls `update-file-library-sync-status` after applying a real sync (component copies,
  // typographies, colors… through `generate-sync-file-changes`), while here only the sync marker is set, without any
  // sync. It holds because the only library change in between is the font relinking, already applied to every file by
  // this script. Any other library change made while the script runs would be hidden, hence closing the files first.
  const upToDateLinks = [];
  for (const { id } of files) {
    for (const library of await call('get-file-libraries', { fileId: id })) {
      if (!library.isIndirect && (!library.syncedAt || new Date(library.modifiedAt) <= new Date(library.syncedAt))) {
        upToDateLinks.push({ fileId: id, libraryId: library.id });
      }
    }
  }

  const failures = [];
  for (const [index, { id, name }] of files.entries()) {
    const prefix = `${index + 1}/${files.length} « ${name} »`;
    try {
      log(`${prefix} : chargement…`);
      const file = await call('get-file', { '~:id': `~u${id}` }, true);
      const data = file['~:data'];
      if (!data?.['~:pages-index']) {
        throw new Error(
          `format inattendu (clés : ${Object.keys(data ?? file)
            .slice(0, 20)
            .join(', ')})`
        );
      }
      const changes = [];
      missingFamilies = new Set();

      // Component main instances live on pages, so texts of pages cover them. Only the content is updated: the
      // position data keeps the same geometry (same font), and its font ids are not used to load nor draw the fonts
      for (const [pageId, page] of Object.entries(data['~:pages-index'])) {
        for (const [shapeId, wrapped] of Object.entries(page?.['~:objects'] ?? {})) {
          const shape = wrapped?.['~#shape'] ?? wrapped;
          if (shape?.['~:type'] !== '~:text' || !relink(shape['~:content'])) continue;
          // The backend validates every modified shape: an already invalid position data (NaN, missing size…) would
          // reject the whole batch, so it is cleared like Penpot does when fixing fonts, to be measured again
          const positionData = shape['~:position-data'];
          const invalidPositionData =
            Array.isArray(positionData) &&
            positionData.some((entry) => !entry || ['~:x', '~:y', '~:width', '~:height'].some((key) => !Number.isFinite(entry[key])));
          changes.push({
            '~:type': '~:mod-obj',
            '~:id': shapeId,
            '~:page-id': pageId,
            '~:operations': [set('~:content', shape['~:content']), ...(invalidPositionData ? [set('~:position-data', null)] : [])],
          });
        }
      }
      for (const typography of Object.values(data['~:typographies'] ?? {})) {
        if (relink(typography)) changes.push({ '~:type': '~:mod-typography', '~:typography': typography });
      }

      log(
        `${prefix} : ${changes.length} élément(s) à relier` +
          (missingFamilies.size ? `, polices absentes de l’équipe : ${[...missingFamilies].join(', ')}` : '')
      );

      // Batches of about 5 MB: the backend loads the whole file for each save, so few large batches are much faster
      // (a DSFR file can have about 20,000 texts), while staying far below request size limits
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

      // An older revn is accepted by the backend, but each save increments it
      let revn = file['~:revn'];
      let saved = 0;
      const sessionId = `~u${crypto.randomUUID()}`;
      const skipped = [];
      for (let batch of batches) {
        for (;;) {
          try {
            await call(
              'update-file',
              {
                '~:id': `~u${id}`,
                '~:session-id': sessionId,
                '~:revn': revn,
                '~:vern': file['~:vern'],
                '~:features': file['~:features'],
                '~:changes': batch,
              },
              true
            );
            break;
          } catch (error) {
            // A shape invalid for another reason rejects the whole batch: it is left as is, and the batch sent again
            const invalidId = error.message.match(/~:shape-id"[,:]"(~u[0-9a-f-]{36})"/)?.[1];
            if (!invalidId || !batch.some((change) => change['~:id'] === invalidId)) throw error;
            batch = batch.filter((change) => change['~:id'] !== invalidId);
            skipped.push(invalidId.slice(2));
            console.warn(`${prefix} : forme ${invalidId.slice(2)} invalide pour Penpot, laissée telle quelle`);
          }
        }
        revn++;
        saved += batch.length;
        log(`${prefix} : ${saved}/${changes.length} enregistré(s)`);
      }
      if (skipped.length) failures.push(`${name} (${skipped.length} forme(s) invalide(s) non reliée(s))`);
    } catch (error) {
      // Logged and skipped, the other files are still processed
      console.error(`${prefix} : échec`, error);
      failures.push(name);
    }
  }
  for (const { fileId, libraryId } of upToDateLinks) {
    try {
      await call('update-file-library-sync-status', { fileId, libraryId });
    } catch (error) {
      // Only means Penpot will offer an update that changes nothing but the fonts
      console.warn('Statut de synchronisation non mis à jour', error);
    }
  }
  if (upToDateLinks.length) log(`${upToDateLinks.length} lien(s) entre fichiers et bibliothèques marqué(s) à jour`);

  if (failures.length) console.error(`Échec pour ${failures.length} fichier(s) : ${failures.join(', ')} (détails ci-dessus)`);
  log('Terminé : vous pouvez ouvrir vos fichiers (ou rafraîchir les onglets déjà ouverts).');
})().catch((error) => console.error('Le script s’est arrêté :', error));
