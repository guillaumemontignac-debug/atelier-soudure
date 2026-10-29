import { useEffect, useState } from 'react'
import { download, entriesCsv, fmtDate, today } from '../store.js'
import { Chips, Head, PROCS } from './common.jsx'

const blank = () => ({ date: today(), proc: PROCS[0], mat: '', joint: '', a: '', arc: '', fil: '', gaz: '', res: 'ok', note: '' })

export default function Carnet({ state, update, draft }) {
  const [f, setF] = useState(blank)
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState('all')
  const [armed, setArmed] = useState(null)

  useEffect(() => {
    if (draft) {
      const { _t, ...d } = draft
      setF((cur) => ({ ...blank(), ...d, date: cur.date }))
      setMsg('Réglage repris : complète et enregistre.')
    }
  }, [draft])

  const field = (k) => ({ id: 'f' + k, value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) })

  const submit = (e) => {
    e.preventDefault()
    if (!f.mat.trim() && !f.a.trim()) {
      setMsg('Indique au moins la matière ou l’intensité.')
      return
    }
    const entry = { ...f, id: String(Date.now()), t: Date.now() }
    update((s) => ({ ...s, entries: [...s.entries, entry] }))
    setF({ ...blank(), date: f.date, proc: f.proc, gaz: f.gaz })
    setMsg('Essai enregistré.')
  }

  const del = (id) => {
    if (armed !== id) {
      setArmed(id)
      setTimeout(() => setArmed((a) => (a === id ? null : a)), 4000)
      return
    }
    update((s) => ({ ...s, entries: s.entries.filter((x) => x.id !== id) }))
    setArmed(null)
  }

  const list = [...state.entries]
    .filter((e) => filter === 'all' || e.res === filter)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.t || 0) - (a.t || 0))

  return (
    <section>
      <Head
        title="Mon carnet de réglages"
        lede="Au bout de quelques séances, ce carnet vaut plus que tous les tableaux : ce sont tes réglages, validés sur ton poste."
      >
        <p className="status">Enregistré sur ce téléphone. Sauvegarde régulière : onglet Paramètres.</p>
      </Head>
      <form className="card" onSubmit={submit}>
        <div className="grid2">
          <div className="field">
            <label htmlFor="fdate">Date</label>
            <input type="date" {...field('date')} />
          </div>
          <div className="field">
            <label htmlFor="fproc">Procédé</label>
            <select {...field('proc')}>
              {PROCS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="fmat">Matière et épaisseur</label>
            <input placeholder="Alu 5754, 3 mm" {...field('mat')} />
          </div>
          <div className="field">
            <label htmlFor="fjoint">Joint et position</label>
            <input placeholder="Angle PB" {...field('joint')} />
          </div>
          <div className="field">
            <label htmlFor="fa">Intensité (A)</label>
            <input inputMode="decimal" placeholder="95" {...field('a')} />
          </div>
          <div className="field">
            <label htmlFor="farc">Arc / tension</label>
            <input placeholder="−1,5" {...field('arc')} />
          </div>
          <div className="field">
            <label htmlFor="ffil">Fil (m/min)</label>
            <input inputMode="decimal" placeholder="7,1" {...field('fil')} />
          </div>
          <div className="field">
            <label htmlFor="fgaz">Gaz et débit</label>
            <input placeholder="Argon 12 L/min" {...field('gaz')} />
          </div>
          <div className="field">
            <label htmlFor="fres">Résultat</label>
            <select {...field('res')}>
              <option value="ok">Validé</option>
              <option value="ko">À revoir</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="fnote">Note</label>
          <textarea placeholder="Ce qui a marché, ce qui a cloché" {...field('note')} />
        </div>
        <div className="row">
          <button className="btn" type="submit">
            Enregistrer
          </button>
          <span className="status">{msg}</span>
        </div>
      </form>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Chips
          items={[
            ['all', 'Tout'],
            ['ok', 'Réglages validés'],
            ['ko', 'À revoir'],
          ]}
          value={filter}
          onPick={setFilter}
        />
        {state.entries.length > 0 && (
          <button className="btn ghost" type="button" onClick={() => download(`carnet-soudure-${today()}.csv`, entriesCsv(state.entries), 'text/csv;charset=utf-8')}>
            Exporter en CSV
          </button>
        )}
      </div>

      <div className="entries">
        {!list.length ? (
          <div className="empty">
            {state.entries.length
              ? 'Aucun essai dans ce filtre.'
              : 'Aucun essai noté pour l’instant. Après chaque cordon d’essai, note le réglage et le résultat : c’est ta mémoire de réglages.'}
          </div>
        ) : (
          list.map((e) => {
            const vals = [e.a && e.a + ' A', e.arc && 'arc ' + e.arc, e.fil && e.fil + ' m/min', e.gaz].filter(Boolean).join(' · ')
            return (
              <article className="entry" key={e.id}>
                <div className="top">
                  <b>
                    {e.proc} — {e.mat}
                  </b>
                  <span className={'pill ' + (e.res === 'ok' ? 'ok' : 'ko')}>{e.res === 'ok' ? 'Validé' : 'À revoir'}</span>
                </div>
                <div className="status">
                  {fmtDate(e.date)}
                  {e.joint ? ' · ' + e.joint : ''}
                </div>
                {vals && <div className="vals">{vals}</div>}
                {e.note && <p style={{ fontSize: 14 }}>{e.note}</p>}
                <div>
                  <button className="linkbtn" type="button" onClick={() => del(e.id)}>
                    {armed === e.id ? 'Confirmer la suppression' : 'Supprimer'}
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
