> **Document historique — ne décrit pas le site tel qu'il a été construit.**
>
> Ce cahier des charges est la note de cadrage rédigée avant la conception.
> Plusieurs partis pris ont changé en cours de route, après arbitrage :
> la direction artistique est passée du noir et blanc éditorial à un registre
> **sombre avec un accent vert lime**, le sélecteur d'âge a quitté l'accueil
> pour la page « Nous rejoindre », et le flux Instagram comme la galerie
> photo n'ont pas été réalisés. En revanche, une **boutique**, un **agenda**
> et une **récupération automatique du calendrier FFVolley** ont été ajoutés.
>
> **La documentation à jour est [GUIDE.md](GUIDE.md).** Ce fichier n'est
> conservé que pour garder trace des intentions de départ.

---

# Site web — Bourges Volley Ball

## Objectif
Site vitrine + actualités du club, mis à jour par des bénévoles non-techniciens,
sans coût récurrent hors nom de domaine.

## Stack
- **Astro** (générateur de site statique) — HTML pur en sortie, chargement instantané, SEO natif.
- **Decap CMS** — interface d'admin web sur `/admin`, login par mail, éditeur WYSIWYG, upload photos.
- **Netlify** — hébergement gratuit, HTTPS auto, déploiement à chaque modif du CMS.
- **HelloAsso** — adhésions et paiement CB (gratuit pour les associations).
- Aucune base de données, aucun serveur à administrer, aucune mise à jour de sécurité.

## Identité visuelle
Le logo est **déjà entièrement noir et blanc** : badge circulaire, monogramme BVB
avec le V dominant, ballon, trame de filet. Le N&B n'est pas un compromis, c'est
l'identité du club. Trois motifs à réexploiter dans tout le site :
- le **cercle-badge** (pastilles de catégorie, photos détourées, boutons) ;
- la **trame du filet** (texture de fond, séparateurs, calque sur les photos) ;
- le **V** comme accent typographique (puces, chevrons, transitions).

Direction **éditoriale sportive** :
- Typo display condensée en très gros (titres façon affiche de match), texte en sans-serif neutre.
- Photos en noir et blanc fort contraste, cadrages serrés (mains, ballon, filet, célébration).
- Grille asymétrique, larges zones de vide, filets de séparation fins.
- Grain / trame légère pour éviter l'effet "template vide".
- Mode sombre automatique (inversion N&B), contrastes WCAG AA minimum.

## Veille — ce qu'on retient des autres clubs
Analyse de sites de clubs pros (rugby, basket, volley) et de guides de clubs amateurs.
Idées retenues, adaptées à un club associatif — aucune reprise telle quelle :

1. **Widget "Prochain match" avec compte à rebours** en haut de page. Repris, mais
   doublé d'un bloc "Prochain entraînement" : pour un club amateur, le créneau
   intéresse plus de monde que le match.
2. **Réponse en 10 secondes pour un futur licencié.** C'est le vrai différenciateur :
   un parent qui hésite entre deux clubs choisit celui dont l'info est lisible.
   → bloc "Rejoindre le BVB" avec sélecteur d'âge qui affiche immédiatement la catégorie,
   le créneau, le gymnase, le tarif et le bouton d'inscription. Aucun club amateur ne
   le fait proprement.
3. **Fil de brèves courtes** en plus des articles longs. Une brève = 2 lignes + un score.
   Tenable par des bénévoles, là où un blog d'articles s'essouffle en trois mois.
4. **Partenaires hiérarchisés par niveau** (principal / officiel / institutionnel).
   Rend la grille de sponsoring lisible et sert d'argument commercial pour en démarcher.
5. **Menu court et orienté besoin** (Jouer, Matchs, Le club, Actus) plutôt que
   l'arborescence institutionnelle habituelle.
6. **Flux Instagram intégré** au lieu de dupliquer la com : c'est souvent le vrai
   fil d'actu vivant du club.
7. **Photos HD du gymnase et des installations** — les parents veulent voir le lieu
   avant de venir.

**Anti-pattern à neutraliser :** le site fantôme dont la dernière actu date de mars.
La page d'accueil doit rester belle et utile même sans publication pendant trois mois :
les actus sont un bloc secondaire, jamais la colonne vertébrale de la home.

## Pages
1. **Accueil** — dans l'ordre : hero photo plein écran ; bloc **"Rejoindre le BVB"**
   (sélecteur d'âge → catégorie, créneau, gymnase, tarif, bouton inscription) ;
   prochain match avec compte à rebours + prochains créneaux ; fil de brèves et
   3 dernières actus ; flux Instagram ; bandeau partenaires hiérarchisé.
2. **Le club** — histoire, valeurs, projet sportif, bureau, créneaux et gymnases.
3. **Équipes** — une fiche par équipe (photo, catégorie, coachs, créneaux, effectif).
4. **Calendrier & résultats** — matchs à venir et passés, score, lieu, filtre par équipe.
5. **Actualités** — liste + article (image de une, texte riche, date, auteur).
6. **Nous rejoindre** — tarifs, procédure, pièces à fournir, PDF téléchargeables
   (fiche d'inscription, certificat médical), bouton HelloAsso.
7. **Galerie** — albums photo par saison / événement, lightbox.
8. **Partenaires** — logos, niveaux de partenariat, argumentaire + contact sponsoring.
9. **Contact** — formulaire (Netlify Forms), adresse du gymnase, carte, réseaux sociaux.

## Administration (ce que les bénévoles peuvent modifier seuls)
- Publier / modifier une actualité avec photos.
- Ajouter un match, saisir un score.
- Créer ou mettre à jour une fiche équipe.
- Ajouter un album photo.
- Ajouter un partenaire (logo + lien).
- Modifier les tarifs, les créneaux, les textes de présentation.

## Exigences transverses
- Mobile-first (l'essentiel du trafic d'un club vient du téléphone).
- SEO local : "volley Bourges", "club de volley Cher", données structurées SportsClub,
  sitemap, Open Graph pour un partage propre sur Facebook / Instagram.
- Accessibilité : navigation clavier, contrastes, textes alternatifs.
- RGPD : pas de tracking tiers par défaut, mention légale et politique de confidentialité.
- Performance cible : score Lighthouse > 95.

## À fournir
- [ ] Logo du club (SVG de préférence, sinon PNG haute résolution)
- [ ] Photos exploitables (équipes, matchs, gymnase)
- [ ] Textes : histoire du club, valeurs, palmarès
- [ ] Créneaux d'entraînement par équipe et gymnases
- [ ] Tarifs des licences et pièces à fournir
- [ ] Lien de la campagne HelloAsso
- [ ] Liens réseaux sociaux + mail de contact
