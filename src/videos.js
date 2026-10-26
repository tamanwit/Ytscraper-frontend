// Add a new lecture: drop its JSON into src/data/ and add a row here (id = file name without .json).
const files = import.meta.glob('./data/*.json', { eager: true, import: 'default' })

const META = [
  ['EUWJbOGJa9s', 'CodeVita registration and the 56-day course', 'CodeVita'],
  ['2M9jw9kKFvg', 'CodeVita PYQs: reading story-based problems', 'CodeVita'],
  ['w0YB1wiLEYs', 'CodeVita PYQs: String Pair and Count Pair', 'CodeVita'],
  ['S8tpzqrwnHk', 'DSA basics done: the 28-pattern sheet', 'DSA and DP'],
  ['lAdOVqukPCI', 'DP: Unique Paths', 'DSA and DP'],
  ['YkM-xfnZ4DY', 'DP: Longest Common Subsequence', 'DSA and DP'],
  ['6XSrjOmTJio', 'DP on stocks: buy and sell, four questions', 'DSA and DP'],
  ['wKao8Ttesqk', 'DP: a hard question on cutting cost', 'DSA and DP'],
  ['dyG4JBKh6tA', 'DP revision and what comes next', 'DSA and DP'],
]

export const VIDEOS = META.map(([id, title, group]) => {
  const d = files[`./data/${id}.json`]
  // one file spells the key "segements", so accept both
  const raw = d.segments || d.segements
  const segs = raw
    .filter(s => s.text.trim())
    .sort((a, b) => a.start - b.start)
    .map(s => [s.start, s.text.trim()])
  return { id, title, group, dur: Math.round(Math.max(...raw.map(s => s.end))), segs }
})
