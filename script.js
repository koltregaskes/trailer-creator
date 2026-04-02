const CONTENT_FILES = {
  storyHook: 'story_hook.txt',
  character: 'main_character.txt',
  lore: 'lore_snippet.txt',
  scenes: 'key_scenes.txt',
  prompts: 'image_prompts.txt',
  narration: 'narration_script.txt'
};

const FALLBACK_CONTENT = {
  storyHook:
    "In a future where emotions are a programmable commodity, a rogue technician discovers a hidden line of code that could unravel society, or unleash humanity's true potential. They say the code is a virus, but what if it's a cure?",
  character: `Name: Kaelen "Kael" Valerius
Age: 28
Personality: Kael is a brilliant but reclusive xenolinguist, more comfortable with ancient alien dialects than with people. He's driven by an insatiable curiosity and a deep-seated belief that understanding lost languages is the key to preventing future cosmic conflicts. Beneath his often-brusque exterior lies a dry wit and a surprisingly sentimental attachment to the few artifacts he's recovered.
Defining Flaw/Motivation: Kael is haunted by the loss of his mentor, who disappeared while researching a forbidden language. This fuels his obsessive drive to uncover forgotten knowledge, often pushing him to ignore safety protocols and alienate potential allies in his quest for answers, believing he's the only one who can complete his mentor's work and prevent a similar catastrophe.`,
  lore:
    `The year is 2742. Neo-Alexandria, a sprawling city-station adrift in the Sargasso Nebula, is humanity's last bastion of true knowledge, yet it teems with digital ghosts and forgotten data-plagues from fallen empires. Whispers of a "Silent Epoch" approaching - a wave of cosmic entropy that erases information from reality itself - drive scholars and scavengers alike into the nebula's hazardous depths. They seek ancient caches of data, hoping to find a way to anchor their existence before everything known is unwritten, while megacorporations race to weaponize the very silence that threatens to consume all.`,
  scenes: `1. CLOSE UP: Kael Valerius, eyes wide with a mix of terror and revelation, deciphers a glowing, unstable alien glyph that suddenly flares, throwing him back from his console as alarms blare. (Mood: Intense, revelatory, dangerous)

2. WIDE SHOT: A vast, derelict starship graveyard hangs silent in the eerie green glow of the Sargasso Nebula, a tiny scavenger vessel cautiously navigating through the colossal, fractured hulls. (Mood: Ominous, mysterious, isolated)

3. QUICK CUT: A data-stream, visualized as a torrent of corrupted light, surges through Neo-Alexandria's data-hubs, causing city-wide blackouts and panic as screens fill with static. (Mood: Chaotic, urgent, threatening)

4. SLOW MOTION: A lone figure in a weathered spacesuit touches a colossal, ancient stone tablet covered in unknown symbols, a faint pulse of energy emanating from its surface in the darkness of a newly discovered alien vault. (Mood: Awe-inspiring, ancient, hopeful yet perilous)`,
  prompts: `Main Character Prompt:
"Sci-fi concept art, portrait of Kael Valerius, a 28-year-old brilliant but reclusive male xenolinguist. He has intense, intelligent eyes, slightly disheveled dark hair, and is wearing practical, somewhat worn clothing suitable for academic work and light space travel. He looks focused and perhaps a little haunted. Background shows shelves of alien artifacts and glowing holographic scripts. Cinematic lighting, detailed."

Scene 1 Prompt:
"Sci-fi illustration, close-up on a man's face (Kael Valerius), eyes wide with terror and awe. Before him, a complex alien glyph, made of unstable, bright orange energy, flares violently. Sparks fly, console equipment visible. Dramatic, intense lighting, sense of immediate danger. Digital painting, highly detailed."

Scene 2 Prompt:
"Digital matte painting, epic wide shot of a massive derelict starship graveyard in space. Colossal, broken ship hulls drift silently. A tiny, illuminated scavenger ship navigates cautiously through the debris. The scene is bathed in an eerie green glow from the swirling Sargasso Nebula in the background. Ominous, mysterious, vast scale."

Scene 3 Prompt:
"Cyberpunk concept art. A torrent of corrupted, glitching digital light, primarily reds and yellows, surges through the data-hubs of a futuristic city (Neo-Alexandria). City lights flicker and die, screens show static, silhouettes of people in panic. Dynamic, chaotic energy, sense of technological meltdown. Detailed, high contrast."

Scene 4 Prompt:
"Sci-fi cinematic still. A lone astronaut in a weathered, slightly bulky spacesuit stands in a dark, ancient alien vault. Their hand, covered by a glove, touches a colossal stone tablet covered in intricate, faintly glowing unknown symbols. A soft blue pulse of energy emanates from the point of contact. Mysterious, awe-inspiring, ancient technology, volumetric lighting."`,
  narration: `(Sound of eerie silence, then a crackle of static)

VOICEOVER (Deep, serious tone): They say our emotions are just code now. Programmable. Controllable.

(Scene: Quick flash of Neo-Alexandria's data-hubs, then Kael deciphering the glyph)

VOICEOVER: But Kael Valerius, a man haunted by whispers of the past, is about to find a line of code they never intended us to see.

(Scene: Derelict starship graveyard, tiny ship navigating)

VOICEOVER: Deep in the forgotten graveyards of space, where ancient languages sleep...

(Scene: Kael thrown back from console as glyph flares; quick cut to data-stream surge)

VOICEOVER: ...he'll uncover a secret that could rewrite our very being. They call it a virus. A threat to everything we've built.

(Scene: Lone figure touching the ancient stone tablet, pulse of energy)

VOICEOVER: But in a world teetering on the brink of a silent, information-erasing oblivion... what if this forbidden knowledge is not the poison... but the cure?

(Sound: Building crescendo, then sudden cut to title card - implied)

VOICEOVER: The future is a language. And he's the only one left who can read it.`
};

