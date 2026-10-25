import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import vm from 'node:vm'

function extractFunction(source, signature) {
  const start = source.indexOf(signature)
  assert.ok(start !== -1, signature)
  let depth = 0
  let opened = false

  for (let index = start; index < source.length; index += 1) {
    const character = source[index]
    if (character === '{') {
      depth += 1
      opened = true
    } else if (character === '}') {
      depth -= 1
      if (opened && depth === 0) {
        return source.slice(start, index + 1)
      }
    }
  }

  throw new Error(`Could not extract ${signature}`)
}

function loadEditingHelpers() {
  const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8')
  const program = [
    extractFunction(source, 'function escapeHtml'),
    extractFunction(source, 'function copyWithSelection'),
    extractFunction(source, 'async function copyText'),
  ].join('\n')
  const context = { document: null, navigator: null, toasts: [] }
  context.showToast = (message) => {
    context.toasts.push(message)
  }
  vm.runInNewContext(`${program}\nglobalThis.escapeHtml = escapeHtml;\nglobalThis.copyText = copyText;`, context)
  return context
}

function fakeDocument(copyOk) {
  return {
    execCommand() {
      return copyOk
    },
    createElement() {
      return {
        value: '',
        style: {},
        setAttribute() {},
        focus() {},
        select() {},
      }
    },
    body: {
      appendChild() {},
      removeChild() {},
    },
  }
}

describe('dossier editing', () => {
  it('keeps angle brackets in preview text', () => {
    const context = loadEditingHelpers()

    assert.equal(context.escapeHtml('Cut on <silence> then <cut to black>.'), 'Cut on &lt;silence&gt; then &lt;cut to black&gt;.')
    assert.equal(context.escapeHtml('Signal <north> & "quotes"'), 'Signal &lt;north&gt; &amp; &quot;quotes&quot;')
  })

  it('announces a copy only when the browser accepts it', async () => {
    const context = loadEditingHelpers()
    context.document = fakeDocument(true)
    context.navigator = { clipboard: { writeText: async () => { throw new Error('should not be called') } } }

    await context.copyText('Northline brief', 'Full brief copied.')

    assert.deepEqual(context.toasts, ['Full brief copied.'])
  })

  it('uses the async clipboard when selection copy is rejected', async () => {
    const context = loadEditingHelpers()
    const writes = []
    context.document = fakeDocument(false)
    context.navigator = {
      clipboard: {
        writeText: async (text) => {
          writes.push(text)
        },
      },
    }

    await context.copyText('Northline brief', 'Full brief copied.')

    assert.deepEqual(writes, ['Northline brief'])
    assert.deepEqual(context.toasts, ['Full brief copied.'])
  })

  it('does not claim success when every copy method fails', async () => {
    const context = loadEditingHelpers()
    context.document = fakeDocument(false)
    context.navigator = { clipboard: { writeText: async () => { throw new Error('denied') } } }

    await context.copyText('Northline brief', 'Full brief copied.')

    assert.deepEqual(context.toasts, ['Copy failed. Use a download instead.'])
  })
})
