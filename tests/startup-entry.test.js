import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import vm from 'node:vm'

describe('file opening route', () => {
  it('loads classic scripts so index.html can initialise from a file URL', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8')
    const checklistTag = html.indexOf('<script src="trailer-checklist.js" defer></script>')
    const appTag = html.indexOf('<script src="script.js" defer></script>')

    assert.equal(html.includes('type="module"'), false)
    assert.ok(checklistTag !== -1)
    assert.ok(appTag !== -1)
    assert.ok(checklistTag < appTag)
    assert.equal(/^\s*import\s/m.test(script), false)
  })

  it('exposes the checklist from the classic script without a module loader', () => {
    const source = readFileSync(new URL('../trailer-checklist.js', import.meta.url), 'utf8')
    const context = { globalThis: {} }
    context.globalThis = context
    vm.runInNewContext(source, context)

    const checklist = context.buildDeliveryChecklist({
      storyHook: 'A cure disguised as a virus.',
      character: 'Name: Kael',
      lore: 'The year is 2742.',
      scenes: '1. The glyph flares.',
      prompts: 'Scene 1 Prompt:\n"Close on the glyph."',
      narration: 'They say the code is a virus.',
    })

    assert.equal(checklist.ready, true)
    assert.equal(typeof context.module, 'undefined')
  })
})
