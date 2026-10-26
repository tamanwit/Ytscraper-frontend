import { useMemo, useState } from 'react'
import { VIDEOS } from './videos.js'
import { search, bestSentences } from './search.js'

const IDEAS = [
  'What is the CodeVita exam format now?',
  'Which programming languages are allowed in CodeVita?',
  'What is the difference between memoization and tabulation?',
  'How does DP on stocks work?',
  'How many patterns are in the pattern sheet?',
  'How are unique paths like climbing stairs?',
  'How do I read story-based problems?',
]
const GROUPS = [...new Set(VIDEOS.map(v => v.group))]
const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
const link = (v, t) => `https://youtu.be/${v.id}?t=${Math.max(0, Math.floor(t) - 2)}`

function Hl({ text, qt }) {
  if (!qt.length) return text
  const re = new RegExp(`\\b(${qt.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\w*`, 'gi')
  const out = []
  let last = 0, m
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(<mark key={m.index}>{m[0]}</mark>)
    last = m.index + m[0].length
  }
  out.push(text.slice(last))
  return out
}

export default function App() {
  const [q, setQ] = useState('')
  const [asked, setAsked] = useState('')
  const [sel, setSel] = useState(() => new Set(VIDEOS.map(v => v.id)))
  const [dark, setDark] = useState(null)
  const res = useMemo(() => (asked ? search(asked, sel) : null), [asked, sel])
  const top = res && res.hits[0]

  const go = t => { const x = (t ?? q).trim(); setQ(x); setAsked(x) }
  const toggle = id => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n) }
  const toggleTheme = () => {
    const d = dark === null ? !matchMedia('(prefers-color-scheme: dark)').matches : !dark
    setDark(d)
    document.documentElement.dataset.theme = d ? 'dark' : 'light'
  }

  return (
    <div className="wrap">
      <div className="top">
        <div className="brand"><span>Lecture</span> Desk</div>
        <button className="ghost" onClick={toggleTheme} aria-label="Switch light and dark theme">Theme</button>
      </div>
      <h1>Ask the lectures.</h1>
      <p className="lede">Type a question about CodeVita or DSA. You get the exact passages from the {VIDEOS.length} lecture transcripts, with a link that opens the video at that moment.</p>

      <form className="ask" role="search" onSubmit={e => { e.preventDefault(); go() }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. Which languages are allowed in CodeVita?" aria-label="Your question" />
        <button type="submit">Search</button>
      </form>
      <div className="chips">
        {IDEAS.map(t => <button key={t} className="chip" onClick={() => go(t)}>{t}</button>)}
      </div>

      <div className="cols">
        <main>
          {!res && <div className="empty">Pick a suggested question above, or write your own. Results come from the transcripts only, so use the words a lecture would use.</div>}
          {res && !res.hits.length && (
            <div className="empty">
              {sel.size ? `No passage matches “${asked}”. Try fewer or different keywords, for example the topic name.` : 'No lectures are selected. Tick at least one lecture on the right.'}
            </div>
          )}
          {top && (
            <section className="answer" aria-live="polite">
              <h2>Best answer from {top.c.v.title}</h2>
              <p><Hl text={bestSentences(top.c.text, res.qt)} qt={res.qt} /></p>
              <small>Pulled word for word from the transcript at {mmss(top.c.start)}. Transcripts are machine-translated, so wording can be rough.</small>
            </section>
          )}
          {top && (
            <section className="res">
              <h2>Where this comes up</h2>
              {res.hits.map(({ c }, i) => (
                <article className="hit" key={i}>
                  <header>
                    <h3>{c.v.title}</h3>
                    <a href={link(c.v, c.start)} target="_blank" rel="noopener">Watch at {mmss(c.start)}</a>
                  </header>
                  <p><Hl text={c.text} qt={res.qt} /></p>
                </article>
              ))}
            </section>
          )}
        </main>

        <aside className="side">
          <h2>Lectures searched</h2>
          <p className="sub">{sel.size} of {VIDEOS.length} selected</p>
          {GROUPS.map(g => (
            <div key={g}>
              <div className="grp">{g}</div>
              {VIDEOS.filter(v => v.group === g).map(v => (
                <label className="lec" key={v.id}>
                  <input type="checkbox" checked={sel.has(v.id)} onChange={() => toggle(v.id)} />
                  <span>{v.title}<em>{mmss(v.dur)} long</em></span>
                </label>
              ))}
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
