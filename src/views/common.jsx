export function Chips({ items, value, onPick }) {
  return (
    <div className="chips">
      {items.map(([id, label]) => (
        <button key={String(id)} type="button" className="chip" aria-pressed={id === value} onClick={() => onPick(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function Head({ title, lede, children }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </div>
  )
}

export const PROCS = ['MAG acier', 'MIG pulsé acier', 'MIG pulsé alu', 'Double pulsé alu', 'Électrode', 'TIG acier']

export const APP_VERSION = '1.0.1'
