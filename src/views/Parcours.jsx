import data from '../data.json'
import { fmtDate, today } from '../store.js'
import { Head } from './common.jsx'

export default function Parcours({ state, update }) {
  const done = state.progress
  const all = data.niveaux.flatMap((n) => n.ex)
  const count = all.filter((x) => done[x.id]).length
  const base = data.niveaux.slice(0, 2).flatMap((n) => n.ex).every((x) => done[x.id])
  const toggle = (id, on) =>
    update((s) => {
      const p = { ...s.progress }
      if (on) p[id] = today()
      else delete p[id]
      return { ...s, progress: p }
    })

  return (
    <section>
      <Head
        title="Du premier cordon à l'alu"
        lede="21 exercices sur chutes. Valide un exercice quand son critère est atteint deux fois de suite. Si tu bloques trois séances sur le même, reviens à celui d'avant."
      >
        <p className="status">
          {count} exercice{count > 1 ? 's' : ''} validé{count > 1 ? 's' : ''} sur {all.length}.
        </p>
      </Head>
      <div style={{ display: 'grid', gap: 16 }}>
        {data.niveaux.map((n, i) => {
          const d = n.ex.filter((x) => done[x.id]).length
          return (
            <div className="level" key={n.id}>
              <header>
                <div className="lvlno">
                  Niveau {i + 1} · {d}/{n.ex.length}
                </div>
                <h3>{n.nom}</h3>
                <p className="lede">{n.but}</p>
                <p style={{ fontSize: 14 }}>
                  <span className="lbl">Matériel · </span>
                  {n.materiel}
                </p>
                <div className="bar">
                  <i style={{ width: Math.round((100 * d) / n.ex.length) + '%' }} />
                </div>
                {i === 3 && !base && (
                  <div className="warn">Les niveaux 1 et 2 ne sont pas encore validés. Sur l'alu, tu cumulerais les difficultés du geste et celles du matériau.</div>
                )}
              </header>
              {n.ex.map((x) => {
                const on = !!done[x.id]
                return (
                  <div className={'ex' + (on ? ' done' : '')} key={x.id}>
                    <input type="checkbox" id={'ex' + x.id} checked={on} onChange={(e) => toggle(x.id, e.target.checked)} />
                    <label htmlFor={'ex' + x.id} className="t">
                      {x.id}. {x.t}
                    </label>
                    <div className="d">
                      <span>
                        <b>But : </b>
                        {x.o}
                      </span>
                      <span>
                        <b>Consigne : </b>
                        {x.c}
                      </span>
                      <span>
                        <b>Validé si : </b>
                        {x.ok}
                      </span>
                      {on && <span className="done-date">Validé le {fmtDate(done[x.id])}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}
