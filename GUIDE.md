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



1. **Créer une organisation GitHub au nom du club**, puis le dépôt dedans.

   > **Ne mettez pas le dépôt dans un compte personnel.** Le site
   > appartiendrait alors à la personne, pas au club : le jour où elle
   > s'éloigne du bureau, le dépôt part avec elle. C'est le même
   > raisonnement que pour l'adresse du siège.
   >
   > Une organisation est **gratuite** : *github.com → votre photo → Your
   > organizations → New organization → offre Free*. Nommez-la par exemple
   > `bourges-volleyball`, puis **ajoutez un second propriétaire** (le
   > président, ou un autre bénévole technique) dans *People → Owners*.
   > Deux propriétaires, c'est ce qui évite de perdre l'accès le jour où
   > l'un des deux n'est plus joignable.

   Créez ensuite le dépôt **dans l'organisation**, vide, sans README, et
   poussez ce dossier. L'historique local existe déjà, il ne reste qu'à le
   relier :

   ```bash
   git remote add origin https://github.com/bourges-volleyball/bourges-volleyball.git
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

L'administration est ensuite accessible à l'adresse **www.bourges-volleyball.fr/admin/**.

### ⚠ Git Gateway est déprécié — à savoir dès maintenant

Netlify a placé **Git Gateway** en fin de vie. Concrètement, en septembre 2026 :

- le service **fonctionne toujours** et peut encore être activé ;
- Netlify corrigera les **failles de sécurité**, mais **plus les bugs** ;
- de nouvelles configurations ne sont officiellement « pas recommandées ».

**Vérifié le 29 octobre 2026.** La documentation de Netlify (page Git Gateway,
mise à jour le 17 septembre 2026) le marque toujours **deprecated**, dans les
termes ci-dessus. Seul **Netlify Identity**, la connexion des bénévoles, a été
sauvé : le 19 février 2026, Netlify est revenu sur son abandon et le garde
comme service pris en charge. Git Gateway, qui enregistre les modifications
dans le dépôt, n'est pas concerné par ce revirement.

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

1. Dans `public/_headers`, supprimer la ligne `X-Robots-Tag`.
2. Dans `public/robots.txt`, remplacer le contenu par les quatre lignes
   conservées en commentaire dans le fichier.

Sans ces deux gestes, **le site ne sortira jamais dans Google**.

### Brancher le nom de domaine

Le domaine **bourges-volleyball.fr** a été commandé chez OVH le 28 octobre
2026. Le site est déjà réglé dessus : `public/admin/config.yml` (ligne
`site_url:`) et la ligne Sitemap gardée en commentaire dans
`public/robots.txt`. `astro.config.mjs` (ligne `site:`), lui, prend l'adresse
principale que Netlify donne à chaque construction : la bonne adresse, avant
comme après le branchement, sans rien modifier. L'adresse principale est
**www.bourges-volleyball.fr** ; la version sans www y renvoie. C'est le choix
que conseille Netlify : l'adresse avec www passe par son réseau de serveurs,
la version sans www par une seule adresse IP, qui peut changer.

Une fois le domaine livré par OVH (après le paiement de la commande) :

1. **Netlify** : *Domain management → Add a domain*, saisir
   `www.bourges-volleyball.fr`. Netlify propose d'ajouter aussi
   `bourges-volleyball.fr` : accepter. Vérifier que `www.bourges-volleyball.fr`
   porte la mention *Primary domain*, sinon *Options → Set as primary domain*.
2. **OVH** : *Web Cloud → Noms de domaine → bourges-volleyball.fr*, onglet
   *Zone DNS* :
   - l'entrée **A** du domaine (sous-domaine vide) : cible `75.2.60.5` ;
   - supprimer les entrées **AAAA** du domaine et de www s'il y en a (Netlify
     ne répond pas en IPv6 à cette adresse), et l'entrée existante de `www` ;
   - ajouter une entrée **CNAME** : sous-domaine `www`, cible
     `bourges-volleyball.netlify.app.`, **avec le point final** (sans lui,
     OVH colle le nom du domaine derrière) ;
   - ne pas toucher aux entrées MX et TXT : ce sont celles du mail.
3. **Attendre** : de quelques minutes à 24 h, 48 h au plus. Netlify crée
   ensuite tout seul le certificat HTTPS (*Domain management → HTTPS*).
4. **HelloAsso** : changer l'adresse de notification (voir « Brancher le
   paiement de la boutique », partie 6).
5. **Reconstruire** le site : *Deploys → Trigger deploy* dans Netlify, ou
   n'importe quelle publication depuis l'administration. Les liens de partage,
   l'adresse canonique des pages et le plan du site prennent la nouvelle
   adresse ; bourges-volleyball.netlify.app renvoie déjà toute seule vers
   www.bourges-volleyball.fr. Les bénévoles se reconnectent une fois à
   l'administration, à la nouvelle adresse.

---

## 2. Pour les bénévoles : modifier le site

Tout se passe sur **www.bourges-volleyball.fr/admin/**, que le bouton **Admin** du haut
du site ouvre directement (dans le menu sur téléphone). Se connecter avec le
mail et le mot de passe reçus par invitation. Si l'administration affiche
« Git Gateway Error: [object Object] », c'est une ancienne connexion restée
en cache : se reconnecter dans une fenêtre de navigation privée.

**Les bénévoles n'ont pas de compte GitHub et n'en auront jamais besoin.**
Ils s'identifient avec un mail et un mot de passe ; c'est Git Gateway qui
écrit dans le dépôt à leur place. GitHub ne concerne que la personne qui a
mis le site en ligne.

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

Puis ouvrir **http://localhost:4321/admin/index.html** — avec `index.html` :
sur l'ordinateur, l'adresse courte `/admin/` mène à la page 404 (en ligne, elle
fonctionne). Pas de mot de passe :
le bouton « Se connecter » suffit. Les modifications sont écrites directement
dans les fichiers du projet, comme le ferait un bénévole en ligne — pratique
pour se former, ou pour saisir beaucoup de contenu d'un coup.

C'est le réglage `local_backend` de `public/admin/config.yml`. Il ne s'active
que sur `localhost` : en ligne, c'est toujours Netlify Identity qui contrôle
l'accès.

La page des commandes de la boutique s'essaie aussi :
**http://localhost:4321/admin/commandes.html** montre alors des **commandes
d'exemple**, signalées comme telles. Les vraies n'existent qu'en ligne, où
tournent la connexion et les fonctions Netlify.

### Actualités
Publier un article : titre, date, résumé, photo de une, autres photos, texte.
Les **autres photos** (12 au plus) s'affichent en grille sous le texte et
s'ouvrent en grand d'un clic, comme dans un album : c'est le format des
résultats du week-end, avec les photos des équipes. Sans photo de une, la
première sert de vignette. Une photo de groupe se met plutôt là qu'en photo
de une : la une est recadrée en bandeau large, qui couperait les têtes.
Le **résumé** s'affiche sous le titre, sur la page Actualités et en tête de l'article : deux lignes suffisent. L'accueil, lui, ne montre que la date et le titre des trois derniers articles, dans le panneau « À la une ».
La case **Brouillon** permet de préparer un article sans le publier.

### Textes des pages
Trois fiches, que l'on modifie mais que l'on ne peut pas supprimer :

- **Accueil : texte du haut** — le bandeau, le grand titre (le dernier mot
  s'affiche en vert), la phrase en gras et le texte qui la suit. Gardez le
  titre court : il s'affiche en très grand.
- **Le club : histoire et palmarès** — la présentation, les chiffres clés,
  les étapes de l'histoire et les titres. Chaque liste se complète avec
  « Ajouter », et se réordonne en faisant glisser les éléments.
- **Écoles de sport de la Ville** — les créneaux du dispositif « Faites du
  sport à Bourges » qui se déroulent avec le club (soft volley seniors le
  mardi, jeunes le vendredi). Ils s'affichent sur la page Nous rejoindre ;
  sans créneau, la rubrique disparaît.

### Équipes
Une fiche par groupe, et **chaque équipe a sa propre page** sur le site. Les champs **Âge minimum** et **Âge maximum** sont
importants : ce sont eux qui font fonctionner le sélecteur d'âge de la page
« Nous rejoindre ». Mettez 99 comme âge maximum s'il n'y a pas de limite.

L'**ordre d'affichage** classe les équipes sur le site, du plus jeune au plus âgé.

Le **nom de l'équipe** range aussi ses matchs : une fiche affiche les rencontres
dont l'équipe porte exactement le même nom, qu'elles viennent de FFVolley
(*Réglages > Matchs FFVolley*) ou de la rubrique Matchs. « M18 filles » sur la
fiche et « M18 filles » dans les réglages : les matchs s'affichent ; « M18
Filles » d'un côté seulement : la fiche reste sans matchs.

Les jeunes ont une fiche par catégorie et par sexe depuis le 30 octobre 2026
(M13, M15 et M18, garçons et filles). Des groupes qui s'entraînent ensemble
gardent chacun leurs créneaux : le Planning les réunit sur une même ligne.

La **photo d'équipe** sert deux fois. En tête de la fiche, elle s'affiche à
côté du titre et des infos (entraînements, gymnase, tarif), sans être
assombrie : une photo de groupe presque carrée est seulement recadrée en 4:3,
en perdant un peu de plafond et de sol, jamais les joueurs ; une photo plus
large reste entière. Sur la page Équipes, elle sert de fond assombri à la carte
de l'équipe, recadrée vers le haut pour garder les visages. Une photo de groupe
en largeur, 1600 px minimum, convient le mieux.

La **présentation** est un texte libre affiché sur la fiche. Elle sert quand
un groupe ne tient pas dans les champs prévus — par exemple l'Ufolep, qui
aligne plusieurs équipes sous une seule fiche, avec deux tarifs différents.
Laissée vide, elle ne s'affiche pas.

L'**effectif** est facultatif. Rempli, il s'affiche sur la fiche de l'équipe
avec le numéro et le poste de chacun. Laissé vide, la section disparaît
simplement. Chez les jeunes, on peut ne mettre que les noms.

Les **rencontres de l'équipe** s'affichent toutes seules sur sa fiche, tirées
du calendrier fédéral. Rien à saisir.

Les **créneaux d'entraînement** alimentent aussi la page **Planning**, qui
montre toute la semaine du club, jour par jour, avec les écoles de sport de
la Ville (*Textes des pages*). Le **jour** se choisit dans une liste, pour que
le planning range chaque créneau au bon endroit ; les créneaux d'un jour s'y
classent par heure de début, lue dans l'**horaire** (« 20h00 – 22h00 »). Des
équipes qui s'entraînent ensemble, même jour, même horaire, même gymnase,
partagent une ligne. **Gymnase ce jour-là** ne sert que si un créneau n'a pas
lieu dans le gymnase de l'équipe (l'Ufolep, entre Léo Lagrange et Yves du
Manoir).


### Matchs
**Les rencontres FFVolley arrivent toutes seules.** Le calendrier et les
résultats des quatre équipes engagées en ligue — seniors masculins, seniors
féminines, M18 filles, M18 garçons — sont récupérés automatiquement sur le
site de la fédération **chaque lundi matin**, et à chaque publication du site.

**Le prochain match avance tout seul.** Toutes les rencontres de la saison
sont dans les pages : au moment de la visite, celles qui sont passées
(deux heures après le coup d'envoi) disparaissent de « Prochaine réception »,
des listes « À venir » et de l'agenda, sans attendre une publication.

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
Une fiche par **vente**, comme un formulaire HelloAsso : la boutique textile,
une adhésion, un stage, un tournoi, une buvette. Le visiteur choisit, remplit
et paie sans quitter le site ; seul le paiement par carte passe par HelloAsso.

- **Rayon** : Équipements, Adhésions, Stages, Tournois ou Buvette.
- **Articles ou tarifs** : un par prix. Chacun peut avoir une photo (qui s'ouvre en grand d'un clic), une liste
  de **tailles** (demandée pour chaque article commandé) et un **nombre de
  places** (le site affiche les places restantes et ferme l'article une fois
  complet).
- **Stage à la journée** : un seul article, dont le prix est celui d'une
  journée. Dans **Jours du stage**, ajoutez chaque jour avec sa date : chaque
  participant coche les jours où il vient. Les réservations s'arrêtent pour
  tout le stage au « Dernier jour pour commander », à fixer avant le premier
  jour. Le **nombre de places** est alors celui d'une journée : le site compte
  les places jour par jour et ferme un jour complet. Les **options** (repas du
  midi…) sont des cases à cocher par participant ; **Comptée chaque jour** fait
  payer un repas par jour coché, **Seulement le** réserve une sortie à un jour
  précis (le laser game du mercredi ne se coche qu'avec le mercredi), et
  **Offerte à partir de** (5) la rend gratuite aux inscrits de la semaine.
  Inutile de créer un article « 1 jour », « 2 jours », « 1 repas »…
- **Demander le nom de chaque participant** : à cocher pour une adhésion, un
  stage, un tournoi. On peut ajouter des **questions** (texte ou oui/non),
  posées pour chaque participant.
- **Dates** : facultatives. Le soir du « dernier jour pour commander », la vente
  se ferme toute seule. Sans date, elle reste ouverte (buvette).

**Une vente terminée** disparaît de la boutique (sa page affiche « Cette vente
est fermée ») mais reste dans l'administration, avec ses commandes.

- **Rouvrir la même vente** (prolonger de quelques jours, rouvrir après une
  erreur) : changer ses dates et publier.
- **Une nouvelle édition** (le tournoi de l'an prochain, le stage des vacances
  suivantes) : ouvrir l'ancienne fiche, **Dupliquer** dans le menu du bouton
  « Publiée » en haut, puis **changer le nom** et les dates. Le nom fait
  l'adresse de la page : deux ventes ne peuvent pas porter le même. La copie
  repart avec ses places au complet et ses propres commandes. Rouvrir
  l'ancienne fiche à la place fausserait les places : le site compte toutes
  les commandes payées d'une fiche, gardées un an.

**Mettre toute la boutique en pause** : *Réglages → Boutique : ouverte ou en
pause*, éteindre l'interrupteur **Boutique ouverte**, publier. La boutique sort du menu et du
pied de page, ses pages annoncent son ouverture prochaine (les liens des
actus et de l'agenda y mènent toujours), et le serveur refuse toute commande :
le catalogue qu'il lit est vide. Le champ **En attendant** donne la page
HelloAsso du club : un bouton « Aller sur HelloAsso » y envoie les visiteurs,
comme le bouton « S'inscrire » de la page Nous rejoindre. Les ventes ne
bougent pas : on rallume l'interrupteur, on publie, tout revient.

**Le montant est toujours recalculé par le serveur** à partir de la fiche :
modifier un prix dans l'administration s'applique dès la publication suivante.

### Commandes payées
Elles se consultent avec le bouton **Commandes**, en haut de l'administration
(ou sur **/admin/commandes.html**), avec le même compte que
l'administration. Pour chaque vente :
- le **résumé** des quantités, taille par taille : c'est la commande groupée à
  passer chez l'équipementier ;
- la liste des commandes, avec une case **Remis** à cocher à la livraison, ou à
  l'arrivée au stage ;
- un bouton **Exporter (Excel)** : une ligne par article, avec les tailles, les
  participants et leurs réponses.

Pour un stage, le résumé donne le nombre d'enfants **chaque jour**, et le
nombre de repas et de sorties.

Un remboursement se fait dans l'espace HelloAsso du club, rubrique
*Suivi des paiements* : toutes les ventes du site y apparaissent sous le nom
« Checkout ».

#### Être prévenu par mail à chaque commande payée (une fois)

À chaque commande payée, le site peut envoyer au club un mail court : la
vente, le montant, le numéro de commande et un lien vers la page Commandes.
Ni le nom ni l'adresse de l'acheteur n'y figurent. Il passe par les
formulaires Netlify, comme le formulaire de contact. Pour l'activer :

1. Netlify, *Site configuration → Environment variables* :
   `ALERTE_COMMANDES` = `oui`.
2. *Forms* : après la publication suivante, un formulaire
   **commande-payee** apparaît. *Form notifications → Add notification →
   Email notification*, formulaire **commande-payee**, et l'adresse du club.
3. Faire un achat test (le sirop à 1 €) : le mail doit arriver.

> **Sans effet sur le budget.** Avec les offres à crédits de Netlify, les
> envois de formulaire sont gratuits (documentation de Netlify relue le
> 29 octobre 2026). Sans la variable, rien n'est envoyé.

### Galerie
Un **album** par événement : un titre, une date, quelques mots si l'on veut,
et ses photos (chacune peut avoir une légende). La première photo sert de
couverture. Les albums s'affichent sur la page **/galerie/**, le plus récent
en premier, et chaque photo s'ouvre en grand d'un clic. Le bouton **Lancer
le diaporama** d'un album fait défiler ses photos seules, quatre secondes
chacune, en plein écran quand le navigateur le permet (pas sur iPhone) :
pratique sur un écran à la buvette ou en soirée. Le dernier album
apparaît aussi sur l'accueil, en bloc « Dernières photos » : ses cinq
premières photos (ou trois, s'il en a moins de cinq), dans l'ordre de
l'album. Mettre les plus belles en tête. Le lien « Galerie » du menu, le
bloc de l'accueil et le lien du pied de page n'apparaissent qu'à partir du
premier album.

Comme pour le diaporama : des photos d'origine, et l'accord des personnes
photographiées — des parents pour un enfant.

**Ce que pèse une galerie.** Chaque photo est rangée **en entier dans le dépôt
GitHub**, puis convertie par le site en petites versions (vignette, grand
format) à chaque publication ; les visiteurs ne téléchargent que ces versions
allégées (quelques centaines de Ko). Les limites à surveiller sont donc :

- **le dépôt GitHub**, qui devrait rester sous 1 Go (fin octobre 2026,
  après la reprise des albums de Clubeo : environ 120 Mo). Un album de
  30 photos de téléphone en ajoute 60 à 150 Mo ;
- **les crédits Netlify** : la bande passante des visiteurs s'y ajoute aux
  publications. À regarder dans *Usage* sur Netlify après les premiers
  albums ;
- **la durée de construction**, qui s'allonge avec le nombre de photos :
  un peu plus d'une minute pour les quelque 500 photos de fin octobre 2026,
  quand Netlify n'a rien en cache ; bien moins ensuite, les photos déjà
  converties étant gardées d'une publication à l'autre.

D'où deux garde-fous dans l'administration : **6 Mo au plus par photo**
(au-delà, l'envoi est refusé) et **40 photos par album**. Mieux vaut
choisir les 20 ou 30 meilleures d'un événement que tout verser.

### Partenaires
Trois niveaux : principal, officiel, institutionnel. Le partenaire principal
s'affiche en grand, seul sur sa ligne. Fournissez de préférence un logo sur
fond blanc ou transparent ; sans logo, le nom s'affiche en toutes lettres.

---

## 3. Les photos du diaporama d'accueil

Les photos qui défilent derrière le titre se gèrent dans l'administration,
rubrique **Photos de l'accueil** : ajouter, supprimer, et régler l'ordre
de passage avec le champ « Ordre ». Trois à cinq photos, format paysage,
1600 pixels de large minimum, des cadrages serrés sur l'action.

**L'aperçu, à droite du formulaire, montre la photo telle qu'elle apparaîtra**,
sur ordinateur et sur téléphone, avec le titre par-dessus. Deux réglages :

- **Cadrage** : la partie de la photo à garder quand l'écran la recoupe
  (centre, haut pour garder les têtes, bas, gauche, droite, coins).
  L'ordinateur coupe le haut et le bas, le téléphone les côtés : vérifier
  les deux vignettes.
- **Luminosité** : plus claire pour une photo de gymnase sombre, plus sombre
  si le titre se lit mal.

L'aperçu affiche aussi **un avertissement si la photo est trop petite** ou
prise en hauteur. (Sur téléphone, l'administration masque l'aperçu : faire ce
réglage sur un ordinateur.)

**Ne passez pas les photos par WhatsApp ou Messenger.** Ils les réduisent à
1600 pixels au plus et les recompressent : sur un écran large, la photo est
alors étirée et paraît floue. C'est le cas des trois photos déposées le
28 octobre (960 à 1500 pixels de large). Déposez le fichier d'origine, sorti
du téléphone ou de l'appareil (par câble, Google Photos, mail en « taille
réelle ») : le site fabrique tout seul une version allégée et plusieurs
tailles, et sert à chaque visiteur celle qui correspond à son écran.

Le site assombrit légèrement les photos pour que le texte reste lisible :
inutile de les retoucher.

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

**N'écrivez jamais `<script is:inline>`.** Astro ne calcule l'empreinte CSP
que des scripts qu'il traite lui-même : un script `is:inline` serait bloqué
en ligne sans message visible. Même chose pour les attributs `style="..."`
écrits dans du HTML généré par JavaScript : passez par une classe CSS.

**Les images se rangent dans `src/images/<rubrique>`**, jamais dans
`public/` : seules les premières sont converties en WebP et déclinées en
plusieurs tailles. L'administration y range déjà les photos des actualités,
du diaporama, des équipes, des partenaires et de la boutique. Dans les pages,
on les affiche avec le composant `<Image>` d'`astro:assets`.

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

> **Point à trancher pour les mentions légales.** La page existe
> (`src/pages/mentions-legales.astro`) et affiche pour l'instant l'adresse du
> gymnase. La loi demande en principe le siège social. Beaucoup d'associations
> domiciliées chez un dirigeant utilisent une adresse de domiciliation —
> mairie, maison des associations, boîte postale. À voir avec le bureau, puis
> à reporter dans cette page.

### À vérifier

- [ ] **Les seniors s'entraînent-ils ensemble ?** Le planning affiché sur
  Instagram ne dit que « Séniors FFVB » le lundi et le mercredi, sans
  distinguer les masculins des féminines. Les deux fiches portent donc les
  mêmes créneaux. À corriger si les groupes sont séparés.
- [ ] **Les fiches jeunes garçons et filles** (séparées le 30 octobre 2026)
  reprennent les créneaux, la photo et le niveau de l'ancienne fiche
  commune. Seul le niveau des M18 est sûr (poules FFVolley : prénationale
  garçons, régionale filles). À corriger dans *Équipes* si les M13 ou les M15
  ne jouent pas au niveau indiqué, ou si garçons et filles ne s'entraînent pas
  aux mêmes heures.
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

- [ ] Redéposer les photos du diaporama **en version d'origine** : celles du
  28 octobre sont passées par WhatsApp (960 à 1500 px) et paraissent floues
- [x] Brancher la mise à jour du lundi (`BUILD_HOOK_URL`, section 8) : hook
  et variable créés le 29 octobre 2026, actifs à partir de la publication
  suivante
- [ ] Remplacer les photos des articles de la boutique : celles reprises de
  HelloAsso ne font que 300 px, et s'agrandissent d'un clic
- [ ] Remplacer les photos d'équipe et saisir les effectifs réels
- [ ] Renseigner les encadrants de chaque groupe (tous « À préciser »)
- [ ] Ajouter les vrais partenaires et leurs logos
- [ ] **Brancher le paiement de la boutique** (voir ci-dessous) : clé API
  testée le 29 octobre 2026 ; reste l'achat réel à 1 € après le branchement
  du domaine, puis la rouvrir : elle est en pause
- [ ] Donner une date au tournoi Octobre rose dans la boutique (sans date, la
  vente reste ouverte)
- [ ] Confirmer les dates du tournoi inter-entreprises, de l'AG et du stage
- [ ] Saisir les événements de la saison dans l'**Agenda** : la page, dans le
  menu, est vide (choix de l'audit : la laisser, le club va la remplir)
- [x] Prendre le nom de domaine : bourges-volleyball.fr, chez OVH
- [ ] Le brancher (section 1, « Brancher le nom de domaine »)

### Pistes

- [ ] **La liste des équipes Ufolep engagées.** Le club en aligne plusieurs
  en départemental du Cher ; la fiche Ufolep décrit les deux sections mais ne
  les nomme pas, faute de la liste. À compléter dans le champ Présentation.
- [ ] La buvette du tournoi inter-entreprises (close sur HelloAsso) n'a pas été
  reprise : dupliquer la buvette du club dans la boutique le moment venu.

### Brancher le paiement de la boutique (une fois)

Vérifié le 28 octobre 2026 : l'association est **vérifiée** sur HelloAsso,
condition pour encaisser par le site. Trois gestes, dans l'ordre (la clé API
a été créée et donnée à Netlify le 29 octobre 2026) :

1. **Créer la clé API** — espace HelloAsso du club, *Mon compte →
   Intégrations et API → Générer ma clé API*. Elle donne un identifiant
   (*client id*) et un secret (*client secret*). Le secret ne s'affiche
   qu'une fois : le copier directement à l'étape 2, ne l'envoyer à personne.
2. **La donner au site** — Netlify, *Site configuration → Environment
   variables* : `HELLOASSO_CLIENT_ID` et `HELLOASSO_CLIENT_SECRET`, puis
   *Deploys → Trigger deploy*.
3. **Renseigner l'adresse de notification** — même page HelloAsso, champ
   *Mon URL de callback* :
   `https://www.bourges-volleyball.fr/.netlify/functions/paiement`, avec www
   (tant que le domaine n'est pas branché :
   `https://bourges-volleyball.netlify.app/.netlify/functions/paiement`).
   C'est elle qui marque une commande payée même si l'acheteur ferme son
   navigateur avant de revenir sur le site.

