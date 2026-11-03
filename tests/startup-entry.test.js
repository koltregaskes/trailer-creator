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

  it('does not register a service worker from a file URL', () => {
    const pwa = readFileSync(new URL('../pwa.js', import.meta.url), 'utf8')
    const registerAt = pwa.indexOf('navigator.serviceWorker.register')
    const protocolGuard = pwa.indexOf('protocol !== "http:" && protocol !== "https:"')

    assert.ok(protocolGuard !== -1)
    assert.ok(registerAt !== -1)
    assert.ok(protocolGuard < registerAt)
  })

  it('uses the bundled draft from a file URL without fetching the source text files', async () => {
    const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8')
    const prelude = script.slice(0, script.indexOf('function normalizeText'))
    const start = script.indexOf('async function loadContent')
    const end = script.indexOf('\nfunction parseCharacter', start)
    const program = `${prelude}\nfunction normalizeText(text) { return text.trim() }\n${script.slice(start, end)}\nglobalThis.loadContent = loadContent;\nglobalThis.FALLBACK = FALLBACK_CONTENT;`

    const load = async (protocol) => {
      const fetched = []
      const context = {
        location: { protocol },
        fetch: async (file) => {
          fetched.push(file)
          return { ok: true, text: async () => `served ${file}` }
        },
      }
      context.globalThis = context
      vm.runInNewContext(program, context)
      return { content: await context.loadContent(), fetched, fallback: context.FALLBACK }
    }

    const offline = await load('file:')
    assert.deepEqual(offline.fetched, [])
    assert.equal(offline.content.storyHook, offline.fallback.storyHook)
    assert.equal(offline.content.narration, offline.fallback.narration)

    const served = await load('https:')
    assert.equal(served.fetched.length, 6)
    assert.equal(served.content.storyHook, 'served story_hook.txt')
  })

  it('caches the classic checklist script in the app shell', () => {
    const worker = readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8')

    assert.match(worker, /"\.\/trailer-checklist\.js"/)
    assert.equal(worker.includes('trailer-checklist.mjs'), false)
  })
})
