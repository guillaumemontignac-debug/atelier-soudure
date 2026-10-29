import data from '../data.json'
import { Head } from './common.jsx'

const LIB = [
  [
    'À garder et ouvrir',
    [
      ['Guide d’auto-apprentissage CSMOFMI (Québec, 266 p.)', 'le document le plus sérieux du lot. Métallurgie, défauts, déformations, avec exercices. Vocabulaire nord-américain (GMAW, SMAW).'],
      ['ESAB, fondamentaux MIG/MAG', 'les modes de transfert et le pulsé, mieux expliqués que partout ailleurs. Discours commercial ESAB à ignorer.'],
      ['Manuel du soudeur Air Products', 'les pages défauts (p. 29–32) et le choix des gaz. Tableaux de paramètres industriels, hors de portée de ton poste.'],
      ['Arc Clair, bonus 1 et 2', 'réglages et progression, déjà repris dans cette appli.'],
    ],
  ],
  [
    'À consulter au besoin',
    [
      ['Guide Arc Clair (332 p.)', 'correct mais générique, pages en image non cherchables.'],
      ['SD Service MIG/MAG 2016', 'désignation des alliages d’alu et choix du métal d’apport.'],
      ['Lexique Arc Clair FR-EN', 'utile pour les vidéos et les notices en anglais.'],
    ],
  ],
  [
    'Inutile pour toi',
    [
      ['Dossier EN 1090 / ISO 9606', 'qualification de soudeurs en entreprise.'],
      ['MIG-Plasma (1978)', 'travail universitaire sur un procédé industriel.'],
      ['Weman, Procédés de soudage', 'extrait de 29 pages seulement.'],
      ['Cours KTARI, JOHO, Guérin', 'généralités scolaires, redondantes.'],
      ['Cours CAP carrosserie', 'contient une erreur sur le rôle du CO₂.'],
      ['Aide-mémoire fumées', 'écrit pour l’industrie. À retenir : le pulsé émet moins de fumées.'],
      ['SD Service TIG', 'ton poste ne soude pas l’alu en TIG ; pour plus tard, en acier.'],
    ],
  ],
]

export default function Memo() {
  return (
    <section>
      <Head title="Mémo d'atelier" lede="L'essentiel de la sécurité, les deux check-lists de séance, et ce qu'il faut garder de ta documentation." />
      <dl className="kv">
        {data.securite.flatMap(([k, v]) => [<dt key={k + 't'}>{k}</dt>, <dd key={k + 'd'}>{v}</dd>])}
      </dl>
      <h3>Teinte du masque</h3>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Intensité</th>
              <th>MAG acier</th>
              <th>MIG alu</th>
            </tr>
          </thead>
          <tbody>
            {data.teintes.map((t) => (
              <tr key={t[0]}>
                {t.map((c, i) => (
                  <td key={i} className={i ? 'n' : ''}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <h3>Avant d'amorcer</h3>
          <ol className="check">
            {data.avant.map((t) => (
              <li key={t}>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <h3>Fin de séance</h3>
          <ol className="check">
            {data.apres.map((t) => (
              <li key={t}>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <h3>Repères de plan</h3>
      <dl className="kv">
        <dt>Gorge</dt>
        <dd>Cordon d'angle à 90° : a ≈ 0,7 × z. « a5 » = gorge de 5 mm, « z5 » = côté de 5 mm.</dd>
        <dt>Positions</dt>
        <dd>PA à plat · PB angle à plat · PC corniche · PF montante · PG descendante · PE plafond (ISO 6947).</dd>
        <dt>Procédés</dt>
        <dd>111 électrode · 131 MIG · 135 MAG · 136 fil fourré sous gaz · 114 fil fourré sans gaz · 141 TIG (ISO 4063).</dd>
      </dl>
      <h3>Ta documentation : quoi garder</h3>
      <div className="lib">
        {LIB.map(([title, items]) => (
          <div key={title}>
            <h3 style={{ fontSize: 16 }}>{title}</h3>
            <ul>
              {items.map(([n, d]) => (
                <li key={n}>
                  <b>{n}</b> : {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
