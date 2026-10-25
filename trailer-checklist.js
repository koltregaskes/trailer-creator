(function (root, factory) {
  var api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.buildDeliveryChecklist = api.buildDeliveryChecklist;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function textOf(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function sceneBlocks(value) {
    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean);
    }

    return textOf(value)
      .split(/\r?\n\r?\n+/)
      .map((block) => block.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }

  function promptBlocks(value) {
    if (Array.isArray(value)) {
      return value
        .map((entry) => {
          if (typeof entry === 'string') return entry.trim();
          if (entry && typeof entry === 'object') return `${entry.title || ''}\n${entry.body || ''}`.trim();
          return '';
        })
        .filter(Boolean);
    }

    return textOf(value)
      .split(/\r?\n\r?\n+/)
      .map((block) => block.trim())
      .filter(Boolean);
  }

  function item(id, label, ok, detail) {
    return { id, label, ok, detail };
  }

  function buildDeliveryChecklist(content = {}) {
    const scenes = sceneBlocks(content.scenes);
    const prompts = promptBlocks(content.prompts);
    const narrationWords = textOf(content.narration).split(/\s+/).filter(Boolean).length;
    const items = [
      item(
        'story-hook',
        'Story hook',
        textOf(content.storyHook).length > 0,
        textOf(content.storyHook).length > 0 ? 'Hook is present' : 'Story hook is empty',
      ),
      item(
        'character',
        'Character',
        textOf(content.character).length > 0,
        textOf(content.character).length > 0 ? 'Character is present' : 'Character is empty',
      ),
      item(
        'lore',
        'Lore',
        textOf(content.lore).length > 0,
        textOf(content.lore).length > 0 ? 'Lore is present' : 'Lore is empty',
      ),
      item(
        'scenes',
        'Key scenes',
        scenes.length > 0,
        scenes.length > 0 ? `${scenes.length} scene${scenes.length === 1 ? '' : 's'}` : 'No key scenes',
      ),
      item(
        'prompts',
        'Image prompts',
        prompts.length > 0,
        prompts.length > 0 ? `${prompts.length} prompt${prompts.length === 1 ? '' : 's'}` : 'No image prompts',
      ),
      item(
        'narration',
        'Narration',
        narrationWords > 0,
        narrationWords > 0 ? `${narrationWords} words` : 'Narration is empty',
      ),
    ];

    return {
      items,
      ready: items.every((entry) => entry.ok),
    };
  }

  return { buildDeliveryChecklist };
});
