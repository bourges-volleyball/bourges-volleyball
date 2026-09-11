import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// L'adresse definitive sera le nom de domaine du club quand il sera pris.
// En attendant, celle fournie par Netlify. A changer ici et nulle part ailleurs.
export default defineConfig({
  site: "https://bourges-volley.netlify.app",
  integrations: [sitemap()],
});
