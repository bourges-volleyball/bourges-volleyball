/* Lancee chaque nuit par Netlify.
   - Une commande en attente depuis plus d'une heure est verifiee aupres de
     HelloAsso : c'est le filet si la notification de paiement s'est perdue.
   - Une commande jamais payee est supprimee au bout de deux jours.
   - Toute commande est supprimee un an apres : duree annoncee sur la page
     Confidentialite. A changer aux deux endroits a la fois. */

import { store, confirmer } from "../lib/boutique.mjs";

const HEURE = 3600000;
const CONSERVATION = 365 * 24 * HEURE;

export default async (req, context) => {
  const s = store();
  const { blobs } = await s.list();
  for (const { key } of blobs) {
    let c = await s.get(key, { type: "json" });
    if (!c) continue;
    const age = Date.now() - Date.parse(c.creeLe);
    if (c.statut !== "payée" && age > HEURE) {
      c = (await confirmer(key, context?.site?.url).catch((e) => (console.error(e), c))) ?? c;
    }
    if ((c.statut !== "payée" && age > 48 * HEURE) || age > CONSERVATION) await s.delete(key);
  }
};

export const config = { schedule: "@daily" };
