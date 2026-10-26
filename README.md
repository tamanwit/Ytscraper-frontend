# Lecture Desk

Static React (Vite) site that answers questions by searching lecture transcripts in the browser.
No backend, no API keys.

    npm install
    npm run dev        # local dev server
    npm run build      # outputs dist/ — upload to Netlify, Vercel, GitHub Pages, any static host

Files
- src/data/*.json   the transcripts (file name = YouTube video ID)
- src/videos.js     titles/groups; add a row when you add a transcript
- src/search.js     chunking + BM25 ranking + short-answer extraction
- src/App.jsx       UI
- src/styles.css    theme (light/dark tokens at the top)
