# Trailer Creator

A local dossier-style tool for shaping a trailer concept brief and exporting the creative materials around it.

It pulls together the story hook, character, lore, key scenes, image prompts, and narration into one polished workspace with copy and export actions.

## What It Is Good For

- Building a trailer concept from rough source notes
- Keeping narration, prompts, lore, and scene beats in one place
- Exporting structured material for the next production step
- Working locally without needing a backend

## Current Status

- Launchable local tool
- Core dossier workflow is in place
- Source text files can be loaded into the browser experience
- Copy, download, JSON import/export, and local draft save are already wired
- Installable as a lightweight PWA for quick access on desktop or Android
- Editable project title, hook, lore, scenes, prompts, and narration with live preview

## Key Files

- `index.html` - tool shell
- `script.js` - loading, export, and interaction logic
- `style.css` - visual presentation
- `narration_script.txt` - narration source
- `image_prompts.txt` - prompt source
- `key_scenes.txt` - key scenes source

## Next Likely Improvements

- Multiple named trailer projects instead of one browser draft at a time
- Better export formats
- Media attachment support
- A path into the wider tools or hub system if this becomes part of a larger content workflow

## Local-Only Files

- `.autolab/` is used for internal AutoResearch and should remain untracked
- `.env*` files are local-only
- `.local/` and `*.local.md` are for planning notes and are ignored