**Vérifier sans payer** : page Commandes de l'administration, bouton **Tester
HelloAsso** (`netlify/functions/essai-helloasso.mjs`). Le site demande un jeton
avec la clé, lit la fiche de l'association, puis prépare un paiement d'essai de
1 € : son lien ouvre la vraie page de paiement HelloAsso, qu'on ferme sans
payer. Aucune commande n'est enregistrée, la boutique peut rester en pause.
Ce test ne couvre ni le paiement lui-même ni la notification (étape 3).
**Fait le 29 octobre 2026 : test réussi**, clé acceptée et page de paiement
HelloAsso du club affichée. Reste l'achat réel à 1 €, une fois le domaine
branché et la boutique rouverte.

Ensuite, **rouvrir la boutique** (elle est en pause depuis le 29 octobre 2026,
voir « Boutique » partie 2) et **faire aussitôt un achat réel à 1 €** (un sirop
à la buvette) pour vérifier toute la chaîne, puis le rembourser depuis
HelloAsso. Si quelque chose cloche, la remettre en pause le temps de corriger.

Enfin, **passer en privé ou clôturer les formulaires HelloAsso** repris par le
site (boutique Héroïc, adhésions, stage, tournoi, buvettes) : sinon on peut
encore commander des deux côtés, et les places du stage seraient vendues deux
fois. Les commandes déjà passées sur HelloAsso restent dans son espace. Pas
avant : pendant la pause, le site envoie les visiteurs sur la page HelloAsso
du club, donc vers ces formulaires.

