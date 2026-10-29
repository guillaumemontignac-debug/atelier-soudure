import { useRef, useState } from 'react'
import { DEFAULT_MODEL, backupJson, download, parseBackup, today } from '../store.js'
import { testGroqConnection } from '../ai.js'
import { APP_VERSION, Head } from './common.jsx'

export default function Parametres({ state, update }) {
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [armed, setArmed] = useState(false)
  const [test, setTest] = useState(null)
  const [testing, setTesting] = useState(false)
  const runTest = async () => {
    setTesting(true)
    setTest({ ok: null, message: 'Test en cours…' })
    setTest(await testGroqConnection(s.groqKey, s.groqModel))
    setTesting(false)
  }
  const fileRef = useRef(null)
  const s = state.settings
  const setSetting = (k, v) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }))

  const restore = async (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    try {
      const next = parseBackup(await f.text(), state)
      update(() => next)
      setMsg(`Sauvegarde restaurée : ${next.entries.length} essais, ${Object.keys(next.progress).length} exercices validés.`)
    } catch (err) {
      setMsg(err.message || 'Fichier illisible.')
    }
  }

  const wipe = () => {
    if (!armed) {
      setArmed(true)
      setTimeout(() => setArmed(false), 4000)
      return
    }
    update((st) => ({ ...st, progress: {}, entries: [] }))
    setArmed(false)
    setMsg('Carnet et progression effacés.')
  }

  return (
    <section>
      <Head title="Paramètres" lede={`Atelier PMPS 200 · version ${APP_VERSION}. Tes données restent sur ce téléphone.`} />

      <h3>Diagnostic photo (Groq)</h3>
      <p>
        Le diagnostic photo utilise un modèle d'IA qui lit les images, via ton compte Groq. Crée une clé sur{' '}
        <a className="linkout" href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
          console.groq.com/keys
        </a>{' '}
        et colle-la ici. Elle reste dans ce téléphone et n'est jamais incluse dans une sauvegarde.
      </p>
      <div className="grid2">
        <div className="field">
          <label htmlFor="groqKey">Clé API Groq</label>
          <input
            id="groqKey"
            className="keybox"
            type={show ? 'text' : 'password'}
            autoComplete="off"
            spellCheck="false"
            placeholder="gsk_…"
            value={s.groqKey}
            onChange={(e) => setSetting('groqKey', e.target.value.trim())}
          />
        </div>
        <div className="field">
          <label htmlFor="groqModel">Modèle vision</label>
          <input id="groqModel" className="keybox" value={s.groqModel} onChange={(e) => setSetting('groqModel', e.target.value.trim())} />
        </div>
      </div>
      <div className="row">
        <button className="btn ghost" type="button" onClick={() => setShow(!show)}>
          {show ? 'Masquer la clé' : 'Afficher la clé'}
        </button>
        <button className="btn" type="button" disabled={!s.groqKey || testing} onClick={runTest}>
          {testing ? 'Test…' : 'Tester la connexion'}
        </button>
        {s.groqModel !== DEFAULT_MODEL && (
          <button className="btn ghost" type="button" onClick={() => setSetting('groqModel', DEFAULT_MODEL)}>
            Revenir à {DEFAULT_MODEL}
          </button>
        )}
      </div>
      {test && <div className={test.ok === true ? 'tip' : test.ok === false ? 'warn' : 'status'}>{test.message}</div>}
      {test?.keyOk && !test.ok && test.models?.length > 0 && (
        <div className="chips">
          {test.models
            .filter((id) => !/whisper|tts|guard|orpheus|distil/i.test(id))
            .map((id) => (
              <button key={id} type="button" className="chip" onClick={() => setSetting('groqModel', id)}>
                {id}
              </button>
            ))}
        </div>
      )}
      <p className="status">
        Clé non partagée avec tes autres applis : chaque appli garde la sienne dans le téléphone, colle-la ici aussi.
      </p>
      <p className="status">
        Modèle par défaut : {DEFAULT_MODEL}, qui accepte les images selon la documentation Groq (octobre 2026). S'il disparaît, remplace-le par un autre
        modèle « vision » listé sur console.groq.com/docs/vision.
      </p>

      <h3>Sauvegarde</h3>
      <p>Le carnet et la progression vivent dans ce téléphone. Exporte une sauvegarde de temps en temps, et avant de changer de téléphone.</p>
      <div className="row">
        <button className="btn" type="button" onClick={() => download(`atelier-pmps-sauvegarde-${today()}.json`, backupJson(state), 'application/json')}>
          Exporter une sauvegarde
        </button>
        <button className="btn ghost" type="button" onClick={() => fileRef.current?.click()}>
          Restaurer une sauvegarde
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} />
      </div>
      <div className="row">
        <button className="btn ghost" type="button" onClick={wipe}>
          {armed ? 'Confirmer : tout effacer' : 'Effacer carnet et progression'}
        </button>
        <span className="status">{msg}</span>
      </div>

      <h3>Installer sur l'iPhone</h3>
      <ol className="check">
        <li>
          <span>Ouvre l'adresse Vercel de l'appli dans Safari.</span>
        </li>
        <li>
          <span>Bouton Partager, puis « Sur l'écran d'accueil ».</span>
        </li>
        <li>
          <span>Lance-la depuis l'icône : elle s'ouvre en plein écran et fonctionne sans réseau (sauf le diagnostic photo).</span>
        </li>
      </ol>
    </section>
  )
}
