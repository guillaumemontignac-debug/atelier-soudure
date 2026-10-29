import { useRef, useState } from 'react'
import { analyzeWeld, resizeImage } from '../ai.js'
import { Head, PROCS } from './common.jsx'

const VERDICT = { bon: ['bon', 'Bon cordon'], a_revoir: ['revoir', 'À revoir'], defaut: ['defaut', 'Défaut'] }
const CONF = { faible: 'faible', moyenne: 'moyenne', elevee: 'élevée' }

export default function Photo({ state, toCarnet, online }) {
  const [img, setImg] = useState(null) // data URL redimensionnée
  const [ctx, setCtx] = useState({ proc: PROCS[0], ep: '', reg: '', q: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [res, setRes] = useState(null)
  const ctl = useRef(null)
  const key = state.settings.groqKey

  const pick = async (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setMsg('')
    setRes(null)
    try {
      setImg(await resizeImage(f))
    } catch (err) {
      setMsg(err.message)
    }
  }

  const run = async () => {
    ctl.current = new AbortController()
    setBusy(true)
    setRes(null)
    setMsg('Analyse en cours… (10 à 30 secondes)')
    try {
      const r = await analyzeWeld({ key, model: state.settings.groqModel, imageDataUrl: img, ctx, signal: ctl.current.signal })
      if (!r || typeof r !== 'object') throw new Error('Réponse illisible. Relance l’analyse.')
      setRes(r)
      setMsg('')
    } catch (err) {
      setMsg(err.name === 'AbortError' ? '' : err.message)
    } finally {
      setBusy(false)
    }
  }

  const field = (k) => ({ value: ctx[k], onChange: (e) => setCtx({ ...ctx, [k]: e.target.value }) })
  const v = res ? VERDICT[res.verdict] || VERDICT.a_revoir : null

  return (
    <section>
      <Head
        title="Diagnostic photo"
        lede="Photographie le cordon refroidi et brossé, de dessus, bien éclairé, avec la chute entière dans le cadre. L'IA lit la photo et te donne une seule correction pour le prochain essai."
      />
      {!key && (
        <div className="warn">
          Pour utiliser le diagnostic photo, ajoute ta clé Groq dans <a href="#parametres">Paramètres</a>. Le reste de l'appli fonctionne sans.
        </div>
      )}
      {!online && <div className="warn">Hors connexion : le diagnostic photo a besoin du réseau.</div>}
      <div className="drop">
        <label className="btn ghost" htmlFor="photoFile">
          Choisir ou prendre une photo
        </label>
        <input id="photoFile" type="file" accept="image/*" hidden onChange={pick} />
        {img && <img className="preview" src={img} alt="Photo du cordon" />}
      </div>
      <div className="grid2">
        <div className="field">
          <label htmlFor="phProc">Procédé</label>
          <select id="phProc" {...field('proc')}>
            {PROCS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="phEp">Épaisseur et joint</label>
          <input id="phEp" placeholder="3 mm, angle PB" {...field('ep')} />
        </div>
        <div className="field">
          <label htmlFor="phReg">Réglage utilisé</label>
          <input id="phReg" placeholder="95 A, arc −1,5, 7,1 m/min" {...field('reg')} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="phQ">Ce que tu as remarqué (facultatif)</label>
        <textarea id="phQ" placeholder="Le fil a hésité au départ, ça a percé à la fin…" {...field('q')} />
      </div>
      <div className="row">
        <button className="btn" type="button" disabled={!img || !key || busy || !online} onClick={run}>
          Analyser le cordon
        </button>
        {busy && (
          <button className="btn ghost" type="button" onClick={() => ctl.current?.abort()}>
            Arrêter
          </button>
        )}
        <span className="status">{msg}</span>
      </div>

      {res && (
        <div className="result">
          <div className="row">
            <span className={'verdict ' + v[0]}>{v[1]}</span>
            <span className="status">Confiance {CONF[res.confiance] || 'non précisée'}</span>
          </div>
          {res.resume && <p>{String(res.resume)}</p>}
          {Array.isArray(res.observations) && res.observations.length > 0 && (
            <div>
              <div className="lbl">Ce qui se voit</div>
              <ul className="clean">
                {res.observations.map((o, i) => (
                  <li key={i}>{String(o)}</li>
                ))}
              </ul>
            </div>
          )}
          {res.cause_probable && (
            <p>
              <span className="lbl">Cause probable · </span>
              {String(res.cause_probable)}
            </p>
          )}
          {res.correction && (
            <div>
              <div className="lbl">Au prochain essai, change une seule chose</div>
              <p className="fix">{String(res.correction)}</p>
            </div>
          )}
          {res.controle && (
            <p>
              <span className="lbl">Contrôle · </span>
              {String(res.controle)}
            </p>
          )}
          {res.photo && res.photo !== 'ok' && <p className="tip">{String(res.photo)}</p>}
          <div className="row">
            <button
              className="btn ghost"
              type="button"
              onClick={() =>
                toCarnet({
                  proc: ctx.proc,
                  mat: ctx.ep,
                  a: (ctx.reg.match(/(\d+)\s*A/) || [])[1] || '',
                  res: res.verdict === 'bon' ? 'ok' : 'ko',
                  note: [res.resume, res.correction && 'À faire : ' + res.correction].filter(Boolean).join(' '),
                })
              }
            >
              Noter dans le carnet
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