Pour des essais sans argent réel, HelloAsso propose un bac à sable
(helloasso-sandbox.com) : y créer une association de test, et ajouter dans
Netlify `HELLOASSO_API = https://api.helloasso-sandbox.com` avec ses clés.

### Fait

- [x] Créneaux, gymnases et tarifs réels de la saison 2026-2027
- [x] Trois actualités réelles, tirées de l'Instagram et de HelloAsso
- [x] Vingt actualités de la saison 2025-2026, avec leurs photos, l'historique
  et le palmarès complet, repris de l'ancien site Clubeo
  (bourgesvolley.clubeo.com) en octobre 2026 ; premier album de la galerie
  (tournoi du BVB 2026). La coupure du Berry Républicain de l'actu du
  10 octobre 2025 est reprise avec l'accord dont dispose le club, source
  citée sous l'article
- [x] 25 anciens albums de Clubeo (2005 à 2021) repris dans la galerie : au
  plus 40 photos par album, les plus nettes, réparties sur tout l'événement
  (le tournoi 2016 en comptait 431). Deux albums laissés de côté : « que
  dire ???? » (une photo sans légende) et « histoire de volley » (deux
  dessins dont l'auteur est inconnu)
- [x] Page 404
- [x] Logos des partenaires institutionnels cliquables vers leur site
- [x] Pages Mentions légales, Confidentialité et « Message envoyé »
- [x] Filtre par équipe sur la page Matchs
- [x] Toutes les images optimisées (WebP, plusieurs tailles)
- [x] Polices servies par le site, plus aucun appel à Google
- [x] Écoles de sport de la Ville sur la page Nous rejoindre
- [x] Galerie photos gérée depuis l'administration
- [x] Stage : jours cochés un par un, places par jour, sortie liée à un jour
- [x] Récapitulatif détaillé après paiement, alerte mail possible au club
- [x] Administration et page Commandes aux couleurs du site, utilisables sur
  tablette et téléphone (colonne des collections entière, barre du haut sans
  débordement)
- [x] Site prêt pour www.bourges-volleyball.fr (29 octobre 2026), à brancher
  dès que le domaine est livré
- [x] Page Planning : toute la semaine d'entraînements, jour par jour, dans le
  menu après Équipes (menu complet au-delà de 1300 px de large)
- [x] Logo du club sur l'écran d'accueil d'un téléphone (icônes tirées du logo
  d'origine, 1117 px, de l'ancien site Clubeo)
