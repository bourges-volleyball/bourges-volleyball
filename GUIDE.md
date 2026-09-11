# Site du Bourges Volley-Ball

Site statique construit avec **Astro**, administré par les bénévoles via
**Decap CMS**, hébergé gratuitement sur **Netlify**.

Aucune base de données, aucun serveur à administrer, aucune mise à jour de
sécurité à suivre. Le coût annuel se limite au nom de domaine.

---

## 1. Mise en ligne (à faire une fois)

### Montrer le site avant de le lancer pour de bon

Deux façons, qui ne montrent pas la même chose.

**Pour faire voir les pages, sans rien installer.** Construisez le site avec
`npm run build`, puis déposez le dossier **`dist`** (2,4 Mo) sur
[app.netlify.com/drop](https://app.netlify.com/drop). En trente secondes vous
avez une adresse partageable. Les 21 pages, le sélecteur d'âge, le formulaire
de contact et les 44 matchs fonctionnent.

Deux limites : **l'administration ne marchera pas** — elle a besoin du dépôt
Git pour enregistrer — et le calendrier fédéral reste **figé** au jour de la
construction, puisque rien ne se reconstruit.

**Pour faire voir l'administration.** Soit le dépôt GitHub est créé (étapes
ci-dessous, tout fonctionne alors), soit — plus simple pour une réunion —
vous la montrez **depuis votre ordinateur** : `npm run admin` dans un terminal,
`npm run dev` dans un autre, et vous ouvrez `localhost:4321/admin/index.html`.
Pas de mot de passe, et les modifications sont réelles.

> **Le site est actuellement invisible pour Google, volontairement.** Voir la
> dernière étape du lancement, plus bas.



1. **Créer un dépôt GitHub** (vide, sans README) et y pousser ce dossier.
   L'historique local existe déjà, il ne reste qu'à le relier :

   ```bash
   git remote add origin https://github.com/VOTRE-COMPTE/bourges-volley.git
   git push -u origin main
   ```

2. Sur **Netlify** : *Add new site → Import an existing project*, choisir le
   dépôt. Netlify lit `netlify.toml` et trouve seul la commande de build.
3. Une fois le site en ligne, activer **Identity** :
   *Site configuration → Identity → Enable Identity*.
4. Dans *Identity → Registration*, choisir **Invite only**. Sans cela,
   n'importe qui pourrait créer un compte et modifier le site.
5. Dans *Identity → Services → Git Gateway*, cliquer **Enable Git Gateway**.
   C'est ce qui autorise le CMS à écrire dans le dépôt. **Voir l'encadré
   ci-dessous : ce service est déprécié.**
6. Inviter les bénévoles : *Identity → Invite users*. Ils reçoivent un mail,
   choisissent un mot de passe, et arrivent sur l'administration.

