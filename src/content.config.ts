import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* Adresse web saisie dans l'administration : seules http(s) passent. Un lien
   « javascript: » executerait du code chez le visiteur qui clique dessus. */
const lienWeb = z.string().regex(/^https?:\/\//i, "L'adresse doit commencer par https://");

/* Ces schemas sont le contrat entre le site et l'interface d'administration.
   Toute modification ici doit être repercutee dans public/admin/config.yml,
   sinon les bénévoles pourront saisir un champ que le site ignorera. */

const actus = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/actus" }),
  // image() : Astro convertit la photo en WebP a plusieurs tailles.
  // Une photo de telephone de 5 Mo etait sinon servie telle quelle.
  schema: ({ image }) => z.object({
    titre: z.string(),
    date: z.coerce.date(),
    chapo: z.string(),
    image: image().optional(),
    // Affiche des reseaux sociaux : jamais recadree, ouvrable en grand
    affiche: z.boolean().default(false),
    brouillon: z.boolean().default(false),
  }),
});

const equipes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/equipes" }),
  schema: ({ image }) => z.object({
    nom: z.string(),
    ordre: z.number(),
    // Bornes d'age : ce sont elles qui alimentent le sélecteur
    // de la page « Nous rejoindre ». 99 = pas de limite haute.
    ageMin: z.number(),
    ageMax: z.number(),
    niveau: z.string(),
    creneaux: z.array(z.object({ jour: z.string(), horaire: z.string() })),
    gymnase: z.string(),
    coach: z.string().optional(),
    tarif: z.number(),
    photo: image().optional(),
    // Composition de l equipe. Le poste et le numero sont facultatifs :
    // toutes les sections ne les suivent pas, notamment chez les jeunes.
    effectif: z
      .array(
        z.object({
          nom: z.string(),
          poste: z.string().optional(),
          numero: z.number().optional(),
        }),
      )
      .optional(),
  }),
});

const matchs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/matchs" }),
  schema: z.object({
    date: z.coerce.date(),
    equipe: z.string(),
    adversaire: z.string(),
    domicile: z.boolean().default(true),
    competition: z.string(),
    lieu: z.string().optional(),
    // Scores absents tant que le match n'est pas joué : c'est ce qui
    // distingue une rencontre à venir d'un résultat.
    scoreNous: z.number().optional(),
    scoreEux: z.number().optional(),
    sets: z.string().optional(),
  }),
});

const partenaires = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/partenaires" }),
  schema: ({ image }) => z.object({
    nom: z.string(),
    niveau: z.enum(["principal", "officiel", "institutionnel"]),
    lien: lienWeb.optional(),
    logo: image().optional(),
    ordre: z.number().default(10),
  }),
});


/* Boutique ponctuelle : les ventes du club ouvrent et ferment a dates fixes
   (commande groupee de maillots a la rentree, par exemple). Ce sont ces deux
   dates qui determinent si un article est commandable, pas une case a cocher
   qu il faudrait penser a decocher. */
const boutique = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/boutique" }),
  schema: ({ image }) => z.object({
    nom: z.string(),
    description: z.string(),
    prix: z.number(),
    image: image().optional(),
    tailles: z.array(z.string()).optional(),
    lienHelloAsso: lienWeb,
    ouvertureLe: z.coerce.date(),
    fermetureLe: z.coerce.date(),
    ordre: z.number().default(10),
  }),
});


/* Evenements du club : tournois, assemblee generale, stages, repas, loto.
   Tout ce qui n est pas un match de championnat. */
const evenements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/evenements" }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    dateFin: z.coerce.date().optional(),
    // Une assemblee generale a une heure ; un stage sur deux jours, non.
    avecHeure: z.boolean().default(true),
    lieu: z.string().optional(),
    type: z.enum(["tournoi", "vie du club", "stage", "autre"]).default("autre"),
    description: z.string(),
    lien: lienWeb.optional(),
  }),
});

/* Photos du diaporama de l'accueil. image() plutot qu'une simple chaine :
   Astro retrouve le fichier et le convertit en WebP a plusieurs tailles,
   indispensable pour des photos de telephone de plusieurs Mo. */
const diaporama = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/diaporama" }),
  schema: ({ image }) =>
    z.object({
      photo: image(),
      alt: z.string(),
      ordre: z.number().default(10),
    }),
});

/* Textes fixes des pages, modifiables dans l'administration (rubrique
   « Textes des pages »). Un fichier par page, chacun avec ses champs. */
const pageAccueil = defineCollection({
  loader: glob({ pattern: "accueil.md", base: "./src/content/pages" }),
  schema: z.object({
    bandeau: z.string(),
    titre: z.string(),
    titreSuite: z.string(),
    motFort: z.string(),
    accroche: z.string(),
    texte: z.string(),
  }),
});

const pageClub = defineCollection({
  loader: glob({ pattern: "le-club.md", base: "./src/content/pages" }),
  schema: z.object({
    surtitre: z.string(),
    intro: z.string(),
    chiffres: z.array(z.object({ valeur: z.string(), legende: z.string() })).default([]),
    histoire: z.array(z.object({ date: z.string(), titre: z.string(), texte: z.string() })).default([]),
    palmares: z.array(z.object({ annee: z.string(), titre: z.string(), detail: z.string() })).default([]),
    notePalmares: z.string().optional(),
  }),
});

export const collections = {
  actus, equipes, matchs, partenaires, boutique, evenements, diaporama, pageAccueil, pageClub,
};