- [x] Lundi FFVolley : ne republie que si la fédération a du nouveau
- [x] Bouton « Tester HelloAsso » sur la page Commandes : vérifie la clé API
  sans rien encaisser
- [x] Audit du 29 octobre 2026 (sécurité, design, ergonomie, fonctionnalités,
  réglementaire) : outils mis à jour (8 failles connues corrigées), trois
  règles de sécurité de plus, points du diaporama assez grands au doigt et
  bouton pause, petits liens agrandis au toucher, budget Netlify corrigé,
  geste annuel pour les messages de contact, fichier inutile retiré
- [x] Boutique en pause tant que le paiement n'est pas branché et testé :
  interrupteur dans *Réglages*, visiteurs renvoyés vers la page HelloAsso du
  club (helloasso.com/associations/bourges-volley, l'adresse des formulaires
  repris de l'ancien site)
- [x] Dépôt GitHub public vérifié sans aucun secret, et copies d'essai des
  inconnus bloquées chez Netlify (*Require approval*), le 30 octobre 2026

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

- **Presque pas de serveur.** Les pages sont des fichiers. Seule la boutique
  fait tourner quelques petites fonctions chez Netlify (`netlify/functions/`),
  sans base de données à administrer : les commandes sont rangées dans
  Netlify Blobs.
- **Aucune carte bancaire ne passe par le site.** Le paiement se fait sur
  HelloAsso ; le site ne connaît que le montant. Ce montant est **recalculé
  par le serveur** à partir des fiches : le navigateur n'envoie que des choix.
- **Une commande n'est « payée » que si HelloAsso le confirme**, interrogé
  directement par le serveur. Ni le retour sur le site ni le contenu d'une
  notification ne suffisent.
- **La liste des commandes** (noms, mails, participants) n'est servie qu'à un
  compte de l'administration, dont le jeton est vérifié auprès de Netlify.
  L'export Excel neutralise les cellules qui pourraient se lancer comme des
  formules.
- **Les commandes s'effacent seules** : un an après, ou deux jours si elles
  n'ont jamais été payées (`netlify/functions/purge-commandes.mjs`, chaque
  nuit). Le calcul des montants est vérifié par `npm test`.