function normalizeText(text) {
  return text
    .replace(/â€”/g, '-')
    .replace(/â€¦/g, '...')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€�/g, '"')
    .trim();
}

async function loadContent() {
  const entries = await Promise.all(
    Object.entries(CONTENT_FILES).map(async ([key, file]) => {
      try {
        const response = await fetch(file, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`Failed to load ${file}`);
        }

        return [key, normalizeText(await response.text())];
      } catch (_) {
        return [key, FALLBACK_CONTENT[key]];
      }
    })
  );

  return Object.fromEntries(entries);
}

function parseCharacter(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');
      return {
        label: label.trim(),
        value: rest.join(':').trim()
      };
    });
}

function parseScenes(text) {
  return text
    .split(/\r?\n\r?\n+/)
    .map((block) => block.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

function parsePrompts(text) {
  return text
    .split(/\r?\n\r?\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [titleLine, ...rest] = block.split(/\r?\n/);
      return {
        title: titleLine.replace(/:$/, '').trim(),
        body: rest.join('\n').replace(/^"|"$/g, '').trim()
      };
    });
}

function buildBrief(content) {
  return [
    'TRAILER CREATOR DOSSIER',
    '',
    'STORY HOOK',
    content.storyHook,
    '',
    'CHARACTER',
    content.character,
    '',
    'LORE',
    content.lore,
    '',
    'KEY SCENES',
    content.scenes,
    '',
    'IMAGE PROMPTS',
    content.prompts,
    '',
    'NARRATION',
    content.narration
  ].join('\n');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('toast--visible');

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 1800);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', 'readonly');
    helper.style.position = 'absolute';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    document.body.removeChild(helper);
  }

  showToast(successMessage);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Brief downloaded.');
}

