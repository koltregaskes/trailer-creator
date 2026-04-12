const STORAGE_KEYS = {
  legacyDraft: 'trailer-creator:draft-v2',
  projects: 'trailer-creator:projects-v1',
  currentProjectId: 'trailer-creator:current-project-id'
};
const DEFAULT_PROJECT_TITLE = 'Untitled trailer concept';
const TRAILER_PACKAGE_TYPE = 'trailer-package-v1';

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
    .replace(/Ã¢â‚¬â€/g, '-')
    .replace(/Ã¢â‚¬Â¦/g, '...')
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .replace(/Ã¢â‚¬Å“/g, '"')
    .replace(/Ã¢â‚¬ï¿½/g, '"')
    .trim();
}

function sanitizeContent(content) {
  const sanitized = {};

  Object.keys(CONTENT_FILES).forEach((key) => {
    sanitized[key] = typeof content?.[key] === 'string' ? normalizeText(content[key]) : FALLBACK_CONTENT[key];
  });

  const title = typeof content?.title === 'string' ? content.title.trim() : '';
  sanitized.title = title || DEFAULT_PROJECT_TITLE;

  return sanitized;
}

function cloneContent(content) {
  return JSON.parse(JSON.stringify(sanitizeContent(content)));
}

function createProjectId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildUniqueProjectTitle(baseTitle, projects) {
  const normalizedBaseTitle = (baseTitle || DEFAULT_PROJECT_TITLE).trim() || DEFAULT_PROJECT_TITLE;
  const existingTitles = new Set(projects.map((project) => (project.title || '').trim().toLowerCase()));

  if (!existingTitles.has(normalizedBaseTitle.toLowerCase())) {
    return normalizedBaseTitle;
  }

  let index = 2;
  while (existingTitles.has(`${normalizedBaseTitle} ${index}`.toLowerCase())) {
    index += 1;
  }

  return `${normalizedBaseTitle} ${index}`;
}

function createProjectRecord(content, overrides = {}, existingProjects = []) {
  const normalizedContent = sanitizeContent(content);
  const title = buildUniqueProjectTitle(overrides.title || normalizedContent.title, existingProjects);

  return {
    id: overrides.id || createProjectId(),
    title,
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    content: {
      ...normalizedContent,
      title
    }
  };
}

function slugifyTitle(title, fallback = 'trailer-project') {
  return (title || fallback).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

function loadLegacyDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.legacyDraft);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveLegacyDraft(content) {
  localStorage.setItem(STORAGE_KEYS.legacyDraft, JSON.stringify(content));
}

function loadProjectLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.projects);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((project) => {
        const content = sanitizeContent(project?.content || project);
        const title = (project?.title || content.title || DEFAULT_PROJECT_TITLE).trim() || DEFAULT_PROJECT_TITLE;

        return {
          id: typeof project?.id === 'string' && project.id.trim() ? project.id : createProjectId(),
          title,
          updatedAt: typeof project?.updatedAt === 'string' && project.updatedAt.trim()
            ? project.updatedAt
            : new Date().toISOString(),
          content: {
            ...content,
            title
          }
        };
      });
  } catch (_) {
    return [];
  }
}

