/* Les donnees FFVolley telles que publiees avec le site, et les poules lues.
   Le lundi, netlify/functions/reconstruire.mjs les compare a la FFVolley et
   ne republie le site que si quelque chose a change. */
import ffvb from "../data/ffvb.json";
import reglages from "../data/ffvb-poules.json";
import { poulesDepuis } from "../../netlify/lib/ffvb.mjs";

export function GET() {
  return Response.json({ poules: poulesDepuis(reglages.poules), matchs: ffvb.matchs, classements: ffvb.classements ?? {} });
}
