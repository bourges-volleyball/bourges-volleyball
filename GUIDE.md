# Site du Bourges Volley-Ball

Site statique construit avec **Astro**, administré par les bénévoles via
**Decap CMS**, hébergé gratuitement sur **Netlify**.

Aucune base de données, aucun serveur à administrer, aucune mise à jour de
sécurité à suivre. Le coût annuel se limite au nom de domaine.

---

## 1. Mise en ligne (à faire une fois)

1. **Créer un dépôt GitHub** (vide, sans README) et y pousser ce dossier.
   L'historique local existe déjà, il ne reste qu'à le relier :

   ```bash
   git remote add origin https://github.com/VOTRE-COMPTE/bourges-volley.git
   git push -u origin master
   ```

2. Sur **Netlify** : *Add new site → Import an existing project*, choisir le
   dépôt. Netlify lit `netlify.toml` et trouve seul la commande de build.
3. Une fois le site en ligne, activer **Identity** :
   *Site configuration → Identity → Enable Identity*.
4. Dans *Identity → Registration*, choisir **Invite only**. Sans cela,
   n'importe qui pourrait créer un compte et modifier le site.
5. Dans *Identity → Services → Git Gateway*, cliquer **Enable Git Gateway**.
   C'est ce qui autorise le CMS à écrire dans le dépôt.
6. Inviter les bénévoles : *Identity → Invite users*. Ils reçoivent un mail,
   choisissent un mot de passe, et arrivent sur l'administration.

