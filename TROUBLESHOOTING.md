# Troubleshooting

- **The page still shows the old text**: Refresh the browser after editing the `.txt` files.
- **The page still shows your old draft instead of the updated source files**: Use `Reset draft` to clear the local browser copy and reload the source content.
- **The browser blocks file reads**: Opening `index.html` directly can prevent `fetch` from reading nearby files. The page still initialises, and it falls back to bundled content so editing, the delivery checklist, and export keep working.
- **Copy buttons do nothing**: Some browsers restrict clipboard access. Try the button again after interacting with the page, or use the downloaded brief.
- **Import fails**: Make sure the JSON file came from `Trailer Creator` and still contains the main text fields.
