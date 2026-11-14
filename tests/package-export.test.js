import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

function loadExports() {
  const context = vm.createContext({ document: { addEventListener() {} } });
  vm.runInContext(readFileSync(new URL('../trailer-checklist.js', import.meta.url), 'utf8'), context);
  vm.runInContext(readFileSync(new URL('../script.js', import.meta.url), 'utf8'), context);
  return vm.runInContext('({ buildTrailerPackage, unwrapImportedContent, buildDeliveryChecklist })', context);
}

const complete = {
  title: 'Signal <north>', storyHook: 'A signal arrives.', character: 'Name: Scout',
  lore: 'A silent station.', scenes: '1. Wake up.\n\n2. <cut to black>',
  prompts: 'Scene 1 Prompt:\n"A silent station."', narration: 'Follow the signal.'
};

function exportDraft(api, content) {
  return api.buildTrailerPackage({
    currentProjectId: 'trial',
    projects: [{ id: 'trial', title: content.title, updatedAt: '2026-11-14T00:00:00Z', content }]
  }, complete);
}

test('package exports the current draft and survives import without losing creative text', () => {
  const api = loadExports();
  const payload = exportDraft(api, complete);
  assert.equal(payload.deliveryChecklist.ready, true);
  assert.equal(payload.summary.keyScenes, 2);
  assert.equal(payload.summary.promptBlocks, 1);
  assert.equal(payload.project.content.scenes, complete.scenes);
  assert.ok(payload.brief.includes('<cut to black>'));
  assert.deepEqual(JSON.parse(JSON.stringify(api.unwrapImportedContent(payload))), complete);
});

for (const [field, id, label] of [
  ['storyHook', 'story-hook', 'Story hook'], ['character', 'character', 'Character'],
  ['lore', 'lore', 'Lore'], ['scenes', 'scenes', 'Key scenes'],
  ['prompts', 'prompts', 'Image prompts'], ['narration', 'narration', 'Narration']
]) {
  test(`clearing ${field} reaches both package checklist and exported brief`, () => {
    const api = loadExports();
    const draft = { ...complete, [field]: ' \n ' };
    const payload = exportDraft(api, draft);
    assert.equal(payload.deliveryChecklist.ready, false);
    assert.equal(payload.deliveryChecklist.items.find(item => item.id === id).ok, false);
    assert.ok(payload.brief.includes(`MISSING ${label}:`));
    assert.deepEqual(
      JSON.parse(JSON.stringify(payload.deliveryChecklist)),
      JSON.parse(JSON.stringify(api.buildDeliveryChecklist(payload.project.content)))
    );
    assert.equal(payload.sourceDraft.content[field], complete[field]);
  });
}