function renderSummary(content, scenes, prompts) {
  const summaryStrip = document.getElementById('summaryStrip');
  const narrationWords = content.narration.split(/\s+/).filter(Boolean).length;
  const stats = [
    { label: 'Core premise', value: '1 hook', note: 'Single story spark anchored for pitching.' },
    { label: 'Key scenes', value: `${scenes.length} beats`, note: 'A clean trailer rhythm for visuals.' },
    { label: 'Prompt pack', value: `${prompts.length} prompts`, note: 'Ready to move into image generation.' },
    { label: 'Narration', value: `${narrationWords} words`, note: 'Voiceover draft with pacing built in.' }
  ];

  summaryStrip.innerHTML = '';
  stats.forEach((stat) => {
    const card = document.createElement('article');
    card.className = 'summary-card';
    card.innerHTML = `<p>${stat.label}</p><strong>${stat.value}</strong><span>${stat.note}</span>`;
    summaryStrip.appendChild(card);
  });
}

function renderOverview(content) {
  const container = document.getElementById('overviewContent');
  container.innerHTML = '';

  [
    { title: 'Story hook', body: content.storyHook },
    { title: 'World anchor', body: content.lore }
  ].forEach((item) => {
    const block = document.createElement('article');
    block.className = 'content-block';
    block.innerHTML = `<h3>${item.title}</h3><p>${item.body}</p>`;
    container.appendChild(block);
  });
}

function renderCharacter(fields) {
  const container = document.getElementById('characterContent');
  container.innerHTML = '';

  fields.forEach((field) => {
    const card = document.createElement('article');
    card.className = 'detail-card';
    card.innerHTML = `<p>${field.label}</p><h3>${field.value}</h3>`;
    container.appendChild(card);
  });
}

function renderScenes(scenes) {
  const container = document.getElementById('scenesContent');
  container.innerHTML = '';

  scenes.forEach((scene, index) => {
    const card = document.createElement('article');
    card.className = 'story-card';
    card.innerHTML = `
      <div class="story-card__head">
        <p>Scene ${index + 1}</p>
        <button class="btn btn--ghost btn--small" type="button">Copy beat</button>
      </div>
      <p>${scene}</p>
    `;

    card.querySelector('button').addEventListener('click', () => copyText(scene, `Scene ${index + 1} copied.`));
    container.appendChild(card);
  });
}

function renderPrompts(prompts) {
  const container = document.getElementById('promptsContent');
  container.innerHTML = '';

  prompts.forEach((prompt) => {
    const card = document.createElement('article');
    card.className = 'story-card story-card--prompt';
    card.innerHTML = `
      <div class="story-card__head">
        <p>${prompt.title}</p>
        <button class="btn btn--ghost btn--small" type="button">Copy prompt</button>
      </div>
      <p>${prompt.body}</p>
    `;

    card.querySelector('button').addEventListener('click', () => copyText(prompt.body, `${prompt.title} copied.`));
    container.appendChild(card);
  });
}

function renderNarration(text) {
  document.getElementById('narrationContent').textContent = text;
}

function wireCopyButtons(content, brief) {
  document.getElementById('copyBriefBtn').addEventListener('click', () => copyText(brief, 'Full brief copied.'));
  document.getElementById('downloadBriefBtn').addEventListener('click', () => downloadText('trailer-dossier.txt', brief));

  const lookup = {
    overviewContent: ['OVERVIEW', content.storyHook, '', content.lore].join('\n'),
    characterContent: ['CHARACTER', content.character].join('\n\n'),
    scenesContent: ['KEY SCENES', content.scenes].join('\n\n'),
    promptsContent: ['IMAGE PROMPTS', content.prompts].join('\n\n'),
    narrationContent: ['NARRATION', content.narration].join('\n\n')
  };

  document.querySelectorAll('.copy-section').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.copyTarget;
      copyText(lookup[targetId], 'Section copied.');
    });
  });
}

async function initialize() {
  const content = await loadContent();
  const characterFields = parseCharacter(content.character);
  const scenes = parseScenes(content.scenes);
  const prompts = parsePrompts(content.prompts);
  const brief = buildBrief(content);

  renderSummary(content, scenes, prompts);
  renderOverview(content);
  renderCharacter(characterFields);
  renderScenes(scenes);
  renderPrompts(prompts);
  renderNarration(content.narration);
  wireCopyButtons(content, brief);
}

document.addEventListener('DOMContentLoaded', initialize);
