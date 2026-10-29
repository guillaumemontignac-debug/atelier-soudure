import data from './data.json'

// Diagnostic photo via l'API Groq (modèle vision). La clé reste sur le téléphone.
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

export async function resizeImage(file, max = 1280, quality = 0.85) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Image illisible.'))
      i.src = url
    })
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function diagRef() {
  return data.diagnostic.map((d) => `- [${d.p}] ${d.s} | cause : ${d.c} | correction : ${d.r}`).join('\n')
}

export function buildPrompt(ctx) {
  return `Tu es formateur en soudage. Un débutant soude avec un poste Parkside Performance PMPS 200 B (MIG/MAG synergique 50–160 A, MIG pulsé et double pulsé 30–160 A, électrode 20–140 A). La photo montre un cordon d'essai sur une chute.

Contexte donné par le soudeur :
- Procédé : ${ctx.proc}
- Épaisseur et joint : ${ctx.ep || 'non précisé'}
- Réglage : ${ctx.reg || 'non précisé'}
- Remarques : ${ctx.q || 'aucune'}

Grille de diagnostic de référence (symptôme | cause | correction) :
${diagRef()}

Consignes :
1. Décris uniquement ce qui est visible : largeur, régularité, écailles, raccordement des bords, caniveaux, porosités, projections, couleur, départ et fin du cordon.
2. Si la photo ne permet pas de juger (flou, trop loin, reflets), dis-le et explique comment reprendre la photo.
3. Donne UNE seule correction prioritaire pour le prochain essai, chiffrée quand c'est possible (exemple : « −5 A », « longueur d'arc −0,5 », « avance plus vite »).
4. Rappelle que l'aspect ne prouve pas la pénétration : propose un contrôle simple (casse au marteau, sciage) si c'est pertinent.
5. Français, phrases courtes, ton direct.

Réponds uniquement avec un objet JSON de cette forme :
{"verdict":"bon"|"a_revoir"|"defaut","resume":"une phrase","observations":["…"],"cause_probable":"…","correction":"une seule action","controle":"…","confiance":"faible"|"moyenne"|"elevee","photo":"ok ou conseil pour une meilleure photo"}`
}

export function parseAnswer(content) {
  const text = String(content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  try {
    return JSON.parse(text)
  } catch {
    const a = text.indexOf('{')
    const b = text.lastIndexOf('}')
    if (a >= 0 && b > a) return JSON.parse(text.slice(a, b + 1))
    throw new Error('Réponse illisible. Relance l’analyse.')
  }
}

export async function analyzeWeld({ key, model, imageDataUrl, ctx, signal }) {
  if (!key) throw new Error('Ajoute ta clé Groq dans l’onglet Paramètres.')
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: buildPrompt(ctx) },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new Error('Pas de connexion : le diagnostic photo a besoin du réseau.')
  }
  if (!res.ok) {
    let msg = ''
    try {
      msg = (await res.json())?.error?.message || ''
    } catch {
      /* corps vide */
    }
    if (res.status === 401) throw new Error('Clé Groq refusée. Vérifie-la dans Paramètres.')
    if (res.status === 429) throw new Error('Limite Groq atteinte. Réessaie dans quelques minutes.')
    if (res.status === 404 || /model/i.test(msg)) throw new Error(`Modèle « ${model} » indisponible chez Groq. Change-le dans Paramètres. ${msg}`)
    throw new Error(`Erreur Groq (${res.status}). ${msg}`)
  }
  const json = await res.json()
  return parseAnswer(json?.choices?.[0]?.message?.content)
}
