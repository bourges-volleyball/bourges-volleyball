# Thème sombre sportif

Charte extraite du site du **Bourges Volley-Ball**, réutilisable sur un autre
projet. Copiez ce fichier à la racine du nouveau projet : il contient tout ce
qu'il faut pour reproduire le style, y compris le code à coller.

> **Si vous travaillez avec un assistant** (Claude Code, Copilot…), donnez-lui
> ce fichier et demandez-lui d'appliquer le thème. Tout y est.

---

## 1. Les quatre partis pris

Ce ne sont pas des détails d'exécution : c'est ce qui rend le style
reconnaissable. En retirer un fait perdre l'identité.

1. **Fond sombre, et une seule couleur d'accent.** Pas deux. Le noir n'est pas
   un noir pur mais un noir légèrement bleuté, ce qui évite l'effet « trou ».
2. **Titres en condensé, gras, capitales.** Le contraste avec le texte courant
   en largeur normale fait tout le travail typographique. Aucun autre effet
   n'est nécessaire.
3. **L'oblique à −10 degrés.** Boutons, étiquettes, puces, soulignés. C'est le
   geste sportif, emprunté au vocabulaire des maillots et des dossards.
4. **Des aplats séparés par un filet d'un pixel.** Jamais d'ombres portées,
   jamais de coins arrondis. Les blocs se touchent au lieu de flotter.

---

## 2. La règle de couleur

C'est la partie à respecter absolument. Elle tient tout l'ensemble.

> **L'accent = ce sur quoi on agit, et ce qu'on gagne.**
> **Le blanc = structure et identité.**

**L'accent va sur :** les boutons, les liens au survol, le focus clavier, les
flèches, les scores gagnants, un mot mis en exergue dans un titre.

**Rien d'autre.**

Le sortir ailleurs — sur les dates, les intertitres, les filets, les icônes
décoratives — le transforme en motif. Il cesse alors de signaler quoi que ce
soit, et c'est l'erreur qui tue ce genre de charte. Quand on hésite, la
question est : *est-ce qu'on clique dessus, ou est-ce qu'on l'a gagné ?* Si la
réponse est non aux deux, c'est du blanc ou du gris.

---

## 3. Les jetons

À coller en tête de votre feuille de style.

```css
:root {
  /* --- Fonds, du plus profond au plus proche --- */
  --noir: #0d0e11;        /* fond général de la page */
  --noir-2: #15171c;      /* panneau posé sur le fond */
  --noir-3: #1d2027;      /* élément à l'intérieur d'un panneau */
  --hair: #282c34;        /* filets et bordures */

  /* --- Textes --- */
  --fg: #f4f4f2;          /* texte courant */
  --fg-2: #9a9fa9;        /* texte secondaire, légendes */

  /* --- Structure : le blanc d'identité --- */
  --structure: #ffffff;
  --sur-structure: #0d0e11;

  /* --- Signal : l'accent. Agir et gagner. --- */
  --signal: #b4e600;
  --signal-fonce: #96c200;  /* survol des boutons pleins */
  --sur-signal: #101114;    /* encre posée SUR l'accent */
  --signal-clair: #546b00;  /* l'accent utilisable sur fond clair */

  /* --- Bandes claires --- */
  --clair: #f4f4f1;
  --sur-clair: #131417;
  --sur-clair-2: #5f636b;
  --clair-hair: #dcdcd8;

  /* --- Mesures --- */
  --pad: clamp(1.15rem, 4vw, 3.5rem);  /* marge latérale, fluide */
  --max: 1220px;                        /* largeur maximale du contenu */
  --texte: 66ch;                        /* largeur de lecture confortable */

  /* --- Échelle de texte. Trois tailles suffisent. --- */
  --s0: 0.75rem;   /* étiquettes, capitales espacées */
  --s1: 1rem;      /* texte courant */
  --s2: 1.18rem;   /* chapô, texte mis en avant */

  /* --- Le geste --- */
  --oblique: -10deg;
}
```

### Pourquoi trois fonds et pas un

`--noir` pour la page, `--noir-2` pour un panneau posé dessus, `--noir-3` pour
un élément **dans** ce panneau. Trois niveaux suffisent à créer de la
profondeur sans une seule ombre portée. Au-delà, les écarts deviennent
invisibles.

