import { useState } from 'react'
import data from '../data.json'
import { Chips, Head } from './common.jsx'

const FILTERS = [
  ['tous', 'Tout'],
  ['mag', 'MAG acier'],
  ['alu', 'Alu'],
  ['mma', 'Électrode'],
]
const TAG = { tous: 'Tous', mag: 'MAG', alu: 'Alu', mma: 'Électrode' }

export default function Diagnostic() {
  const [filter, setFilter] = useState('tous')
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const rows = data.diagnostic.filter(
    (d) => (filter === 'tous' || d.p === filter || d.p === 'tous') && (!needle || `${d.s} ${d.c} ${d.r}`.toLowerCase().includes(needle))
  )
  return (
    <section>
      <Head
        title="Ce que dit ton cordon"
        lede="Un symptôme, une cause probable, une seule correction. Change un réglage à la fois, puis refais un cordon d'essai sur une chute."
      />
      <Chips items={FILTERS} value={filter} onPick={setFilter} />
      <input id="diagSearch" type="search" placeholder="Chercher : porosité, perçage, fil…" aria-label="Chercher un symptôme" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="diag">
        {rows.length ? (
          rows.map((d) => (
            <article key={d.s}>
              <div className="s">
                <span className="tag">{TAG[d.p]}</span>
                {d.s}
              </div>
              <div className="c">{d.c}</div>
              <div className="r">{d.r}</div>
            </article>
          ))
        ) : (
          <article>
            <div className="c">Aucun symptôme ne correspond. Essaie l'onglet Photo IA.</div>
          </article>
        )}
      </div>
    </section>
  )
}
