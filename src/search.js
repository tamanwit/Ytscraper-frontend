import { VIDEOS } from './videos.js'

const STOP = new Set('a an the and or but if of to in on at for with from by is are was were be been am do does did how what why when where which who whom this that these those it its i you he she we they me my your our can could should would will just about into than then so as not no yes there their them have has had get got also any some more most very much many say said tell explain mean means like'.split(' '))
const stem = w => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w)
const toks = s => s.toLowerCase().match(/[a-z0-9+#]+/g) || []
export const terms = s => toks(s).filter(w => !STOP.has(w)).map(stem)

// 1. Split every lecture into overlapping ~40-second passages
const CHUNKS = []
for (const v of VIDEOS) {
  let cur = [], t0 = null
  const flush = () => {
    if (!cur.length) return
    CHUNKS.push({ v, start: cur[0][0], text: cur.map(x => x[1]).join(' '), tf: Object.create(null), n: 0, stems: [] })
  }
  for (const s of v.segs) {
    if (t0 === null) t0 = s[0]
    cur.push(s)
    if (s[0] - t0 >= 40) { flush(); cur = cur.slice(-2); t0 = cur[0][0] }
  }
  if (cur.length > 2) flush()
}

// 2. Term statistics for BM25
const DF = Object.create(null)
let AVG = 0
for (const c of CHUNKS) {
  c.stems = terms(c.text)
  c.n = c.stems.length
  AVG += c.n
  for (const w of c.stems) c.tf[w] = (c.tf[w] || 0) + 1
  for (const w of Object.keys(c.tf)) DF[w] = (DF[w] || 0) + 1
}
AVG /= CHUNKS.length

// 3. Rank passages (BM25 + coverage + adjacent-phrase bonus), at most 5 non-overlapping hits
export function search(q, allowed) {
  const qt = [...new Set(terms(q))]
  if (!qt.length) return { qt, hits: [] }
  const N = CHUNKS.length, k1 = 1.4, b = 0.75
  const flat = toks(q).filter(w => !STOP.has(w)).map(stem)
  const scored = []
  for (const c of CHUNKS) {
    if (!allowed.has(c.v.id)) continue
    let s = 0, matched = 0
    for (const w of qt) {
      const f = c.tf[w]
      if (!f) continue
      matched++
      const idf = Math.log(1 + (N - DF[w] + 0.5) / (DF[w] + 0.5))
      s += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * c.n) / AVG))
    }
    if (!matched) continue
    s *= 0.6 + (0.4 * matched) / qt.length
    for (let i = 0; i < flat.length - 1; i++)
      for (let j = 0; j < c.stems.length - 1; j++)
        if (c.stems[j] === flat[i] && c.stems[j + 1] === flat[i + 1]) { s *= 1.25; break }
    scored.push({ c, s })
  }
  scored.sort((a, b) => b.s - a.s)
  const hits = []
  for (const x of scored) {
    if (hits.some(y => y.c.v === x.c.v && Math.abs(y.c.start - x.c.start) < 60)) continue
    hits.push(x)
    if (hits.length >= 5) break
  }
  return { qt, hits }
}

// 4. The "short answer": the 1-2 sentences of the best passage that match the query most
export function bestSentences(text, qt) {
  const ss = text.split(/(?<=[.?!])\s+/).map((t, i) => ({ t, i, s: terms(t).filter(w => qt.includes(w)).length }))
  const top = ss.filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 2).sort((a, b) => a.i - b.i)
  return (top.length ? top.map(x => x.t) : ss.slice(0, 2).map(x => x.t)).join(' ')
}