---

## 4. Typographie

Une seule famille, **Barlow**, en trois largeurs. C'est ce qui donne l'unité :
les titres et le texte sont parents, mais ne se ressemblent pas.

| Rôle | Fonte | Graisse | Traitement |
|---|---|---|---|
| Titres | Barlow Condensed | 800 | Capitales, interligne 0.92 |
| Étiquettes, dates, chiffres | Barlow Semi Condensed | 600 | Capitales, interlettrage 0.12–0.16em |
| Texte courant | Barlow | 400–600 | Normal, interligne 1.6 |

**L'interligne serré sur les titres n'est pas une coquetterie** : à cette
graisse et ce corps, la valeur par défaut laisserait des trous entre les
lignes d'un titre sur trois lignes.

### Chargement

Dans le `<head>`, avant votre feuille de style :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Barlow+Semi+Condensed:wght@500;600&family=Barlow:wght@400;500;600;700&display=swap"
/>
```

### Base

```css
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--noir);
  color: var(--fg);
  font-family: "Barlow", "Helvetica Neue", Arial, sans-serif;
  font-size: var(--s1);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: "Barlow Condensed", "Arial Narrow", sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  line-height: 0.92;
  letter-spacing: 0.005em;
  margin: 0;
  text-wrap: balance;
}

a { color: inherit; }
img { max-width: 100%; height: auto; }

/* Le focus clavier en accent : c'est un endroit où l'on agit. */
:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}
```

---

## 5. Changer la couleur

**Trois valeurs, pas plus.**

| Jeton | Rôle |
|---|---|
| `--signal` | l'accent |
| `--signal-fonce` | le même, environ 15 % plus sombre (survol des boutons pleins) |
| `--sur-signal` | l'encre posée **sur** l'accent |

Pour `--sur-signal` : **encre sombre sur un accent vif** (lime, cyan, jaune),
**encre claire sur un accent sombre** (bordeaux, bleu nuit). Visez au moins
4,5:1 entre les deux, sinon le texte des boutons devient illisible — c'est
l'erreur la plus fréquente.

Et `--signal-clair` : la déclinaison utilisable sur fond clair. Un lime ou un
cyan y disparaît complètement, il faut une version nettement plus sombre.

### Combinaisons éprouvées

| Accent | `--signal` | `--sur-signal` | `--signal-clair` |
|---|---|---|---|
| Vert lime *(l'original)* | `#B4E600` | `#101114` | `#546B00` |
| Cyan | `#22D3EE` | `#08131A` | `#0E6E80` |
| Orange | `#FF7A1A` | `#1A0C02` | `#A64200` |
| Magenta | `#F0399C` | `#FFFFFF` | `#96185C` |
| Jaune | `#FFD024` | `#171203` | `#7A6000` |

### Pour un projet en clair

Ce thème est sombre **par choix, pas par défaut**. Pour l'inverser : échangez
`--noir` avec `--fg`, `--noir-2` avec `--clair`, et remplacez `--signal` par la
valeur de `--signal-clair`. **Vérifiez les contrastes après** : un accent vif
qui fonctionnait sur du noir sera presque toujours illisible sur du blanc.

---

## 6. Les composants

### Mise en page

```css
.wrap {
  max-width: var(--max);
  margin-inline: auto;
  padding-inline: var(--pad);
}
.section { padding-block: clamp(2rem, 5vw, 3.25rem); }

/* Titre de page. Sur toutes les pages sauf l'accueil. */
.page-head {
  border-bottom: 1px solid var(--hair);
  padding-block: clamp(1.75rem, 4.5vw, 3rem);
}
.page-head h1 { font-size: clamp(2.4rem, 7vw, 4.5rem); margin-top: 0.7rem; }
.page-head p {
  margin: 1rem 0 0; max-width: 60ch;
  color: var(--fg-2); font-size: var(--s2);
}

/* Titre de section, lien aligné à droite sur la même ligne de base. */
.section-head {
  display: flex; flex-wrap: wrap;
  align-items: baseline; justify-content: space-between;
  gap: 0.5rem 1rem; margin-bottom: 1.5rem;
}
.section-head h2 { font-size: clamp(1.9rem, 5vw, 2.8rem); }
```

