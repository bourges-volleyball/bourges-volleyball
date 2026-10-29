import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// L'adresse du site, avec www : c'est le domaine principal declare a Netlify
// (bourges-volleyball.fr, sans www, y renvoie). Sert aux liens de partage,
// a l'adresse canonique des pages et au plan du site (sitemap).
export default defineConfig({
  site: "https://www.bourges-volleyball.fr",
  integrations: [sitemap()],
  // Pas de coloration de code (Shiki) : inutile ici, et ses styles en ligne
  // seraient bloques par la CSP ci-dessous.
  markdown: { syntaxHighlight: false },
  security: {
    // Politique de securite (CSP) : seuls les scripts du site et ceux
    // qu'Astro a lui-meme empreintes peuvent s'executer. Un <script> glisse
    // dans une actualite depuis un compte benevole pirate serait bloque.
    // identity.netlify.com : le widget des liens d'invitation (Base.astro).
    csp: {
      scriptDirective: {
        resources: ["'self'", "https://identity.netlify.com"],
      },
      // Styles en ligne autorises : le widget Netlify injecte les siens, et
      // un style ne peut pas executer de code. Seuls les scripts sont verrouilles.
      styleDirective: {
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
  },
});
