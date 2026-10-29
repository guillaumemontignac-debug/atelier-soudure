import { useState } from 'react'
import data from '../data.json'
import { Chips, Head } from './common.jsx'

export default function Poste() {
  const [swap, setSwap] = useState('versAlu')
  const P = data.poste
  return (
    <section>
      <Head title={P.nom} lede="Ce que ton poste sait faire, et comment passer de l'acier à l'alu sans bourrage." />
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Mode</th>
              <th>Plage</th>
              <th>Ce qu'il faut savoir</th>
            </tr>
          </thead>
          <tbody>
            {P.modes.map((m) => (
              <tr key={m.id}>
                <td>{m.nom}</td>
                <td className="n">{m.plage}</td>
                <td>{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="warn">
        Conséquence pour ton objectif : l'alu se soude sur ce poste en MIG pulsé ou double pulsé, pas en TIG (le TIG est en courant continu seulement).
        Ton fil, ton argon et la gaine téflon montée d'usine vont dans ce sens.
      </div>
      <h3>Fils et configuration</h3>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Fil</th>
              <th>Diamètres</th>
              <th>Gaz</th>
              <th>Configuration</th>
            </tr>
          </thead>
          <tbody>
            {P.fils.map((f) => (
              <tr key={f[0]}>
                {f.map((c, i) => (
                  <td key={i} className={i === 1 ? 'n' : ''}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="kv">
        <dt>Gaz</dt>
        <dd>{P.gaz}</dd>
        <dt>Bouteilles</dt>
        <dd>Lis l'étiquette, pas la couleur : I1 = argon pur (alu), M21 = argon + 15 à 25 % CO₂ (acier), C1 = CO₂ pur (acier).</dd>
        <dt>Courant</dt>
        <dd>{P.alimentation}</dd>
        <dt>À vérifier</dt>
        <dd>{P.manque}</dd>
        <dt>Fil alu</dt>
        <dd>
          AlMg5 (5356) : plus raide, il dévide mieux, convient aux tôles 5000 et à la plupart des 6000. AlSi5 (4043) : plus fluide, moins sensible à la
          fissuration, pour les pièces moulées. Le programme synergique doit correspondre à l'étiquette de ta bobine.
        </dd>
      </dl>
      <h3>Changer de fil</h3>
      <Chips
        items={[
          ['versAlu', 'Acier → alu'],
          ['versAcier', 'Alu → acier'],
        ]}
        value={swap}
        onPick={setSwap}
      />
      <ol className="check">
        {data.changement[swap].map((t) => (
          <li key={t}>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
