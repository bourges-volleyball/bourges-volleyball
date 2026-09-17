import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// L'adresse definitive sera le nom de domaine du club quand il sera pris.
// En attendant, celle fournie par Netlify. A changer ici et nulle part ailleurs.
export default defineConfig({
  site: "https://bourges-volleyball.netlify.app",
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
