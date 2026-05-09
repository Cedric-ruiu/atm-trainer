# atm-trainer — référence Claude Code

Simulateur de DAB pour l'entraînement de personnes ayant des difficultés cognitives. Cible : tablette/navigateur. Déploiement : GitHub Pages.

---

## Stack et commandes

| Outil | Version |
|---|---|
| Node | 22.22.0 (`.node-version`) |
| Yarn | 4.13.0 (node-modules linker) |
| Vue | 3 (Composition API, `script setup`) |
| Vite | 8 |
| Tailwind CSS | v4 (`@tailwindcss/vite` — pas de postcss ni de fichier config) |
| Biome | linter/formatter |

```bash
yarn dev       # serveur de développement
yarn build     # build de production (dist/)
yarn preview   # prévisualisation du build
```

**Tailwind v4** — point d'entrée CSS : `src/style.css` avec `@import "tailwindcss"`. Ne pas utiliser `import "tailwindcss"` dans un fichier JS.

**Biome :** signale comme "inutilisé" tout symbole `<script setup>` utilisé uniquement dans le template → faux positifs. Préfère `z-9400` à `z-[9400]` (`suggestCanonicalClasses`).

**GitHub Pages** — `base: "/atm-trainer/"` dans `vite.config.js`.

---

## Architecture

```
src/
├── App.vue                  # Registre statique + composant dynamique
├── main.js / style.css      # Point d'entrée + @import "tailwindcss"
├── components/
│   ├── AtmShell.vue         # Châssis physique (provide/inject + D&D + menu)
│   ├── AtmScreenLayout.vue  # Wrapper screens (gradient bleu + header + barre fraude)
│   ├── AtmKeypad.vue        # Grille 3×4 — émet digit/cancel/clear/confirm
│   ├── InfoModal.vue / PinSettingsModal.vue / StatsModal.vue  # (v-model, z-9500)
│   ├── chassis/             # AtmChassis, CardReader, PocketZone, BillsTray, ReceiptSlot
│   ├── draggables/          # DraggableCard, DraggableBills, DraggableReceipt
│   └── overlays/            # CongratsOverlay, MenuButtons
├── composables/
│   ├── useAtmState.js       # Routing (singleton module-level)
│   ├── useSession.js        # État de session (singleton module-level)
│   ├── useProgression.js    # Persistance sessionStorage
│   └── useDraggable.js      # Drag & drop factory (Pointer Events API)
├── screens/                 # 10 écrans — ScreenAccueil … ScreenStats
└── utils/sounds.js          # playApplause() — Web Audio API
```

### Routing

Pas de Vue Router. `useAtmState.js` expose `currentScreen` et `navigate(screenName)`. `App.vue` résout le nom via registre statique + `computed`. **Mettre à jour `VALID_SCREENS` (useAtmState.js) ET le registre d'`App.vue` à l'ajout d'un screen.**

### État partagé (module-level singletons)

Tous les composables déclarent leurs refs **en dehors** de la fonction exportée. Chaque appel à `useSession()` etc. retourne les mêmes refs.

---

## AtmShell — châssis physique et provide/inject

Gère le châssis complet (layout responsive + drag & drop + animations). Fournit des refs que les screens injectent pour piloter les éléments physiques.

**Layout :** Paysage = `flex-row`, écran `aspect-ratio:4/3; height:min(70dvh,580px)`. Portrait = `flex-col`, écran `w-full aspect-ratio:4/3`.

### Contrat provide/inject

| Clé inject | Type | Description |
|---|---|---|
| `cardVisible` | `ref(false)` | Rend la carte interactive |
| `receiptVisible` | `ref(false)` | Affiche le reçu dans la fente |
| `billsVisible` | `ref(false)` | Affiche la liasse dans le bac |
| `onCardClick` | `ref(null\|fn)` | Callback quand carte déposée dans zone cible |
| `onReceiptClick` | `ref(null\|fn)` | Callback au clic sur le reçu |
| `onBillsClick` | `ref(null\|fn)` | Callback au clic sur la liasse |
| `keypadBus` | `ref(null\|{type,payload?})` | Événement clavier courant |
| `cardInReader` | `ref(false)` | `true` = carte dans le lecteur (déclenche éjection 3 s) |

**Reset automatique :** AtmShell surveille `currentScreen` avec `{ flush: "pre" }` — toutes les refs sont remises à `false`/`null` avant que le nouveau composant monte.

**Pattern screen :**
```js
const cardVisible = inject("cardVisible");
const onCardClick = inject("onCardClick");
cardVisible.value = true;
onCardClick.value = () => navigate("ScreenSuivant");
```

---

## Drag & drop (carte, reçu, billets)

**Mécanique :** Pointer Events API (`pointerdown/pointermove/pointerup` + `setPointerCapture`). Si lâché hors zone cible → `*Floating = true`.

**`useDraggable(opts)`** — factory par instance. Retourne `{ isDragging, cardSize, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, cancel }`. `cardSize` est un `ref({ w, h })` mis à jour au `pointerdown`.

**Zone rects :** snapshotés au `pointerdown`, reconstruits automatiquement si le viewport change pendant le drag (`window.innerWidth/Height` comparé à chaque `pointermove`).

**`DraggableCard`** utilise `<Teleport to="body" :disabled="!isDragging && !cardFloating">` — nécessaire car `AtmChassis` a `overflow-hidden + rounded-2xl` qui crée un layer de composition capturant les descendants `position:fixed`. Ne pas supprimer ce Teleport.

