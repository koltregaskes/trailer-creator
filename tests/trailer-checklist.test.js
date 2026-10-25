import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildDeliveryChecklist } from '../trailer-checklist.mjs'

describe('trailer delivery checklist', () => {
  it('accepts a complete dossier from raw text', () => {
    const checklist = buildDeliveryChecklist({
      storyHook: 'A cure disguised as a virus.',
      character: 'Name: Kael',
      lore: 'The year is 2742.',
      scenes: '1. The glyph flares.\n\n2. The graveyard drifts.',
      prompts: 'Scene 1 Prompt:\n"Close on the glyph."\n\nScene 2 Prompt:\n"Wide graveyard."',
      narration: 'They say the code is a virus.',
    })

    assert.equal(checklist.ready, true)
    assert.deepEqual(
      checklist.items.map((entry) => [entry.id, entry.ok, entry.detail]),
      [
        ['story-hook', true, 'Hook is present'],
        ['character', true, 'Character is present'],
        ['lore', true, 'Lore is present'],
        ['scenes', true, '2 scenes'],
        ['prompts', true, '2 prompts'],
        ['narration', true, '7 words'],
      ],
    )
  })

  it('flags empty fields and accepts already parsed scene and prompt lists', () => {
    const checklist = buildDeliveryChecklist({
      storyHook: '   ',
      character: '',
      lore: 'Still here.',
      scenes: ['The glyph flares.', '  '],
      prompts: [{ title: 'Scene 1 Prompt', body: '' }],
      narration: '\n',
    })

    assert.equal(checklist.ready, false)
    assert.equal(checklist.items.find((entry) => entry.id === 'story-hook')?.detail, 'Story hook is empty')
    assert.equal(checklist.items.find((entry) => entry.id === 'character')?.ok, false)
    assert.equal(checklist.items.find((entry) => entry.id === 'lore')?.ok, true)
    assert.equal(checklist.items.find((entry) => entry.id === 'scenes')?.detail, '1 scene')
    assert.equal(checklist.items.find((entry) => entry.id === 'prompts')?.detail, '1 prompt')
    assert.equal(checklist.items.find((entry) => entry.id === 'narration')?.detail, 'Narration is empty')
  })
})