```html
<header class="page-head wrap">
  <p class="eyebrow">Surtitre</p>
  <h1>Le titre de la page</h1>
  <p>Une phrase d'introduction, en gris clair.</p>
</header>
```

### Typographie utilitaire

```css
/* Surtitre en capitales espacées. Le compagnon obligé des gros titres :
   il donne l'échelle sans ajouter de couleur. */
.eyebrow {
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: var(--s0); letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--fg-2); margin: 0;
}

/* Chiffres alignés en colonnes : horaires, scores, décomptes, tarifs. */
.mono {
  font-family: "Barlow Semi Condensed", sans-serif;
  font-variant-numeric: tabular-nums;
}

.texte { max-width: var(--texte); }

/* Lu par les lecteurs d'écran, invisible à l'œil. Pour préciser un lien
   dont le libellé se répète (« En savoir plus »). */
.hors-ecran {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
```

### Le geste oblique

Le bloc penche, le texte se redresse. **D'où le `<span>` intérieur** — sans
lui, les lettres seraient penchées elles aussi.

```css
/* Étiquette blanche : identité, catégorie, appartenance. */
.tag {
  display: inline-block; transform: skewX(var(--oblique));
  background: var(--structure); color: var(--sur-structure);
  padding: 0.28rem 0.85rem;
}
.tag > span {
  display: inline-block; transform: skewX(calc(var(--oblique) * -1));
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: var(--s0); letter-spacing: 0.14em; text-transform: uppercase;
}

/* Étiquette en accent : ce qui est nouveau, en cours, à la une. */
.etiquette {
  display: inline-block; margin: 0; transform: skewX(var(--oblique));
  background: var(--signal); color: var(--sur-signal); padding: 0.2rem 0.7rem;
}
.etiquette > span {
  display: inline-block; transform: skewX(calc(var(--oblique) * -1));
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase;
}

/* Un mot d'un titre mis en exergue : italique en accent, souligné oblique. */
.exergue {
  position: relative; display: inline-block;
  color: var(--signal); font-style: italic;
}
.exergue::after {
  content: ""; position: absolute; left: -2%; right: -2%;
  bottom: 0.05em; height: 0.09em;
  background: var(--signal); transform: skewX(-14deg);
}
```

```html
<span class="tag"><span>Catégorie</span></span>
<p class="etiquette"><span>À la une</span></p>
<h1>Le volley, c'est <span class="exergue">ici</span></h1>
```

### Actions

**Le plein est réservé à l'action principale. Une seule par écran.**

```css
.btn {
  text-decoration: none;
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: 0.92rem; letter-spacing: 0.09em; text-transform: uppercase;
  padding: 0.75rem 1.35rem; display: inline-block;
  transform: skewX(var(--oblique));
  background: var(--signal); color: var(--sur-signal);
  border: 2px solid var(--signal); cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.btn > span { display: inline-block; transform: skewX(calc(var(--oblique) * -1)); }
.btn:hover { background: transparent; color: var(--signal); }

/* Action secondaire : le contour, jamais l'accent. */
.btn.ghost {
  background: transparent; color: var(--fg);
  border-color: rgba(255, 255, 255, 0.5);
}
.btn.ghost:hover { background: var(--fg); color: var(--noir); border-color: var(--fg); }

/* Lien de section, souligné en accent. « Tout voir », « Le calendrier ». */
.lien {
  text-decoration: none;
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: var(--s0); letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--signal); border-bottom: 2px solid var(--signal);
  padding-bottom: 0.15rem;
}
```

```html
<a class="btn" href="#"><span>Action principale</span></a>
<a class="btn ghost" href="#"><span>Action secondaire</span></a>
<a class="lien" href="#">Tout voir</a>
```

---

## 7. Les trois motifs récurrents

Ce sont eux qui font que toutes les pages se ressemblent.

### La grille d'aplats

Des blocs qui se touchent, séparés par un filet d'un pixel. **C'est le fond du
conteneur qui fait la séparation**, pas une bordure par bloc — donc jamais de
double trait entre voisins. Le nombre de colonnes s'adapte seul.