**Insertion (poche → lecteur) :** détection `edge-top+overlap` (bord supérieur ±8 px de la fente, 80 % de recouvrement horizontal). Au déclenchement, `swallowY = slotRect.top + slotRect.height/2 + cardH/2` pour aligner le bord supérieur de la carte sur le centre de la fente. Animation CSS 3 s avec `--dy` pour partir sans saut depuis la position du drag.

**Récupération (lecteur → poche) :** `cardInReader = true` → éjection 3 s → drag vers `pocketZoneRef`.

---

## keypadBus — clavier partagé

`AtmKeypad` est monté **uniquement dans AtmShell**. Ne jamais l'importer dans un screen. Les events transitent via `keypadBus` (nouveau objet à chaque frappe, même répétée).

```js
// Types : { type: "digit", payload: "0"–"9" } | { type: "cancel"|"clear"|"confirm" }
const keypadBus = inject("keypadBus");
watch(keypadBus, (event) => {
  if (!event) return;
  if (step.value !== "monEtat") return; // guard obligatoire
  if (event.type === "digit")   onDigit(event.payload);
  if (event.type === "confirm") onConfirm();
});
```

---

## Menu accompagnateur et modales

Trois boutons `fixed top-3 left-3 z-9400` (engrenage / graphique / i) → modales `fixed z-9500` via v-model. Montées dans AtmShell, indépendantes des screens.

**Boutons dans modales — pattern obligatoire :** `class="btn"` + scoped CSS `filter: brightness(1.2)` sur `:hover`, `brightness(0.82)` sur `:active` + `touch-action: manipulation; -webkit-tap-highlight-color: transparent`. Les `style=""` inline ont une spécificité supérieure à `hover:bg-*` Tailwind.

**Popup félicitation :** `fixed z-10000`, déclenchée par CustomEvent `atm-objectif-atteint` quand `streak === objectif`.

---

## Screens

**Flux principal :** Accueil → Langue → Opération → (Montant?) → Code → Recu → Billets → Remerciement

**Échec PIN :** Code (×3) → CarteBloquee → Accueil

| Screen | Rôle |
|---|---|
| `ScreenAccueil` | Insère la carte |
| `ScreenLangue` | Choix de la langue |
| `ScreenOperation` | Retrait express / montant / solde / annulation |
| `ScreenMontant` | Saisie du montant (grille + saisie libre) |
| `ScreenCode` | Saisie du code PIN (4 chiffres) |
| `ScreenRecu` | Choix reçu + récupération carte et reçu |
| `ScreenBillets` | Retrait des billets dans le bac |
| `ScreenRemerciement` | Fin — retour auto après 5 s |
| `ScreenCarteBloquee` | Carte bloquée — retour auto après 20 s |
| `ScreenStats` | Stats, objectif éditable, historique |

Utiliser `AtmScreenLayout` comme wrapper. Prop `warn={false}` pour masquer la barre fraude.

---

## Structure sessionStorage

**Clé :** `"atm-trainer-session"` → effacé à la fermeture de l'onglet.

```ts
type User = {
  pin: string | null;   // null = mode démo (tout code à 4 chiffres accepté)
  sessions: { date: string; success: boolean }[];
  streak: number; bestStreak: number; objectif: number; // défaut 5
};
```

**`useProgression()` :** `loadUser()` · `saveUser(user)` · `recordSession(success)` · `getStats()` · `generatePin()`

**Resync après écriture :** `currentUser.value = loadUser()` après `recordSession()` ou `saveUser()`. Ne pas importer `useSession` dans `useProgression` (dépendance circulaire).

**Note PIN :** générer chaque chiffre indépendamment (`Array.from({length:4}, () => …)`). `Math.random() * 9000 + 1000` exclut les PINs commençant par 0.

---

## Règles métier

| Règle | Valeur |
|---|---|
| Solde initial | 200 € (ref module-level dans `useSession.js`, non persisté) |
| Tentatives PIN | 3 max → `ScreenCarteBloquee` |
| Montant libre | Multiple de 10 €, ≤ solde disponible |
| Dénominations billets | 50 €, 20 €, 10 € (algorithme glouton) |
| Objectif série | Éditable dans StatsModal (défaut 5) |
| Auto-retour Remerciement | 5 secondes |
| Auto-retour CarteBloquee | 10 s (message) + 10 s (redirection) |
| Mode démo | `pin: null` — tout code à 4 chiffres accepté |

**`resetSession()`** : remet à zéro `selectedAmount`, `pinAttempts`, `transactionType`. Ne réinitialise pas `currentUser` ni `solde`.

---

## Composants à ne pas confondre

- **`AtmKeypad`** — monté **uniquement dans AtmShell**. Ne jamais importer dans un screen.
- **`AtmScreenLayout`** — wrapper screens. Prop `warn={false}` pour masquer barre fraude.
- **`DraggableCard`** — utilise `<Teleport to="body">` en drag/floating (voir section D&D). Ne pas y toucher sans relire la contrainte `overflow-hidden`.
- **`UiCard`** / **`AtmButton`** — génériques, indépendants du thème DAB.
- **`AtmCard`** — SVG carte hérité, **non utilisé**. La carte est rendue dans `DraggableCard`.
