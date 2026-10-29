import { useCallback, useEffect, useState } from 'react'

// Toutes les données restent sur le téléphone (localStorage).
// schemaVersion permet de migrer proprement si la structure change.
const KEY = 'atelier-pmps.v1'
export const SCHEMA_VERSION = 1
export const DEFAULT_MODEL = 'qwen/qwen3.8-27b'

const empty = () => ({
  schemaVersion: SCHEMA_VERSION,
  progress: {}, // { [exerciceId]: 'AAAA-MM-JJ' }
  entries: [], // essais du carnet
  settings: { groqKey: '', groqModel: DEFAULT_MODEL },
  reg: { proc: 'mag', ep: 3, pos: 'pa' },
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    return migrate(JSON.parse(raw))
  } catch {
    return empty()
  }
}

function migrate(s) {
  const base = empty()
  if (!s || typeof s !== 'object') return base
  return {
    ...base,
    ...s,
    settings: { ...base.settings, ...(s.settings || {}) },
    reg: { ...base.reg, ...(s.reg || {}) },
    progress: s.progress && typeof s.progress === 'object' ? s.progress : {},
    entries: Array.isArray(s.entries) ? s.entries : [],
    schemaVersion: SCHEMA_VERSION,
  }
}

export function useStore() {
  const [state, setState] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* stockage plein ou bloqué : l'appli continue en mémoire */
    }
  }, [state])
  const update = useCallback((fn) => setState((s) => fn(s)), [])
  return [state, update]
}

/* ---------- sauvegarde / restauration ---------- */

export function backupJson(state) {
  const { settings, ...rest } = state
  // la clé API ne part jamais dans une sauvegarde
  return JSON.stringify({ ...rest, settings: { groqModel: settings.groqModel }, exportedAt: new Date().toISOString() }, null, 2)
}

export function parseBackup(text, current) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !('entries' in data || 'progress' in data)) {
    throw new Error('Ce fichier ne ressemble pas à une sauvegarde Atelier PMPS.')
  }
  const m = migrate(data)
  return { ...m, settings: { ...m.settings, groqKey: current.settings.groqKey } }
}

/* ---------- export CSV du carnet ---------- */

const CSV_COLS = [
  ['date', 'Date'],
  ['proc', 'Procédé'],
  ['mat', 'Matière et épaisseur'],
  ['joint', 'Joint et position'],
  ['a', 'Intensité A'],
  ['arc', 'Arc / tension'],
  ['fil', 'Fil m/min'],
  ['gaz', 'Gaz et débit'],
  ['res', 'Résultat'],
  ['note', 'Note'],
]

function csvCell(v) {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s // protection contre l'injection de formules
  return '"' + s.replace(/"/g, '""') + '"'
}

export function entriesCsv(entries) {
  const head = CSV_COLS.map((c) => csvCell(c[1])).join(';')
  const rows = entries.map((e) =>
    CSV_COLS.map(([k]) => csvCell(k === 'res' ? (e.res === 'ok' ? 'Validé' : 'À revoir') : e[k])).join(';')
  )
  return '﻿' + [head, ...rows].join('\r\n')
}

export function download(filename, text, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export const today = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const fmtDate = (s) => {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
