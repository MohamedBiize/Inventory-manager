# Frontend Client - Interface et Composants

## Vue d'ensemble

Le frontend est construit avec **React 19**, **Tailwind CSS 4**, et **tRPC**, offrant une interface élégante et réactive pour gérer l'inventaire en temps réel.

## Architecture Frontend

### Pages Principales

#### 1. **Dashboard** (`pages/Dashboard.tsx`)
La page d'accueil affiche les statistiques clés de l'inventaire :
- Total des produits actifs
- Valeur totale du stock
- Nombre de produits en stock bas
- Prix moyen des produits
- Alertes de stock bas en temps réel
- Actions rapides pour accéder aux autres pages

#### 2. **Products** (`pages/Products.tsx`)
Gestion complète des produits avec **AG Grid** :
- Tableau interactif avec filtrage, tri et pagination
- Colonnes : SKU, Nom, Catégorie, Quantité, Prix, Actions
- Création de nouveaux produits via dialog
- Édition en ligne des produits
- Suppression avec confirmation
- Recherche en temps réel
- Export des données

#### 3. **Suppliers** (`pages/Suppliers.tsx`)
Gestion des fournisseurs avec AG Grid :
- Liste des fournisseurs avec contacts
- Édition et suppression
- Association des produits fournis
- Historique des interactions

#### 4. **Categories** (`pages/Categories.tsx`)
Gestion des catégories de produits :
- Liste avec création rapide
- Édition des noms
- Suppression avec vérification de dépendances
- Compteur de produits par catégorie

#### 5. **Reports** (`pages/Reports.tsx`)
Visualisations et analyses avec **Recharts** :
- Graphique des mouvements de stock (barres)
- Distribution des prix (histogramme)
- Valeur par catégorie (camembert)
- Statistiques détaillées

#### 6. **Settings** (`pages/Settings.tsx`)
Gestion des permissions et notifications :
- Affichage des permissions actuelles
- Gestion des utilisateurs (admin only)
- Historique des notifications
- Préférences utilisateur

## Composants Réutilisables

### UI Components (shadcn/ui)
- `Button` - Boutons avec variantes
- `Dialog` - Modales pour créer/éditer
- `Card` - Conteneurs de contenu
- `Badge` - Étiquettes et statuts
- `Input` - Champs de texte
- `Select` - Listes déroulantes
- `Table` - Tableaux simples
- `Dropdown` - Menus déroulants

### Composants Personnalisés

#### **DashboardLayout** (`components/DashboardLayout.tsx`)
Layout principal avec :
- Sidebar collapsible avec navigation
- Header avec user profile
- Responsive design (mobile/desktop)
- Gestion de l'authentification

#### **NotificationCenter** (`components/NotificationCenter.tsx`)
Affichage des notifications en temps réel :
- Dropdown avec liste des notifications
- Compteur de notifications non lues
- Indicateur de connexion WebSocket (point vert/gris)
- Suppression et effacement des notifications
- Alerte sonore pour alertes critiques

#### **ProductDialog** (`components/ProductDialog.tsx`)
Dialog pour créer/éditer un produit :
- Validation des champs
- Sélection de catégorie
- Gestion des erreurs

#### **SupplierDialog** (`components/SupplierDialog.tsx`)
Dialog pour créer/éditer un fournisseur :
- Informations de contact
- Validation email

## Hooks Personnalisés

### **useAuth** (`hooks/useAuth.ts`)
Gestion de l'authentification :
- État utilisateur courant
- Fonction de logout
- Vérification de connexion
- Redirection vers login

### **useWebSocket** (`hooks/useWebSocket.ts`)
Gestion des notifications temps réel :
- Connexion Socket.io automatique
- État des notifications
- État des mises à jour produits
- État des mouvements de stock
- Émission d'événements

### **useMobile** (`hooks/useMobile.ts`)
Détection du mode mobile pour responsive design

## Intégration tRPC

Toutes les opérations utilisent **tRPC** pour communiquer avec le backend :

```typescript
// Récupérer les données
const { data, isLoading } = trpc.products.list.useQuery();

// Créer/modifier/supprimer
const mutation = trpc.products.create.useMutation({
  onSuccess: () => {
    trpc.useUtils().products.invalidate();
  }
});
```

## Notifications Temps Réel

Le frontend reçoit les notifications via WebSocket :

**Types d'événements :**
- `notification:stock_low` - Alerte stock bas (orange)
- `notification:stock_critical` - Alerte stock critique (rouge)
- `product:update` - Mise à jour produit (bleu)
- `supplier:update` - Mise à jour fournisseur
- `stock:movement` - Mouvement de stock

## Design System

### Couleurs (Tailwind CSS 4)
- **Primary** : Bleu pour les actions principales
- **Destructive** : Rouge pour les suppressions
- **Warning** : Orange pour les alertes
- **Success** : Vert pour les confirmations

### Typographie
- **Headings** : Titres clairs et hiérarchisés
- **Body** : Texte lisible avec bon contraste
- **Mono** : Code et données techniques

### Spacing et Layout
- Utilisation cohérente de la grille Tailwind
- Padding/margin standardisés
- Responsive breakpoints (mobile, tablet, desktop)

## AG Grid Configuration

AG Grid est utilisé pour les tableaux de produits et fournisseurs :

**Fonctionnalités :**
- Tri multi-colonnes
- Filtrage avancé
- Pagination côté client
- Sélection de lignes
- Export CSV
- Redimensionnement des colonnes

## Performance

### Optimisations
- Lazy loading des pages
- Memoization des composants coûteux
- Pagination des tableaux
- Cache tRPC avec invalidation intelligente
- Images optimisées

### Accessibilité
- Focus rings visibles
- Labels pour tous les inputs
- Navigation au clavier
- Contraste suffisant
- ARIA labels appropriés

## Structure des Fichiers

```
client/
├── src/
│   ├── pages/                    # Pages principales
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Suppliers.tsx
│   │   ├── Categories.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── NotFound.tsx
│   ├── components/               # Composants réutilisables
│   │   ├── DashboardLayout.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── ProductDialog.tsx
│   │   ├── SupplierDialog.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                    # Hooks personnalisés
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   └── useMobile.ts
│   ├── contexts/                 # React contexts
│   │   └── ThemeContext.tsx
│   ├── lib/                      # Utilitaires
│   │   └── trpc.ts
│   ├── App.tsx                   # Routeur principal
│   ├── main.tsx                  # Point d'entrée
│   └── index.css                 # Styles globaux
├── public/                       # Assets statiques
└── index.html                    # HTML template
```

## Démarrage du Frontend

```bash
# Mode développement
pnpm dev

# Build production
pnpm build

# Préview production
pnpm preview
```

Le frontend se connecte automatiquement au serveur backend sur le même port.

## Points Clés de l'Interface

1. **Responsive Design** : Fonctionne sur mobile, tablet et desktop
2. **Temps Réel** : Notifications WebSocket sans rechargement
3. **Accessibilité** : Navigation au clavier et lecteurs d'écran
4. **Performance** : Chargement rapide et interactions fluides
5. **Élégance** : Design moderne avec Tailwind CSS
