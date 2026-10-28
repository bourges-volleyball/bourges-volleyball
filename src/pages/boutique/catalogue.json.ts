/* Le catalogue de la boutique, lu par les fonctions Netlify (netlify/lib/boutique.mjs)
   pour recalculer chaque montant. Genere a chaque construction du site : il
   est donc toujours d'accord avec ce que montrent les pages. */
import { getCollection } from "astro:content";

export async function GET() {
  const ventes = (await getCollection("boutique")).map(({ id, data: d }) => ({
    id,
    nom: d.nom,
    categorie: d.categorie,
    ouvertureLe: d.ouvertureLe?.toISOString(),
    fermetureLe: d.fermetureLe?.toISOString(),
    nominatif: d.nominatif,
    questions: d.questions,
    articles: d.articles.map((a) => ({ nom: a.nom, prix: a.prix, places: a.places, tailles: a.tailles })),
  }));
  return Response.json(ventes);
}