function saveProjectLibrary(projects) {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

function loadCurrentProjectId() {
  return localStorage.getItem(STORAGE_KEYS.currentProjectId) || '';
}

function saveCurrentProjectId(projectId) {
  localStorage.setItem(STORAGE_KEYS.currentProjectId, projectId);
}

function getCurrentProject(state) {
  return state.projects.find((project) => project.id === state.currentProjectId) || state.projects[0] || null;
}

function persistProjectState(state) {
  saveProjectLibrary(state.projects);

  const currentProject = getCurrentProject(state);
  if (currentProject) {
    state.currentProjectId = currentProject.id;
    saveCurrentProjectId(currentProject.id);
    saveLegacyDraft(currentProject.content);
  }
}

function initializeProjectState(sourceContent) {
  const existingProjects = loadProjectLibrary();

  if (existingProjects.length) {
    const preferredProjectId = loadCurrentProjectId();
    const currentProjectId = existingProjects.some((project) => project.id === preferredProjectId)
      ? preferredProjectId
      : existingProjects[0].id;

    const state = {
      projects: existingProjects,
      currentProjectId
    };
    persistProjectState(state);
    return state;
  }

  const legacyDraft = loadLegacyDraft();
  const seedContent = sanitizeContent({
    ...sourceContent,
    ...(legacyDraft || {})
  });

  const seedProject = createProjectRecord(seedContent, {}, []);
  const state = {
    projects: [seedProject],
    currentProjectId: seedProject.id
  };
  persistProjectState(state);
  return state;
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

  return { title: DEFAULT_PROJECT_TITLE, ...Object.fromEntries(entries) };
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
    (content.title || DEFAULT_PROJECT_TITLE).toUpperCase(),
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

function buildPackageSourceFiles(sourceContent) {
  return Object.fromEntries(
    Object.entries(CONTENT_FILES).map(([key, file]) => [
      key,
      {
        file,
        content: typeof sourceContent?.[key] === 'string' ? normalizeText(sourceContent[key]) : FALLBACK_CONTENT[key]
      }
    ])
  );
}

function buildTrailerPackage(state, sourceContent) {
  const currentProject = getCurrentProject(state);
  if (!currentProject) {
    return null;
  }

  const projectContent = cloneContent(currentProject.content);

  return {
    packageType: TRAILER_PACKAGE_TYPE,
    packageVersion: 1,
    exportedAt: new Date().toISOString(),
    project: {
      id: currentProject.id,
      title: currentProject.title,
      updatedAt: currentProject.updatedAt,
      content: projectContent
    },
    brief: buildBrief(projectContent),
    summary: {
      title: projectContent.title,
      keyScenes: parseScenes(projectContent.scenes).length,
      promptBlocks: parsePrompts(projectContent.prompts).length,
      narrationWords: projectContent.narration.split(/\s+/).filter(Boolean).length
    },
    sourceDraft: {
      title: sourceContent.title,
      content: cloneContent(sourceContent),
      files: buildPackageSourceFiles(sourceContent)
    }
  };
}

function unwrapImportedContent(payload) {
  if (payload && payload.packageType === TRAILER_PACKAGE_TYPE && payload.project?.content) {
    return sanitizeContent(payload.project.content);
  }

  if (payload && typeof payload.content === 'object') {
    return sanitizeContent(payload.content);
  }

  return sanitizeContent(payload);
}

function unwrapImportedTitle(payload, content) {
  if (payload && payload.packageType === TRAILER_PACKAGE_TYPE && typeof payload.project?.title === 'string' && payload.project.title.trim()) {
    return payload.project.title.trim();
  }

  if (typeof payload?.title === 'string' && payload.title.trim()) {
    return payload.title.trim();
  }

  return content.title || DEFAULT_PROJECT_TITLE;
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

function formatProjectTimestamp(value) {
  if (!value) {
    return 'No saved time yet';
  }

  return new Date(value).toLocaleString();
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

function downloadJson(filename, payload, successMessage = 'Project JSON exported.') {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(successMessage);
}

function renderSummary(content, scenes, prompts) {
  const summaryStrip = document.getElementById('summaryStrip');
  const narrationWords = content.narration.split(/\s+/).filter(Boolean).length;
  const stats = [
    { label: 'Project', value: content.title, note: 'Current local draft title.' },
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

function bindInputs(content) {
  document.getElementById('projectTitleInput').value = content.title;
  document.getElementById('storyHookInput').value = content.storyHook;
  document.getElementById('characterInput').value = content.character;
  document.getElementById('loreInput').value = content.lore;
  document.getElementById('scenesInput').value = content.scenes;
  document.getElementById('promptsInput').value = content.prompts;
  document.getElementById('narrationInput').value = content.narration;
}

function renderAll(content) {
  const characterFields = parseCharacter(content.character);
  const scenes = parseScenes(content.scenes);
  const prompts = parsePrompts(content.prompts);

  renderSummary(content, scenes, prompts);
  renderOverview(content);
  renderCharacter(characterFields);
  renderScenes(scenes);
  renderPrompts(prompts);
  renderNarration(content.narration);
}

function updateProjectLabel(content) {
  document.title = `${content.title} | Trailer Creator`;
}

function renderProjectLibrary(state) {
  const currentProject = getCurrentProject(state);
  const library = document.getElementById('projectLibrary');
  const meta = document.getElementById('projectLibraryMeta');

  meta.textContent = currentProject
    ? `${state.projects.length} local project${state.projects.length === 1 ? '' : 's'} · Active updated ${formatProjectTimestamp(currentProject.updatedAt)}`
    : 'No local projects saved';

  library.innerHTML = '';

  state.projects.forEach((project) => {
    const card = document.createElement('article');
    const isActive = project.id === state.currentProjectId;

    card.className = `project-card${isActive ? ' is-active' : ''}`;
    card.innerHTML = `
      <div class="project-card__head">
        <div>
          <p class="eyebrow">${isActive ? 'Active project' : 'Saved project'}</p>
          <h3>${project.title}</h3>
        </div>
        <button class="btn btn--ghost btn--small" type="button">${isActive ? 'Current' : 'Open'}</button>
      </div>
      <p class="project-card__meta">Updated ${formatProjectTimestamp(project.updatedAt)}</p>
      <p class="project-card__preview">${project.content.storyHook.slice(0, 160)}${project.content.storyHook.length > 160 ? '...' : ''}</p>
    `;

    const actionButton = card.querySelector('button');
    actionButton.disabled = isActive;
    actionButton.addEventListener('click', () => {
      state.currentProjectId = project.id;
      persistProjectState(state);
      bindInputs(project.content);
      updateProjectLabel(project.content);
      renderAll(project.content);
      renderProjectLibrary(state);
      showToast(`${project.title} opened.`);
    });

    library.appendChild(card);
  });
}

function wireCopyButtons(getContent) {
  document.getElementById('copyBriefBtn').addEventListener('click', () => {
    copyText(buildBrief(getContent()), 'Full brief copied.');
  });

  document.getElementById('downloadBriefBtn').addEventListener('click', () => {
    const content = getContent();
    const slug = content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trailer-dossier';
    downloadText(`${slug}.txt`, buildBrief(content));
  });

  const lookup = {
    overviewContent: (content) => ['OVERVIEW', content.storyHook, '', content.lore].join('\n'),
    characterContent: (content) => ['CHARACTER', content.character].join('\n\n'),
    scenesContent: (content) => ['KEY SCENES', content.scenes].join('\n\n'),
    promptsContent: (content) => ['IMAGE PROMPTS', content.prompts].join('\n\n'),
    narrationContent: (content) => ['NARRATION', content.narration].join('\n\n')
  };

  document.querySelectorAll('.copy-section').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.copyTarget;
      copyText(lookup[targetId](getContent()), 'Section copied.');
    });
  });
}

function wireDraftControls(state, sourceContent) {
  const importInput = document.getElementById('importJsonInput');

  const syncCurrentProject = (nextContent) => {
    const currentProject = getCurrentProject(state);
    if (!currentProject) {
      return;
    }

    const sanitizedContent = sanitizeContent(nextContent);
    currentProject.title = sanitizedContent.title;
    currentProject.updatedAt = new Date().toISOString();
    currentProject.content = {
      ...sanitizedContent,
      title: currentProject.title
    };
    persistProjectState(state);
    updateProjectLabel(currentProject.content);
    renderAll(currentProject.content);
    renderProjectLibrary(state);
  };

  const applyChange = (key, value) => {
    const currentProject = getCurrentProject(state);
    if (!currentProject) {
      return;
    }

    syncCurrentProject({
      ...currentProject.content,
      [key]: value
    });
  };

  document.getElementById('newProjectBtn').addEventListener('click', () => {
    const nextTitle = buildUniqueProjectTitle(DEFAULT_PROJECT_TITLE, state.projects);
    const nextProject = createProjectRecord({
      ...cloneContent(sourceContent),
      title: nextTitle
    }, { title: nextTitle }, state.projects);
    state.projects.unshift(nextProject);
    state.currentProjectId = nextProject.id;
    persistProjectState(state);
    bindInputs(nextProject.content);
    updateProjectLabel(nextProject.content);
    renderAll(nextProject.content);
    renderProjectLibrary(state);
    showToast('New project created.');
  });

  document.getElementById('duplicateProjectBtn').addEventListener('click', () => {
    const currentProject = getCurrentProject(state);
    if (!currentProject) {
      return;
    }

    const duplicateTitle = buildUniqueProjectTitle(`${currentProject.title} copy`, state.projects);
    const duplicateProject = createProjectRecord({
      ...cloneContent(currentProject.content),
      title: duplicateTitle
    }, { title: duplicateTitle }, state.projects);
    state.projects.unshift(duplicateProject);
    state.currentProjectId = duplicateProject.id;
    persistProjectState(state);
    bindInputs(duplicateProject.content);
    updateProjectLabel(duplicateProject.content);
    renderAll(duplicateProject.content);
    renderProjectLibrary(state);
    showToast('Project duplicated.');
  });

  document.getElementById('deleteProjectBtn').addEventListener('click', () => {
    const currentProject = getCurrentProject(state);
    if (!currentProject) {
      return;
    }

    if (state.projects.length === 1) {
      if (!window.confirm('Only one project is saved right now. Reset it back to the source files?')) {
        return;
      }

      const resetProject = createProjectRecord(sourceContent, { id: currentProject.id, title: DEFAULT_PROJECT_TITLE }, []);
      state.projects = [resetProject];
      state.currentProjectId = resetProject.id;
      persistProjectState(state);
      bindInputs(resetProject.content);
      updateProjectLabel(resetProject.content);
      renderAll(resetProject.content);
      renderProjectLibrary(state);
      showToast('Current project reset.');
      return;
    }

    if (!window.confirm(`Delete "${currentProject.title}" from this browser workspace?`)) {
      return;
    }

    state.projects = state.projects.filter((project) => project.id !== currentProject.id);
    state.currentProjectId = state.projects[0].id;
    persistProjectState(state);
    const nextProject = getCurrentProject(state);
    bindInputs(nextProject.content);
    updateProjectLabel(nextProject.content);
    renderAll(nextProject.content);
    renderProjectLibrary(state);
    showToast('Project deleted.');
  });

  [
    ['projectTitleInput', 'title'],
    ['storyHookInput', 'storyHook'],
    ['characterInput', 'character'],
    ['loreInput', 'lore'],
    ['scenesInput', 'scenes'],
    ['promptsInput', 'prompts'],
    ['narrationInput', 'narration']
  ].forEach(([elementId, key]) => {
    document.getElementById(elementId).addEventListener('input', (event) => {
      applyChange(key, event.target.value);
    });
  });

  document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const content = getCurrentProject(state).content;
    downloadJson(`${slugifyTitle(content.title)}.json`, content);
  });

  document.getElementById('exportPackageBtn').addEventListener('click', () => {
    const packagePayload = buildTrailerPackage(state, sourceContent);
    if (!packagePayload) {
      return;
    }

    downloadJson(
      `${slugifyTitle(packagePayload.project.title, 'trailer-package')}.trailer-package.json`,
      packagePayload,
      'Trailer package exported.'
    );
  });

  document.getElementById('copyJsonBtn').addEventListener('click', () => {
    copyText(JSON.stringify(getCurrentProject(state).content, null, 2), 'Project JSON copied.');
  });

  document.getElementById('importJsonBtn').addEventListener('click', () => importInput.click());

  importInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedContent = unwrapImportedContent(parsed);
      const importedTitle = buildUniqueProjectTitle(
        unwrapImportedTitle(parsed, importedContent) || DEFAULT_PROJECT_TITLE,
        state.projects
      );
      const importedProject = createProjectRecord({
        ...importedContent,
        title: importedTitle
      }, { title: importedTitle }, state.projects);
      state.projects.unshift(importedProject);
      state.currentProjectId = importedProject.id;
      persistProjectState(state);
      bindInputs(importedProject.content);
      updateProjectLabel(importedProject.content);
      renderAll(importedProject.content);
      renderProjectLibrary(state);
      showToast('Project imported as a new local project.');
    } catch (error) {
      showToast(`Import failed: ${error.message}`);
    } finally {
      importInput.value = '';
    }
  });

  document.getElementById('resetDraftBtn').addEventListener('click', () => {
    if (!window.confirm('Reset the current project and restore the source text files?')) {
      return;
    }

    const currentProject = getCurrentProject(state);
    const resetProject = createProjectRecord(sourceContent, {
      id: currentProject.id,
      title: buildUniqueProjectTitle(DEFAULT_PROJECT_TITLE, state.projects.filter((project) => project.id !== currentProject.id))
    }, state.projects.filter((project) => project.id !== currentProject.id));
    state.projects = state.projects.map((project) => (project.id === currentProject.id ? resetProject : project));
    state.currentProjectId = resetProject.id;
    persistProjectState(state);
    bindInputs(resetProject.content);
    updateProjectLabel(resetProject.content);
    renderAll(resetProject.content);
    renderProjectLibrary(state);
    showToast('Current project reset to source files.');
  });
}

async function initialize() {
  const sourceContent = sanitizeContent(await loadContent());
  const state = initializeProjectState(sourceContent);
  const currentProject = getCurrentProject(state);

  bindInputs(currentProject.content);
  updateProjectLabel(currentProject.content);
  renderAll(currentProject.content);
  renderProjectLibrary(state);
  wireCopyButtons(() => getCurrentProject(state).content);
  wireDraftControls(state, sourceContent);
  persistProjectState(state);
}

document.addEventListener('DOMContentLoaded', initialize);