```css
.grille-aplats {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: 1px;
  background: var(--hair); border: 1px solid var(--hair);
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
}
.grille-aplats > * {
  background: var(--noir-2); padding: 1.15rem 1.25rem;
  display: grid; gap: 0.3rem; align-content: start; margin: 0;
}
.grille-aplats h3 { font-size: 1.4rem; }
.grille-aplats p { margin: 0; color: var(--fg-2); font-size: 0.93rem; }

/* Un bloc cliquable réagit sur son fond, pas sur son texte. */
.grille-aplats a { text-decoration: none; transition: background 0.12s, color 0.12s; }
.grille-aplats a:hover { background: var(--noir-3); }
.grille-aplats a:hover h3 { color: var(--signal); }
```

```html
<ul class="grille-aplats">
  <li><h3>Un bloc</h3><p>Son contenu.</p></li>
  <li><h3>Un autre</h3><p>Son contenu.</p></li>
</ul>
```

### La liste à rail de date

Date à gauche, contenu à droite, filets entre les lignes. Sert aux
calendriers, agendas, archives d'articles. Sous 780 px, la date repasse
au-dessus.

```css
.rail { list-style: none; margin: 0; padding: 0; display: grid; }
.rail > li { border-top: 1px solid var(--hair); }
.rail > li:last-child { border-bottom: 1px solid var(--hair); }
.rail > li > * {
  display: grid; gap: 0.35rem 1.75rem; padding: 1.3rem 0;
  text-decoration: none; align-items: baseline;
}
@media (min-width: 780px) {
  .rail > li > * { grid-template-columns: 11rem 1fr auto; }
}
.rail time {
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: var(--s0); letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--fg-2);
}
```

### La puce oblique

Une liste dont les puces reprennent le geste, au lieu d'un rond.

```css
.liste-obliques {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: 0.75rem; max-width: var(--texte);
}
.liste-obliques > li { position: relative; padding-left: 1.5rem; color: var(--fg-2); }
.liste-obliques > li::before {
  content: ""; position: absolute; left: 0; top: 0.62em;
  width: 8px; height: 3px;
  background: var(--signal); transform: skewX(-20deg);
}
.liste-obliques strong { color: var(--fg); font-weight: 600; }
```

---

## 8. Tableaux

Pas de quadrillage : un filet sous chaque ligne suffit. **Le conteneur
défile**, pour que la page ne parte jamais de travers sur téléphone.

```css
.tableau { overflow-x: auto; border: 1px solid var(--hair); }
.tableau table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.tableau caption {
  text-align: left; padding: 0.9rem 1.1rem;
  background: var(--noir-2); border-bottom: 1px solid var(--hair);
  font-family: "Barlow Semi Condensed", sans-serif;
  font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--fg-2);
}
.tableau th {
  text-align: left;
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: 0.7rem; letter-spacing: 0.13em; text-transform: uppercase;
  color: var(--fg-2); padding: 0.7rem 1.1rem;
  background: var(--noir-2); border-bottom: 1px solid var(--hair);
  white-space: nowrap;
}
.tableau td {
  padding: 0.72rem 1.1rem; border-bottom: 1px solid var(--hair);
  vertical-align: top; color: var(--fg-2);
}
.tableau tbody tr:last-child td { border-bottom: 0; }

/* Première colonne : le nom de la ligne, traité comme un titre. */
.tableau td.nom {
  color: var(--fg); font-family: "Barlow Condensed", sans-serif;
  font-weight: 800; font-size: 1.15rem; text-transform: uppercase;
}
/* Chiffres : alignés, en blanc, pour se détacher. */
.tableau td.chiffre {
  color: var(--fg); font-weight: 600;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
```

---

## 9. Formulaires

```css
.champ { display: grid; gap: 0.4rem; margin-bottom: 1.1rem; }
.champ label {
  font-family: "Barlow Semi Condensed", sans-serif; font-weight: 600;
  font-size: var(--s0); letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--fg-2);
}
.champ input, .champ select, .champ textarea {
  width: 100%; background: var(--noir-2); color: var(--fg);
  border: 1px solid var(--hair); padding: 0.7rem 0.8rem;
  font-family: inherit; font-size: var(--s1);
}
.champ input:focus, .champ select:focus, .champ textarea:focus {
  border-color: var(--signal);
}
.champ textarea { resize: vertical; }
```

