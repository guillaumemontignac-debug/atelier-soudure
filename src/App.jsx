import { useEffect, useState } from 'react'
import { useStore } from './store.js'
import Reglages from './views/Reglages.jsx'
import Diagnostic from './views/Diagnostic.jsx'
import Parcours from './views/Parcours.jsx'
import Photo from './views/Photo.jsx'
import Carnet from './views/Carnet.jsx'
import Poste from './views/Poste.jsx'
import Memo from './views/Memo.jsx'
import Parametres from './views/Parametres.jsx'
import { APP_VERSION } from './views/common.jsx'

const VIEWS = [
  ['reglages', 'Réglages'],
  ['diagnostic', 'Diagnostic'],
  ['parcours', 'Parcours'],
  ['photo', 'Photo IA'],
  ['carnet', 'Carnet'],
  ['poste', 'Poste'],
  ['memo', 'Mémo'],
  ['parametres', 'Paramètres'],
]

const fromHash = () => {
  const h = location.hash.slice(1)
  return VIEWS.some(([id]) => id === h) ? h : 'reglages'
}

export default function App() {
  const [state, update] = useStore()
  const [view, setView] = useState(fromHash)
  const [draft, setDraft] = useState(null) // pré-remplissage du carnet
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const onHash = () => {
      setView(fromHash())
      window.scrollTo(0, 0)
    }
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const go = (v) => {
    location.hash = '#' + v
  }
  const toCarnet = (d) => {
    setDraft({ ...d, _t: Date.now() })
    go('carnet')
  }

  return (
    <>
      <header>
        <div className="wrap">
          <div className="brand">
            <h1>
              Atelier <span>PMPS 200</span>
            </h1>
            <small>v{APP_VERSION}</small>
          </div>
          <nav aria-label="Sections">
            {VIEWS.map(([id, label]) => (
              <a key={id} href={'#' + id} aria-current={view === id ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
        </div>
        {!online && <div className="offline">Hors connexion : tout fonctionne sauf le diagnostic photo.</div>}
      </header>
      <main className="wrap">
        {view === 'reglages' && <Reglages state={state} update={update} toCarnet={toCarnet} />}
        {view === 'diagnostic' && <Diagnostic />}
        {view === 'parcours' && <Parcours state={state} update={update} />}
        {view === 'photo' && <Photo state={state} toCarnet={toCarnet} online={online} />}
        {view === 'carnet' && <Carnet state={state} update={update} draft={draft} />}
        {view === 'poste' && <Poste />}
        {view === 'memo' && <Memo />}
        {view === 'parametres' && <Parametres state={state} update={update} />}
      </main>
    </>
  )
}
