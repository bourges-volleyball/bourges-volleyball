/* /.netlify/functions/commande
   GET  ?campagne=id : places encore libres, affichees sur la page de la vente.
   POST            : verifie la commande et cree une intention de paiement HelloAsso.
   
   SECURITE :
   - Verification CSRF via un jeton dans l'en-tete X-CSRF-Token
   - La commande n'est enregistree qu'apres la creation de l'intention HelloAsso
   - Validation stricte des donnees
   */

import { catalogue, verifier, placesRestantes, store, helloasso } from "../lib/boutique.mjs";

// Secret pour la verification CSRF (doit etre definit dans les variables d'environnement)
const CSRF_SECRET = process.env.CSRF_SECRET || 'changer-ce-secret-en-production';

/** Verifie le jeton CSRF */
function verifierCSRF(jeton) {
  if (!jeton) return false;
  // En production, comparer avec un jeton stocke en session ou dans un cookie
  // Pour l'instant, on utilise un secret statique (a ameliorer)
  return jeton === CSRF_SECRET;
}


export default async (req) => {
  const origine = new URL(req.url).origin;
  const campagnes = await catalogue(origine);
  
  // Verification du Content-Type
  if (req.method === "POST") {
    const contentType = req.headers.get("content-type");
    if (contentType !== "application/json") {
      return Response.json({ erreur: "Content-Type doit etre application/json" }, { status: 415 });
    }
  }

  if (req.method === "GET") {
    const campagne = campagnes.find((c) => c.id === new URL(req.url).searchParams.get("campagne"));
    if (!campagne) return Response.json({}, { status: 404 });
    return Response.json(await placesRestantes(campagne));
  }
  if (req.method !== "POST") return new Response(null, { status: 405 });

  // Verification CSRF
  const csrfToken = req.headers.get("x-csrf-token");
  if (!verifierCSRF(csrfToken)) {
    return Response.json(
      { erreur: "Jeton CSRF invalide ou manquant" },
      { status: 403 }
    );
  }

  const demande = await req.json().catch(() => null);
  if (!demande) {
    return Response.json(
      { erreur: "Donnees de commande invalides" },
      { status: 400 }
    );
  }

  const campagne = campagnes.find((c) => c.id === demande?.campagne);
  const v = verifier(campagne, demande, campagne ? await placesRestantes(campagne) : {});
  if (v.erreur) return Response.json({ erreur: v.erreur }, { status: 400 });

  // Generation de l'ID de commande AVANT la creation de l'intention HelloAsso
  const id = crypto.randomUUID();
  const cle = `${campagne.id}/${id}`;

  const retour = `${origine}/boutique/paiement/?campagne=${campagne.id}&commande=${id}`;
  
  // Creation de l'intention de paiement HelloAsso EN PREMIER
  // La commande ne sera enregistree qu'apres succes
  try {
    const intention = await helloasso("/checkout-intents", {
      totalAmount: v.total,
      initialAmount: v.total,
      itemName: campagne.nom.slice(0, 250),
      backUrl: `${origine}/boutique/${campagne.id}/`,
      errorUrl: `${retour}&erreur=1`,
      returnUrl: retour,
      containsDonation: false,
      payer: { firstName: v.payeur.prenom, lastName: v.payeur.nom, email: v.payeur.email },
      metadata: { campagne: campagne.id, commande: id },
    });

    // SEULEMENT APRES la creation de l'intention, on enregistre la commande
    const commande = {
      id,
      campagne: campagne.id,
      campagneNom: campagne.nom,
      categorie: campagne.categorie,
      creeLe: new Date().toISOString(),
      statut: "en attente",
      remis: false,
      checkoutIntentId: intention.id,
      ...v,
    };
    const s = store();
    await s.setJSON(cle, commande);

    return Response.json({ url: intention.redirectUrl });
  } catch (e) {
    console.error("Erreur creation intention HelloAsso:", e);
    return Response.json(
      { erreur: "Le paiement est momentanement indisponible. Reessayez dans quelques minutes." },
      { status: 502 },
    );
  }
};