---

## 10. Accessibilité

Ces points ne sont pas négociables : ils coûtent trois lignes et évitent
d'exclure des gens.

```css
/* Lien d'évitement, premier élément du <body> :
   <a class="skip" href="#contenu">Aller au contenu</a> */
.skip {
  position: absolute; left: -9999px; top: 0; z-index: 100;
  background: var(--signal); color: var(--sur-signal); padding: 0.7rem 1rem;
  font-family: "Barlow Semi Condensed", sans-serif;
  font-weight: 600; text-transform: uppercase;
}
.skip:focus { left: 0; }

/* Certaines personnes suppriment les animations dans leur système, souvent
   parce qu'elles leur donnent le vertige. On respecte ce réglage. */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
}

/* Un élément masqué par [hidden] doit le rester : une règle display:grid sur
   la même classe le neutraliserait silencieusement. */
[hidden] { display: none !important; }
```

### Contrastes mesurés sur la palette d'origine

| Couleur | Sur | Ratio | Niveau |
|---|---|---|---|
| `--fg` | `--noir` | 17,5:1 | AAA |
| `--fg-2` | `--noir` | 7,3:1 | AAA |
| `--fg-2` | `--noir-2` | 6,8:1 | AA |
| `--signal` | `--noir` | 13,1:1 | AAA |
| `--sur-signal` | `--signal` | 12,8:1 | AAA |

**Refaites ce calcul après avoir changé l'accent.** Le lime est exceptionnel
sur ce point ; beaucoup de couleurs vives ne le sont pas.

---

## 11. Les pièges

Appris en construisant le site d'origine.

- **Ne pas oublier le `<span>` intérieur** de `.btn`, `.tag` et `.etiquette`.
  Sans lui, le texte penche avec le bloc et devient laid.
- **Ne pas mettre l'accent sur du texte long.** Il est conçu pour des mots
  isolés en capitales. Un paragraphe en lime fatigue en trois lignes.
- **Ne pas ajouter une deuxième couleur d'accent.** C'est la tentation
  permanente, et c'est ce qui fait basculer la charte dans le générique. Si
  une distinction est nécessaire, jouez sur le blanc, le gris, ou le filet.
- **Ne pas nommer deux jetons « accent ».** Le projet d'origine avait
  `--accent` (blanc) et `--signal` (lime) : personne ne pouvait devenir
  lequel servait à quoi. Nommez chaque jeton par son **rôle**, pas par son
  apparence.
- **Ne pas remplir un cadre d'image vide** d'un dégradé sombre en attendant la
  vraie photo : sur fond sombre, ça se lit comme une image qui n'a pas chargé.
  Mieux vaut ne rien afficher, et laisser la typographie porter le bloc.
- **Ne pas basculer en menu mobile trop tôt.** Mesurez la largeur dont votre
  navigation a réellement besoin, plutôt que de reprendre un seuil par défaut.
  Sur le site d'origine, le seuil était à 1100 px pour un besoin réel de
  836 px : tout un écran 1024 px recevait un menu mobile sans raison.
- **Sur fond clair, l'accent vif disparaît.** C'est à ça que sert
  `--signal-clair`. Une section claire qui garde le lime est illisible.

---

## 12. Une section claire, si besoin

Pour une bande qui doit trancher — des logos de partenaires, par exemple.

```css
.bande-claire { background: var(--clair); color: var(--sur-clair); }
.bande-claire .eyebrow { color: var(--sur-clair-2); }
.bande-claire .lien {
  color: var(--signal-clair);
  border-bottom-color: var(--signal-clair);
}
.bande-claire .tableau,
.bande-claire .tableau th,
.bande-claire .tableau td { border-color: var(--clair-hair); }
```

---

## 13. Origine

Construit en septembre 2026 pour le site du Bourges Volley-Ball, avec Astro —
mais **rien ici ne dépend d'Astro** : ce sont des jetons CSS et des classes
ordinaires, utilisables avec n'importe quel outil, ou sans outil du tout.

Le fichier de référence du projet d'origine est `src/styles/global.css`.