- **Aucun traceur, aucun cookie publicitaire.** Pas de Google Analytics, pas de
  bouton de réseau social espion. C'est aussi ce qui évite d'avoir à afficher
  une bannière de consentement.
- **Le fichier de l'interface d'administration est verrouillé par une
  empreinte** (`integrity` dans `public/admin/index.html`). Il est servi par un
  hébergeur tiers ; si celui-ci renvoyait un jour un fichier modifié, le
  navigateur refuserait de l'exécuter. Sans cela, un fichier trafiqué hériterait
  du droit d'écrire dans tout le site.
- **En-têtes de sécurité** dans `public/_headers` : pas de devinette de type de
  fichier, pas de fuite d'adresse vers les sites tiers, ni caméra ni micro ni
  position, et interdiction d'enfermer le site dans un cadre sur un autre
  domaine. Depuis l'audit du 29 octobre 2026, aussi : ni objet embarqué, ni
  balise `<base>`, ni formulaire qui envoie ses saisies ailleurs que sur le
  site (`object-src`, `base-uri`, `form-action`). Un compte bénévole piraté ne
  peut donc pas glisser dans une actu un faux formulaire qui détourne les
  saisies.
- **Inscription à l'administration fermée** : sur invitation seulement,
  vérifié le 29 octobre 2026 (`/.netlify/identity/settings` répond
  `"disable_signup": true`). La connexion avec un compte Google y est activée :
  elle ne sert qu'aux personnes déjà invitées.
