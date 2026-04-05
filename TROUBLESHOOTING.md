# Troubleshooting

- **The page still shows the old text**: Refresh the browser after editing the `.txt` files.
- **The page still shows your old draft instead of the updated source files**: Use `Reset draft` to clear the local browser copy and reload the source content.
- **The browser blocks file reads**: Opening `index.html` directly can prevent `fetch` from reading nearby files. The page has a built-in fallback so it still works, or you can serve the folder locally.
- **Copy buttons do nothing**: Some browsers restrict clipboard access. Try the button again after interacting with the page, or use the downloaded brief.
- **Import fails**: Make sure the JSON file came from `Trailer Creator` and still contains the main text fields.