L'administration est ensuite accessible à l'adresse **votre-site.fr/admin/**.

### ⚠ Git Gateway est déprécié — à savoir dès maintenant

Netlify a placé **Git Gateway** en fin de vie. Concrètement, en septembre 2026 :

- le service **fonctionne toujours** et peut encore être activé ;
- Netlify corrigera les **failles de sécurité**, mais **plus les bugs** ;
- de nouvelles configurations ne sont officiellement « pas recommandées ».

**Pourquoi on l'utilise quand même.** C'est la seule solution qui permet aux
bénévoles de modifier le site **sans compte GitHub**. Les autres méthodes
d'identification de Decap passent par GitHub : il faudrait que chaque personne
du bureau crée un compte de développeur et reçoive un accès au dépôt. C'est
exactement ce que ce site cherchait à éviter.

**Le jour où ça cassera**, deux portes de sortie, sans refaire le site :

1. **DecapBridge** — service gratuit créé pour remplacer Git Gateway, conçu
   pour que les rédacteurs n'aient toujours pas besoin de compte GitHub.
   C'est la migration la plus directe : on change le bloc `backend` de
   `public/admin/config.yml`, rien d'autre.
2. **Backend GitHub** de Decap — aucune dépendance tierce, mais chaque
   bénévole doit avoir un compte GitHub.

Le contenu du site, lui, n'est pas concerné : il vit dans des fichiers Markdown
du dépôt. Changer de méthode d'identification ne touche pas une ligne de
contenu.

### 7. Rendre le site visible sur Google — la dernière étape

Tant que le contenu est provisoire, le site refuse les moteurs de recherche.
C'est délibéré : sans cela, Google enregistrerait les photos d'illustration et
les « Joueur 1 », et ces pages resteraient dans ses résultats bien après le
lancement.

**Le jour où le contenu est définitif**, deux gestes :

1. Dans `netlify.toml`, supprimer le bloc `X-Robots-Tag` signalé par un
   commentaire.
2. Dans `public/robots.txt`, remplacer le contenu par les quatre lignes
   conservées en commentaire dans le fichier.

Sans ces deux gestes, **le site ne sortira jamais dans Google**.

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

### Essayer l'administration avant la mise en ligne

L'interface fonctionne aussi sur un simple ordinateur, sans Netlify ni compte.
Dans **deux terminaux** :

```bash
npm run admin
```

```bash
npm run dev
```

Puis ouvrir **http://localhost:4321/admin/index.html**. Pas de mot de passe :
le bouton « Se connecter » suffit. Les modifications sont écrites directement
dans les fichiers du projet, comme le ferait un bénévole en ligne — pratique
pour se former, ou pour saisir beaucoup de contenu d'un coup.

C'est le réglage `local_backend` de `public/admin/config.yml`. Il ne s'active
que sur `localhost` : en ligne, c'est toujours Netlify Identity qui contrôle
l'accès.

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

La **présentation** est un texte libre affiché sur la fiche. Elle sert quand
un groupe ne tient pas dans les champs prévus — par exemple l'Ufolep, qui
aligne plusieurs équipes sous une seule fiche, avec deux tarifs différents.
Laissée vide, elle ne s'affiche pas.

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
`src/images/hero/hero-1.jpg`, `hero-2.jpg` et `hero-3.jpg`.

**Ce sont actuellement des photos libres de droits, à remplacer.**
Remplacez les fichiers en gardant les mêmes noms : format paysage,
1600 pixels de large minimum, des cadrages serrés sur l'action.

Le site les assombrit automatiquement pour que le texte reste lisible —
inutile de les retoucher, les gymnases sont toujours trop clairs et
le traitement s'en charge.

**Ne les compressez pas non plus.** Déposez la photo d'origine, en grand :
le site fabrique tout seul une version WebP allégée et plusieurs tailles,
et sert à chaque visiteur celle qui correspond à son écran. Une photo
réduite à la main avant d'être déposée ne peut plus être agrandie, et
s'affichera floue sur un grand écran.

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
Les deux jetons qui comptent y portent le nom de leur rôle : `--signal`
pour le vert lime, `--structure` pour le blanc.

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

> **Si une modification de style ne s'affiche pas**, ce n'est probablement pas
> votre code : le serveur de développement garde en cache la feuille de styles
> précédente. Arrêtez-le et relancez `npm run dev`. Le site construit, lui,
> est toujours à jour — `npm run build` fait foi.

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

### L'adresse du site est celle du gymnase — ne pas la « corriger »

Le site affiche **Gymnase Léo Lagrange, 33 rue du 1er Régiment d'Artillerie**.
Ce n'est pas une erreur, et c'est délibéré.

Le siège social de l'association — *20 rue Garibaldi*, celui qui figure sur
HelloAsso et dans les statuts — est **le domicile du président en exercice**.
Le publier reviendrait à mettre l'adresse personnelle d'un bénévole sur
Internet, et à devoir la changer à chaque élection du bureau.

Un jour, quelqu'un consultera les statuts ou le registre des associations et
voudra « remettre la bonne adresse ». C'est à éviter. L'adresse utile au
visiteur est celle où l'on joue.

Elle apparaît à trois endroits : le pied de page
(`src/components/Footer.astro`), la page Contact (`src/pages/contact.astro`)
et les données structurées lues par Google (`src/layouts/Base.astro`).

> **Point à trancher pour les mentions légales.** La loi impose d'y faire
> figurer le siège social. Beaucoup d'associations domiciliées chez un
> dirigeant utilisent une adresse de domiciliation — mairie, maison des
> associations, boîte postale. À voir avec le bureau avant de rédiger la page.

### À vérifier

- [ ] **Les seniors s'entraînent-ils ensemble ?** Le planning affiché sur
  Instagram ne dit que « Séniors FFVB » le lundi et le mercredi, sans
  distinguer les masculins des féminines. Les deux fiches portent donc les
  mêmes créneaux. À corriger si les groupes sont séparés.
- [ ] **L'âge minimum de la section loisir Ufolep**, fixé à 18 ans par
  prudence. On sait désormais que le club a une section Ufolep M18 à part,
  avec sa propre adhésion : le loisir semble bien réservé aux adultes, mais
  cela demande confirmation.

> **Le site ne contient plus aucun contenu inventé.** Les faux effectifs, les
> événements aux dates provisoires et les partenaires sans nom ont été retirés
> plutôt que laissés en place : mieux vaut une rubrique vide qu'une rubrique
> fausse. Les sections concernées disparaîtront simplement tant qu'elles ne
> sont pas remplies, et se réafficheront dès la première saisie.

### À fournir par le club

- [ ] Remplacer les trois photos du diaporama par des photos du club
- [ ] Remplacer les photos d'équipe et saisir les effectifs réels
- [ ] Renseigner les encadrants de chaque groupe (tous « À préciser »)
- [ ] Ajouter les vrais partenaires et leurs logos
- [ ] Ouvrir la prochaine commande groupée dans la rubrique Boutique — la
  dernière campagne HelloAsso (Joma, –20 % catalogue) date de 2024-2025
- [ ] Confirmer les dates du tournoi inter-entreprises, de l'AG et du stage
- [ ] Rédiger les mentions légales
- [ ] Prendre le nom de domaine et le brancher

### Pistes

- [ ] **Les écoles de sport n'apparaissent nulle part.** Le planning réserve
  deux créneaux au dispositif de la Ville : séniors en soft volley le mardi
  de 17h à 18h, jeunes le vendredi à la même heure. Une actualité en parle,
  mais ce n'est ni une équipe ni une rubrique.
- [ ] **La liste des équipes Ufolep engagées.** Le club en aligne plusieurs
  en départemental du Cher ; la fiche Ufolep décrit les deux sections mais ne
  les nomme pas, faute de la liste. À compléter dans le champ Présentation.
- [ ] Les **buvettes en ligne** HelloAsso (tournois, buvette virtuelle) ne sont
  pas mentionnées sur le site.

### Fait

- [x] Créneaux, gymnases et tarifs réels de la saison 2026-2027
- [x] Trois actualités réelles, tirées de l'Instagram et de HelloAsso
- [x] Page 404
- [x] Logos des partenaires institutionnels cliquables vers leur site

## 7. Sécurité : ce qui protège le site, et ce qui reste à surveiller

### Le seul verrou qui compte vraiment

Le CMS écrit dans le dépôt au nom de la personne connectée. **Toute personne
qui obtient un compte Identity peut donc modifier le site.** Il n'y a pas de
second niveau de permission.

Cela tient entièrement à un réglage : *Identity → Registration →*
**Invite only**. S'il est laissé sur *Open*, n'importe qui peut créer un compte
depuis Internet et publier sur le site du club.

> **À vérifier le jour de la mise en ligne, puis une fois par saison.**
> C'est le seul réglage dont dépend la sécurité du site.

Deuxième règle qui découle de la première : **retirer les accès des bénévoles
qui quittent le bureau** (*Identity → l'utilisateur → Delete*).

### Ce qui est déjà en place

- **Pas de base de données, pas de serveur.** Le site est un ensemble de
  fichiers. Il n'y a rien à pirater derrière, et aucune mise à jour de
  sécurité à suivre — contrairement à un WordPress.
- **Aucun mot de passe, aucune donnée de visiteur** n'est stocké par le site.
  Les paiements passent par HelloAsso, l'identification par Netlify.
- **Aucun traceur, aucun cookie publicitaire.** Pas de Google Analytics, pas de
  bouton de réseau social espion. C'est aussi ce qui évite d'avoir à afficher
  une bannière de consentement.
- **Le fichier de l'interface d'administration est verrouillé par une
  empreinte** (`integrity` dans `public/admin/index.html`). Il est servi par un
  hébergeur tiers ; si celui-ci renvoyait un jour un fichier modifié, le
  navigateur refuserait de l'exécuter. Sans cela, un fichier trafiqué hériterait
  du droit d'écrire dans tout le site.
- **En-têtes de sécurité** dans `netlify.toml` : pas de devinette de type de
  fichier, pas de fuite d'adresse vers les sites tiers, ni caméra ni micro ni
  position, et interdiction d'enfermer le site dans un cadre sur un autre
  domaine.
- **Le widget d'identification ne se charge plus pour les visiteurs.** Il ne
  s'active que si l'adresse contient un jeton d'invitation.

### Ce qui reste ouvert, en connaissance de cause

- **Pas de politique de contenu (CSP) complète.** Elle empêcherait
  l'administration de fonctionner. Le risque est faible : le site n'affiche
  aucune donnée saisie par un visiteur.
- **Le formulaire de contact n'est protégé que par un piège à robots.** Si le
  spam devient gênant, Netlify propose d'activer reCAPTCHA en un clic
  (*Forms → Settings → Spam filters*).
- **Un numéro de téléphone est publié** en pied de page et sur la page Contact.
  C'est un choix, pas un oubli — mais il change avec le bureau.

---

## 8. La récupération automatique FFVolley

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