L'administration est ensuite accessible à l'adresse **votre-site.fr/admin/**.

### Brancher le nom de domaine

Quand le domaine sera pris (OVH ou Gandi, environ 12 € par an) :
*Domain management → Add a domain* dans Netlify, puis suivre les instructions
de redirection DNS. Il faut aussi changer l'adresse dans **deux fichiers** :
`astro.config.mjs` (ligne `site:`) et `public/robots.txt`.

---

## 2. Pour les bénévoles : modifier le site

Tout se passe sur **votre-site.fr/admin/**. Se connecter avec le mail et le
mot de passe reçus par invitation.

Chaque enregistrement publie le site automatiquement. Comptez une à deux
minutes avant que la modification soit visible.

### Actualités
Publier un article : titre, date, résumé, photo de une, texte.
Le **résumé** est ce qui s'affiche sur la page d'accueil : deux lignes suffisent.
La case **Brouillon** permet de préparer un article sans le publier.

### Équipes
Une fiche par groupe, et **chaque équipe a sa propre page** sur le site. Les champs **Âge minimum** et **Âge maximum** sont
importants : ce sont eux qui font fonctionner le sélecteur d'âge de la page
« Nous rejoindre ». Mettez 99 comme âge maximum s'il n'y a pas de limite.

L'**ordre d'affichage** classe les équipes sur le site, du plus jeune au plus âgé.

La **photo d'équipe** sert deux fois : en fond de la carte sur la page Équipes,
et en tête de la fiche. Format paysage, 1600 px de large minimum. Le site
l'assombrit automatiquement pour que le texte reste lisible — comme les photos
du diaporama d'accueil.

L'**effectif** est facultatif. Rempli, il s'affiche sur la fiche de l'équipe
avec le numéro et le poste de chacun. Laissé vide, la section disparaît
simplement. Chez les jeunes, on peut ne mettre que les noms.

Les **rencontres de l'équipe** s'affichent toutes seules sur sa fiche, tirées
du calendrier fédéral. Rien à saisir.


### Matchs
**Les rencontres FFVolley arrivent toutes seules.** Le calendrier et les
résultats des quatre équipes engagées en ligue — seniors masculins, seniors
féminines, M18 filles, M18 garçons — sont récupérés automatiquement sur le
site de la fédération à chaque publication du site.

Vous n'avez donc à saisir ici **que les matchs Ufolep et les rencontres
amicales**, que la fédération ne publie pas.

Un match saisi à la main se crée **sans score**. Après la rencontre, on
remplit les sets gagnés : il bascule automatiquement des « rencontres à venir »
vers les « résultats ».

Le détail des sets s'écrit en toutes lettres, par exemple
`25-22 · 21-25 · 25-19 · 25-20`.

### Matchs FFVolley : comment ça marche

### Agenda
Tournois, assemblée générale, stages, repas du club. Tout ce qui n'est pas un
match de championnat. La page Agenda **fusionne automatiquement** ces
événements avec les matchs à venir, par ordre chronologique : vous n'avez
jamais à ressaisir un match ici.

Décochez « Afficher l'heure » pour un stage ou un week-end, où l'horaire n'a
pas de sens, et remplissez « Date de fin » si l'événement dure plusieurs jours.

### Boutique
Une fiche par **commande groupée**. Les deux dates d'ouverture et de fermeture
pilotent tout : entre les deux, la boutique s'affiche avec un décompte des
jours restants ; en dehors, elle bascule seule sur « aucune commande en cours »
et propose au visiteur d'être prévenu.

C'est volontaire : personne n'a à penser à fermer la boutique le soir de la
date limite. Indiquez le lien de la campagne HelloAsso dans le champ prévu,
et listez les tailles disponibles une par ligne.

### Partenaires
Trois niveaux : principal, officiel, institutionnel. Le partenaire principal
s'affiche en grand, seul sur sa ligne. Fournissez de préférence un logo sur
fond blanc ou transparent ; sans logo, le nom s'affiche en toutes lettres.

---

## 3. Les photos du diaporama d'accueil

Les trois photos qui défilent derrière le titre sont les fichiers
`public/images/hero/hero-1.jpg`, `hero-2.jpg` et `hero-3.jpg`.

**Ce sont actuellement des photos libres de droits, à remplacer.**
Remplacez les fichiers en gardant les mêmes noms : format paysage,
1600 pixels de large minimum, des cadrages serrés sur l'action.

Le site les assombrit automatiquement pour que le texte reste lisible —
inutile de les retoucher, les gymnases sont toujours trop clairs et
le traitement s'en charge.

---

## 4. La règle de couleur

Le site est sombre, en noir et blanc, avec **une seule couleur** : le vert
lime. Elle obéit à une règle, et c'est ce qui lui donne sa force :

> **Vert lime = ce sur quoi on agit, et ce qu'on gagne.**
> Blanc = structure et identité.

Concrètement : les boutons, les liens au survol, le mot « ici » du titre,
les flèches, le focus clavier, et les scores des victoires. Rien d'autre.
Sortir le vert ailleurs — sur les dates, les titres, les filets — le
transformerait en motif décoratif et il cesserait de signaler quoi que ce soit.

Les couleurs sont définies au même endroit, dans `src/styles/global.css`.

Le site est sombre de bout en bout, partenaires compris. Les logos des
entreprises étant dessinés pour du fond blanc, ils sont ramenés en blanc plein
sur la paroi de sponsors — ce qui rend l'ensemble homogène malgré des logos
d'origines très différentes. Les couleurs réelles de chaque logo reviennent
au survol.

Si une section claire devenait nécessaire un jour, la classe `.bande-claire`
et le jeton `--signal-clair` sont prêts : sur fond clair, le lime devient
illisible et doit basculer en vert foncé.

---

## 5. Travailler sur le code

```bash
npm install     # une fois
npm run dev     # serveur local sur http://localhost:4321
npm run build   # vérifie que tout compile avant de pousser
```

Structure :

| Dossier | Contenu |
|---|---|
| `src/pages/` | Une page du site par fichier |
| `src/components/` | Morceaux réutilisés (en-tête, hero, bande match…) |
| `src/content/` | Le contenu éditorial, en Markdown |
| `src/content.config.ts` | Le schéma des données |
| `src/lib/donnees.ts` | Tri et filtrage (ce qu'est un match « à venir ») |
| `src/styles/global.css` | Couleurs, typographies, composants communs |
| `public/admin/config.yml` | Configuration de l'interface d'administration |

Le projet est suivi par **git**. Après une modification du code, enregistrez-la :

```bash
git add -A
git commit -m "ce que vous avez changé"
git push            # une fois le dépôt GitHub relié
```

Chaque `push` déclenche une nouvelle publication sur Netlify. Les
modifications faites par les bénévoles depuis `/admin/` sont enregistrées
automatiquement, sans rien taper.

**Attention :** `src/content.config.ts` et `public/admin/config.yml` décrivent
les mêmes données. Un champ ajouté dans l'un doit l'être dans l'autre, sinon
les bénévoles saisiront une information que le site ignorera.

---

## 6. Ce qui reste à faire

- [ ] Remplacer les trois photos du diaporama par des photos du club
- [ ] Compléter les gymnases, les créneaux réels et les noms des encadrants
- [ ] Remplacer les photos d'équipe et saisir les effectifs réels
- [ ] Vérifier les tarifs de licence de la saison
- [ ] **Confirmer l'âge minimum de la section loisir Ufolep** — fixé à 18 ans
  par prudence, mais l'Ufolep accepte les mineurs et ses compétitions seniors
  s'ouvrent à 16 ans. À corriger dans la fiche de l'équipe si besoin.
- [ ] Saisir le calendrier réel des matchs
- [ ] Ajouter les vrais partenaires et leurs logos
- [ ] Vérifier l'adresse et le téléphone du pied de page
- [ ] Ajouter le lien de paiement en ligne sur la page « Nous rejoindre »
- [ ] Ouvrir la prochaine commande groupée dans la rubrique Boutique
- [ ] Confirmer les dates du tournoi inter-entreprises, de l'AG et du stage
- [ ] Rédiger les mentions légales
- [ ] Prendre le nom de domaine et le brancher

---

## 7. La récupération automatique FFVolley

Le script `scripts/ffvb.mjs` lit les pages de calendrier de la fédération et
écrit le résultat dans `src/data/ffvb.json`, que le site utilise ensuite.

```bash
npm run maj:ffvb    # met à jour le calendrier et les résultats
```

Sur Netlify, il tourne automatiquement avant chaque construction du site :
la commande de build est `npm run maj:ffvb && npm run build`.

### Les quatre poules suivies

| Équipe | Poule |
|---|---|
| Seniors masculins | PNM — prénationale |
| Seniors féminines | RFS — régionale |
| M18 filles | 18A — régionale |
| M18 garçons | 18M — prénationale |

Elles sont déclarées en haut de `scripts/ffvb.mjs`, avec le code de ligue
`LICE` (Centre-Val de Loire). **À chaque changement de saison**, mettez à jour
la constante `SAISON` et vérifiez les codes de poule, qui changent quand une
équipe monte ou descend.

### Ce que le script fait, et ne fait pas

Il ne retient que les rencontres où figure Bourges Volley-Ball, écarte les journées où le club est **exempt** — la fédération les note
« xxxxx » — et convertit les horaires en heure de Paris.

**Il n'échoue jamais bruyamment.** Si la fédération est injoignable ou change
la structure de ses pages, le script conserve le fichier précédent et le site
continue de fonctionner avec les dernières données connues. C'est volontaire :
un calendrier de la veille vaut mieux qu'une page vide.

En contrepartie, il faut le savoir : **la FFVolley ne publie aucune API**.
Ce script lit du HTML. Une refonte de leur site le cassera un jour, et il
faudra reprendre l'analyse. Le champ `miseAJour` dans `src/data/ffvb.json`
indique la dernière récupération réussie — c'est là qu'on voit qu'il a décroché.

### Ufolep

Il n'existe pas d'équivalent. Chaque comité départemental publie ses résultats
à sa manière, souvent en PDF. Les rencontres Ufolep se saisissent donc à la
main dans la rubrique Matchs.

### Programmer une mise à jour quotidienne

Dans Netlify : *Site configuration → Build & deploy → Build hooks*, créer un
hook, puis le déclencher chaque nuit depuis n'importe quel service de tâches
planifiées gratuit. Sans cela, les résultats ne se rafraîchissent qu'au moment
où un bénévole publie quelque chose.
