import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* Adresse web saisie dans l'administration : seules http(s) passent. Un lien
   « javascript: » executerait du code chez le visiteur qui clique dessus. */
const lienWeb = z.string().regex(/^https?:\/\//i, "L'adresse doit commencer par https://");

/* Decap enregistre parfois un champ facultatif laisse vide sous forme de "" :
   on le traite comme absent, sinon une date vide devient « Invalid Date ». */
const facultatif = <T extends z.ZodTypeAny>(t: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), t.optional());

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
    // Photos en grille sous le texte (resultats, tournoi...), comme un album.
    // Sans photo de une, la premiere sert de vignette (lib/donnees : vignette)
    photos: z.array(z.object({ photo: image(), legende: facultatif(z.string()) })).default([]),
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


/* Boutique : une fiche par vente, comme un formulaire HelloAsso (textile,
   adhesion, stage, tournoi, buvette). Le site prend la commande, HelloAsso
   n encaisse que le paiement (voir netlify/lib/boutique.mjs).
   Ce sont les dates qui ouvrent et ferment une vente, pas une case a cocher
   qu il faudrait penser a decocher. Sans date, la vente reste ouverte. */
const boutique = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/boutique" }),
  schema: ({ image }) => z.object({
    nom: z.string(),
    categorie: z.enum(["equipement", "adhesion", "stage", "tournoi", "buvette"]),
    description: z.string(),
    image: image().optional(),
    quand: facultatif(z.string()),
    lieu: facultatif(z.string()),
    ouvertureLe: facultatif(z.coerce.date()),
    fermetureLe: facultatif(z.coerce.date()),
    // Coche : chaque place achetee demande le nom de la personne, et les questions
    nominatif: z.boolean().default(false),
    questions: z
      .array(z.object({ libelle: z.string(), type: z.enum(["texte", "ouinon"]).default("texte") }))
      .default([]),
    articles: z
      .array(
        z.object({
          nom: z.string(),
          description: facultatif(z.string()),
          prix: z.number().positive(),
          photo: image().optional(),
          places: facultatif(z.number().int().min(0)),
          tailles: z.array(z.string()).optional(),
          // Stage : le prix est celui d'une journee, chaque personne coche ses jours
          // parmi ceux-ci ; « places » est alors le nombre de places par jour
          jours: z.array(z.coerce.date()).default([]),
          options: z
            .array(
              z.object({
                nom: z.string(),
                prix: z.number().positive(),
                parJour: z.boolean().default(false),
                // Gratuite pour qui choisit au moins ce nombre de jours
                offerteDes: facultatif(z.number().int().min(1)),
                // Liee a un jour du stage (la sortie du mercredi) : demande ce jour
                jour: facultatif(z.coerce.date()),
              }),
            )
            .default([]),
        }),
      )
      .min(1),
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
      // Partie de la photo a garder quand l'ecran la recadre (Hero.astro)
      cadrage: z
        .enum(["centre", "haut", "bas", "gauche", "droite", "haut-gauche", "haut-droite", "bas-gauche", "bas-droite"])
        .default("centre"),
      luminosite: z.enum(["claire", "normale", "sombre"]).default("normale"),
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
    palmares: z.array(z.object({ annee: z.string(), titre: z.string(), detail: facultatif(z.string()) })).default([]),
    notePalmares: z.string().optional(),
  }),
});

/* Galerie : un album par evenement (tournoi, match, stage...). Les photos
   sont optimisees par Astro comme celles des actualites. */
const galerie = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/galerie" }),
  schema: ({ image }) => z.object({
    titre: z.string(),
    date: z.coerce.date(),
    description: facultatif(z.string()),
    photos: z.array(z.object({ photo: image(), legende: facultatif(z.string()) })).min(1),
  }),
});

/* Ecoles de sport de la Ville (dispositif « Faites du sport a Bourges ») :
   ni une equipe ni une adhesion du club, d'ou une rubrique a part, sur la
   page Nous rejoindre. Sans creneau, la rubrique disparait. */
const pageEcoles = defineCollection({
  loader: glob({ pattern: "ecoles-de-sport.md", base: "./src/content/pages" }),
  schema: z.object({
    titre: z.string(),
    intro: z.string(),
    creneaux: z
      .array(z.object({ public: z.string(), activite: z.string(), jour: z.string(), horaire: z.string(), lieu: z.string() }))
      .default([]),
    inscription: z.string(),
  }),
});

export const collections = {
  actus, equipes, matchs, partenaires, boutique, evenements, diaporama, pageAccueil, pageClub, pageEcoles, galerie,
};
