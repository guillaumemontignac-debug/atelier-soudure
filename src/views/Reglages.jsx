import data from '../data.json'
import { Chips, Head } from './common.jsx'

const PROCS = [
  ['mag', 'MAG acier'],
  ['pmig', 'Pulsé acier'],
  ['alu', 'Pulsé alu'],
  ['dpmig', 'Double pulsé alu'],
  ['mma', 'Électrode'],
]
const POS = [
  ['pa', 'À plat · PA / PB', 0],
  ['pc', 'Corniche · PC', 0.075],
  ['pf', 'Montante, plafond · PF / PE', 0.125],
]
const CARNET_PROC = { mag: 'MAG acier', pmig: 'MIG pulsé acier', alu: 'MIG pulsé alu', dpmig: 'Double pulsé alu', mma: 'Électrode' }

const linesFor = (proc) => (proc === 'dpmig' ? data.reglages.alu.lignes : data.reglages[proc].lignes)

export function scaleRange(txt, f) {
  if (!f) return txt
  const m = String(txt).match(/^(\d+)[–-](\d+)$/)
  if (!m) return txt
  return Math.round(m[1] * (1 - f)) + '–' + Math.round(m[2] * (1 - f))
}

function Ro({ cls = '', label, v, unit }) {
  return (
    <div className={'ro ' + cls}>
      <div className="eyebrow">{label}</div>
      <div className="v">
        {v}
        {unit && <small>{unit}</small>}
      </div>
    </div>
  )
}

export default function Reglages({ state, update, toCarnet }) {
  const { proc, pos } = state.reg
  const L = linesFor(proc)
  const ep = Math.min(state.reg.ep, L.length - 1)
  const set = (patch) => update((s) => ({ ...s, reg: { ...s.reg, ...patch } }))
  const R = data.reglages[proc]
  const line = L[ep]
  const f = POS.find((p) => p[0] === pos)[2]
  const amp = scaleRange(line.a, f)
  const isMMA = proc === 'mma'
  const isAlu = proc === 'alu' || proc === 'dpmig'

  return (
    <section>
      <Head
        title="Réglage de départ"
        lede="Choisis le procédé, l'épaisseur et la position. En mode synergique, règle l'intensité : le poste propose la tension et la vitesse de fil, et affiche une épaisseur conseillée. Vérifie qu'elle correspond à ta tôle."
      />
      <div className="field">
        <span className="lbl">Procédé</span>
        <Chips items={PROCS} value={proc} onPick={(id) => set({ proc: id, ep: Math.min(ep, linesFor(id).length - 1) })} />
      </div>
      <div className="field">
        <span className="lbl">Épaisseur</span>
        <Chips items={L.map((l, i) => [i, l.ep])} value={ep} onPick={(i) => set({ ep: i })} />
      </div>
      <div className="field">
        <span className="lbl">Position</span>
        <Chips items={POS.map((p) => [p[0], p[1]])} value={pos} onPick={(id) => set({ pos: id })} />
      </div>

      <div className="plate">
        <div className="plate-head">
          <b>{R.titre}</b>
          <span className="eyebrow">
            {line.ep}
            {f ? ` · −${Math.round(f * 100)} %` : ''}
          </span>
        </div>
        <div className="readouts">
          {proc === 'dpmig' ? (
            <>
              <Ro cls="amp" label="Pic" v={amp} unit="A" />
              <Ro label="Base" v="≈ 70" unit="%" />
              <Ro label="Fréquence" v="1,5–2" unit="Hz" />
            </>
          ) : isMMA ? (
            <>
              <Ro cls="amp" label="Intensité" v={amp} unit="A" />
              <Ro label="Électrode" v={line.v.replace('Ø ', '')} unit="mm" />
              <Ro label="Type" v="E6013" />
            </>
          ) : (
            <>
              <Ro cls="amp" label="Intensité" v={amp} unit="A" />
              <Ro label="Tension" v={line.v} unit={line.v === 'auto' ? '' : 'V'} />
              <Ro label="Fil" v={line.fil} unit={line.fil === 'auto' ? '' : 'm/min'} />
            </>
          )}
        </div>
        <div className="plate-body">
          <p>
            <span className="lbl">Consommables · </span>
            {R.fil}
          </p>
          <p>
            <span className="lbl">Geste · </span>
            {R.geste}
          </p>
          {line.note && <p className="note">{line.note}</p>}
          {f > 0 && <p className="note">{data.reglages.positions}</p>}
          {proc === 'dpmig' && <div className="warn">{data.reglages.dpmig.alerte}</div>}
          {isAlu && (
            <div className="tip">
              Avant de souder : configuration alu complète (onglet Poste), acétone, puis brosse inox réservée à l'alu juste avant l'arc.
            </div>
          )}
          <div className="row">
            <button
              className="btn ghost"
              type="button"
              onClick={() => toCarnet({ proc: CARNET_PROC[proc], mat: (isAlu ? 'Alu ' : 'Acier ') + line.ep, a: String(amp).split('–')[0] })}
            >
              Noter un essai avec ce réglage
            </button>
          </div>
        </div>
      </div>

      {proc === 'dpmig' ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <h3>Paramètres du double pulsé</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Réglage</th>
                  <th>Départ</th>
                  <th>Exemple</th>
                </tr>
              </thead>
              <tbody>
                {data.reglages.dpmig.params.map((p) => (
                  <tr key={p[0]}>
                    <td>{p[0]}</td>
                    <td>{p[1]}</td>
                    <td className="n">{p[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="status">Valeurs relevées sur ce même poste par un testeur amateur (apprentisoudeur.fr). Pars de là, puis ajuste sur une chute.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <h3>Toute la plage</h3>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Épaisseur</th>
                  <th>A</th>
                  <th>{isMMA ? 'Électrode' : 'V'}</th>
                  {!isMMA && <th>Fil m/min</th>}
                </tr>
              </thead>
              <tbody>
                {L.flatMap((l, i) => {
                  const sel = i === ep ? 'sel ' : ''
                  const rows = [
                    <tr key={i} className={sel + (l.note ? 'has-sub' : '')}>
                      <td>{l.ep}</td>
                      <td className="n">{scaleRange(l.a, f)}</td>
                      <td className="n">{l.v}</td>
                      {!isMMA && <td className="n">{l.fil}</td>}
                    </tr>,
                  ]
                  if (l.note)
                    rows.push(
                      <tr key={i + 'n'} className={'sub ' + sel}>
                        <td colSpan={isMMA ? 3 : 4}>{l.note}</td>
                      </tr>
                    )
                  return rows
                })}
              </tbody>
            </table>
          </div>
          <p className="status">
            « auto » : valeur proposée par le mode synergique. Points de départ tirés du bonus Arc Clair, des valeurs mesurées sur ce poste et de la notice, toujours à valider sur une chute.
          </p>
        </div>
      )}
    </section>
  )
}