- **Outils à jour** : `npm audit` sans aucune faille connue le 29 octobre 2026
  (Astro 7.4, Vite 8.3.5, sharp 0.35.5). À relancer deux ou trois fois par an ;
  `npm audit fix` corrige sans changer de version majeure, puis `npm run
  build` et `npm test` pour vérifier.
- **Le widget d'identification ne se charge plus pour les visiteurs.** Il ne
  s'active que si l'adresse contient un jeton d'invitation.

### Ce qui reste ouvert, en connaissance de cause

- **La politique de contenu (CSP) verrouille les scripts, pas les styles.**
  Astro la génère à chaque construction (`security.csp` dans
  `astro.config.mjs`) : seuls les scripts du site peuvent s'exécuter, si bien
  qu'un `<script>` glissé dans une actualité depuis un compte piraté serait
  bloqué. Les styles en ligne restent permis, parce que le widget
  d'invitation Netlify en a besoin ; un style ne peut pas exécuter de code.
  L'administration (`/admin/`) n'est pas couverte : Decap ne le supporte pas.
- **Les liens saisis dans l'administration** (partenaire, agenda, HelloAsso)
  doivent commencer par `https://`. Un lien `javascript:` est refusé, dans
  l'administration comme à la construction du site.
- **Le formulaire de contact n'est protégé que par un piège à robots.** Si le
  spam devient gênant, Netlify propose d'activer reCAPTCHA en un clic
  (*Forms → Settings → Spam filters*).
- **Un numéro de téléphone est publié** en pied de page et sur la page Contact.
  C'est un choix, pas un oubli — mais il change avec le bureau.
