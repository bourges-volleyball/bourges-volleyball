import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// L'adresse du site, pour les liens de partage, l'adresse canonique des pages
// et le plan du site (sitemap). Sur Netlify, URL est l'adresse principale du
// site au moment de la construction : bourges-volleyball.netlify.app tant que
// le domaine n'est pas branche, www.bourges-volleyball.fr ensuite (la version
// sans www y renvoie). Ailleurs, l'adresse definitive.
export default defineConfig({
  site: process.env.URL ?? "https://www.bourges-volleyball.fr",
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
