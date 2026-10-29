/* Le catalogue de la boutique, lu par les fonctions Netlify (netlify/lib/boutique.mjs)
   pour recalculer chaque montant. Genere a chaque construction du site : il
   est donc toujours d'accord avec ce que montrent les pages. */
import { getCollection } from "astro:content";
import { boutiqueEnPause } from "../../lib/donnees";

// Les jours d'un stage voyagent en AAAA-MM-JJ, sans heure
const jour = (d: Date) => d.toISOString().slice(0, 10);

export async function GET() {
  // En pause : aucune vente publiee, donc aucune commande acceptee
  if (boutiqueEnPause) return Response.json([]);
  const ventes = (await getCollection("boutique")).map(({ id, data: d }) => ({
    id,
    nom: d.nom,
    categorie: d.categorie,
    ouvertureLe: d.ouvertureLe?.toISOString(),
    fermetureLe: d.fermetureLe?.toISOString(),
    nominatif: d.nominatif,
    questions: d.questions,
    articles: d.articles.map((a) => ({
      nom: a.nom, prix: a.prix, places: a.places, tailles: a.tailles,
      jours: a.jours.map(jour),
      options: a.options.map((o) => ({ ...o, jour: o.jour && jour(o.jour) })),
    })),
  }));
  return Response.json(ventes);
}