- **Une commande non payée retient ses places 20 minutes.** Quelqu'un de
  malveillant pourrait donc, en lançant des commandes en rafale, faire
  paraître un stage complet. Une limite par visiteur (proposée gratuitement par
  Netlify) a été écartée à l'audit : elle compterait aussi chaque affichage de
  page et n'empêcherait pas une seule adresse de bloquer des dizaines de
  places. Si cela arrivait : remettre la boutique en pause (*Réglages*), et les
  commandes en attente s'effacent d'elles-mêmes.
- **Tous les comptes de l'administration voient les commandes** (noms, mails,
  téléphones des acheteurs), choix du club à l'audit du 29 octobre 2026. Un
  rôle réservé à la boutique reste possible : Netlify Identity sait donner des
  rôles, et `netlify/functions/commandes.mjs` les vérifierait.
- **Les anciennes photos reprises de Clubeo** (465, de 2005 à 2021) montrent
  parfois des mineurs, sans trace de l'accord des parents. La page
  Confidentialité promet le retrait sur simple demande : à tenir sans délai.
- **Les mentions légales ne nomment pas le directeur de la publication** :
  « Le président du Bourges Volley-Ball », choix du club (le nom change avec
  le bureau). La loi (LCEN, article 6) demande un nom ; le risque est faible
  pour une association, mais il existe.
- **L'administration n'est pas couverte par la politique de scripts** (CSP) :
  Decap ne le supporte pas. Elle repose sur l'empreinte du fichier de Decap et
  sur l'inscription fermée.

### Le dépôt GitHub est public, et doit le rester

N'importe qui peut lire le code du site et tout son historique sur
`github.com/bourges-volleyball/bourges-volleyball`. Ce n'est pas un risque :
**aucun secret n'y est rangé** (vérifié le 30 octobre 2026, historique
compris). Les clés HelloAsso et l'adresse du hook du lundi sont des variables
Netlify, les commandes sont dans Netlify Blobs, les messages de contact dans
Netlify Forms.

- **Pourquoi ne pas le passer en privé** : le dépôt appartient à une
  organisation GitHub, et l'offre gratuite de Netlify ne publie pas un dépôt
  privé d'organisation (offre Pro, à partir de 20 $ par mois). Les
  publications faites depuis l'administration risqueraient en plus de rester
  « en attente d'approbation ».
- **La règle** : ne jamais écrire une clé, un mot de passe ou l'adresse du hook
  dans un fichier du dépôt, ni dans une actu. Si cela arrive, l'effacer ne
  suffit pas, l'historique la garde : **changer la clé à la source**
  (HelloAsso : en générer une nouvelle ; hook : le supprimer et en créer un
  autre dans Netlify), puis mettre à jour la variable.
- **Une proposition de modification venue d'un inconnu** (*pull request*
  depuis une copie du dépôt) ne doit pas être approuvée chez Netlify : sa
  copie d'essai tournerait avec les clés HelloAsso. Netlify la bloque par
  défaut (*Project configuration → Environment variables → Site policies* :
  **Require approval**, vérifié le 30 octobre 2026), réglage à laisser tel
  quel. Si une telle copie apparaît « en attente » dans *Deploys* : **Reject**.
- **Ce qui est visible en plus du site** : ce guide, et l'adresse mail des
  personnes qui ont enregistré des modifications.
- **Une photo retirée du site reste dans l'historique.** Si une famille demande
  qu'une photo disparaisse vraiment (droit à l'image), il faut aussi la purger
  de l'historique du dépôt : c'est un travail de développeur, à demander.

### Une fois par an, en septembre : les messages de contact

La page Confidentialité promet que **les messages du formulaire de contact
sont supprimés au plus tard un an après le dernier échange**. Rien ne le fait
tout seul (choix de l'audit du 29 octobre 2026 : une suppression automatique
demanderait de ranger dans Netlify une clé capable de tout modifier). En
septembre, avec les poules FFVolley :

1. **Netlify**, *Forms* → formulaire **contact** : supprimer les messages de
   plus d'un an.
2. **La boîte du club** (Gmail) : rechercher
   `from:formresponses@netlify.com older_than:1y`, tout sélectionner,
   supprimer ; de même pour les échanges de plus d'un an qui ont suivi.

Les commandes de la boutique, elles, s'effacent seules (un an).

---

## 8. La récupération automatique FFVolley

Le script `scripts/ffvb.mjs` lit les pages de calendrier de la fédération et
écrit le résultat dans `src/data/ffvb.json`, que le site utilise ensuite. La
lecture des pages elle-même est dans `netlify/lib/ffvb.mjs`, partagée avec la
fonction du lundi ; ses tests (`npm test`) simulent une page de la fédération.

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

Elles se règlent dans l'administration, rubrique **Réglages > Matchs FFVolley**,
qui écrit `src/data/ffvb-poules.json`. Chaque équipe y est donnée par l'adresse
de sa page Calendrier sur ffvbbeach.org : le script en tire la saison, le code
de ligue (`LICE` pour Centre-Val de Loire) et le code de poule, puis
reconstruit l'adresse lui-même (il n'interroge jamais un autre site). **À
chaque changement de saison**, un bénévole colle les nouvelles adresses : la
marche à suivre est dans le guide des bénévoles, partie 8. Une adresse
illisible fait ignorer l'équipe ; un fichier illisible fait garder les données
précédentes, sans casser la construction.

### Ce que le script fait, et ne fait pas

Il ne retient que les rencontres où figure Bourges Volley-Ball, écarte les journées où le club est **exempt** — la fédération les note
« xxxxx » — et convertit les horaires en heure de Paris. Il reprend aussi le
**classement** de chaque poule (tableau en tête de page), le **détail des
sets** et les **forfaits** (« F », comptés 3-0) : la page Matchs les affiche
par équipe, dans l'ordre de `POULES`.

Le guide des bénévoles, lui, est une page statique : `public/admin/guide/`
(bouton vert « Guide » dans la barre du haut de l'administration, à côté du
bouton « Commandes »). Son PDF se régénère
depuis le navigateur, Imprimer > Enregistrer en PDF, après toute modification.

**Il n'échoue jamais bruyamment.** Si la fédération est injoignable ou change
la structure de ses pages, le script conserve le fichier précédent et le site
continue de fonctionner avec les dernières données connues. Une poule seule
en échec garde de même ses rencontres et son classement de la dernière
lecture réussie. C'est volontaire : un calendrier de la veille vaut mieux
qu'une page vide.

En contrepartie, il faut le savoir : **la FFVolley ne publie aucune API**.
Ce script lit du HTML. Une refonte de leur site le cassera un jour, et il
faudra reprendre l'analyse. Le champ `miseAJour` dans `src/data/ffvb.json`
indique la dernière récupération réussie — c'est là qu'on voit qu'il a décroché.

### Ufolep

Il n'existe pas d'équivalent. Chaque comité départemental publie ses résultats
à sa manière, souvent en PDF. Les rencontres Ufolep se saisissent donc à la
main dans la rubrique Matchs.

### La mise à jour du lundi (à brancher une fois)

La fonction `netlify/functions/reconstruire.mjs` passe chaque lundi vers 6h.
Elle relit la FFVolley et la compare à ce que montre le site en ligne (la page
`/ffvb.json`, publiée avec lui) : **elle ne republie que s'il y a du nouveau**,
un score, un match déplacé, un classement. Les scores du week-end arrivent
ainsi sans que personne ne publie rien, et une semaine sans match (vacances,
intersaison), ou déjà à jour parce qu'un bénévole a publié depuis le
week-end, ne coûte aucun crédit. Une poule injoignable ce matin-là n'est pas
un changement : elle est comparée le lundi suivant. Pour l'activer :

1. Netlify, *Site configuration → Build & deploy → Build hooks → Add build
   hook*, nommé par exemple « Lundi FFVolley », branche `main`. Copier
   l'adresse obtenue.
2. *Site configuration → Environment variables* : `BUILD_HOOK_URL` = cette
   adresse, toutes les portées (*All scopes*, ou au moins *Functions*). Ne la
   diffusez pas : elle permet de lancer une publication.
3. La variable n'est lue qu'à partir de la **publication suivante** : la
   première publication qui suit (une actu, *Deploys → Trigger deploy*…)
   active le lundi. Pour vérifier, le lundi matin, *Logs → Functions →
   reconstruire* affiche « Reconstruction demandee, du nouveau pour… : 200 »
   (et *Deploys* une publication « Lundi FFVolley »), ou « rien de neuf depuis
   la derniere publication ». « BUILD_HOOK_URL absente » : aucune publication
   n'a suivi l'ajout de la variable.

**Pourquoi pas tous les jours ?** Avec l'offre gratuite de Netlify, chaque
publication coûte 15 crédits sur 300 par mois, soit une vingtaine de
publications, modifications des bénévoles comprises. Une par semaine au plus
en consomme quatre ou cinq, souvent moins. Le prochain match, lui, avance tout seul dans le
navigateur des visiteurs, sans publication. Si le club passe à une offre
payante, il suffit de changer `schedule` dans le fichier (`"@daily"`).

### Le budget de l'offre gratuite Netlify

Le club est sur l'offre **gratuite** : **300 crédits par mois**, qui paient
tout. Tarifs relus le 29 octobre 2026 dans la documentation de Netlify
(*How credits work*) :

| Ce qui consomme | Coût | Pour ce site |
|---|---|---|
| Une publication du site | 15 crédits | chaque « Publier » de l'administration, chaque mise à jour du code, chaque lundi qui a du nouveau |
| Une copie d'essai (*Deploy Preview*, branche) | 0 crédit | une demande de fusion sur GitHub : le site entier à une adresse à part, pour vérifier avant de publier |
| La bande passante | 20 crédits par Go | une page pèse 0,15 à 0,9 Mo (l'accueil, sur ordinateur), un album de galerie 1 à 2 Mo |
| Les requêtes des visiteurs | 2 crédits pour 10 000 | une page en demande 8 à 50 (photos comprises) |
| Les fonctions (boutique, lundi) | 10 crédits par Go-heure | négligeable |
| Un envoi de formulaire | gratuit | messages de contact, alertes de commande |

**Les publications sont presque tout le budget** : 300 crédits, c'est
**vingt publications par mois** si rien d'autre ne consomme. Le lundi en
prend quatre ou cinq au plus en pleine saison, aucune les semaines sans
nouveauté FFVolley. Il en reste une quinzaine pour les bénévoles et les
évolutions du site.

**Quand les crédits sont épuisés**, Netlify bloque les publications jusqu'au
mois suivant, et peut mettre le site entier en pause. D'où quatre règles :

- **regrouper les modifications** avant de cliquer sur « Publier » (un album
  complet, une vente complète, pas photo par photo) ;
- **ajouter les photos depuis le formulaire** du contenu (« Choisir une
  image ») : elles partent avec lui, en une seule publication. Le bouton
  « Media » de Decap, qui enregistrait chaque photo seule, a été retiré de la
  barre du haut (`public/admin/index.html`) ;
- **regarder la jauge** de temps en temps : Netlify, *Team → Usage & billing* ;
- **essayer les grosses modifications du code sur une copie d'essai**
  (demande de fusion sur GitHub), gratuite, plutôt qu'en publiant ;
- **ne pas passer la mise à jour FFVolley à tous les jours.**

Si le budget devient trop juste : les matchs pourraient être lus en direct
par le navigateur des visiteurs, sans aucune publication le lundi. C'est une
réécriture de leurs quatre affichages (accueil, page Matchs, fiches d'équipe,
agenda), écartée en octobre 2026 pour rester simple à entretenir. Ou le club
passe à l'offre Pro.
