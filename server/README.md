# Backend Server - Architecture et Structure

## Vue d'ensemble

Le backend est construit avec **Express.js**, **tRPC**, et **Socket.io**, implémentant une **architecture en couches** stricte pour assurer une séparation claire des responsabilités et une maintenabilité optimale.

## Architecture en Couches

L'architecture suit un modèle à trois niveaux :

### 1. **Routers (tRPC Procedures)**
Les routers définissent les points d'entrée publics de l'API. Chaque router correspond à un domaine métier (produits, fournisseurs, catégories, etc.) et expose des procédures tRPC avec validation Zod.

**Fichiers clés :**
- `routers.ts` - Point d'entrée principal agrégant tous les routers
- `routers/productRouter.ts` - CRUD produits avec filtrage et pagination
- `routers/supplierRouter.ts` - Gestion des fournisseurs
- `routers/categoryRouter.ts` - Gestion des catégories
- `routers/stockMovementRouter.ts` - Historique des mouvements
- `routers/permissionRouter.ts` - Vérification des permissions
- `routers/notificationRouter.ts` - Gestion des notifications
- `routers/importExportRouter.ts` - Import/Export CSV et PDF

### 2. **Services (Business Logic)**
Les services contiennent la logique métier. Ils orchestrent les opérations, appliquent les règles de validation complexes, et coordonnent les interactions entre repositories.

**Services principaux :**
- `productService.ts` - Logique métier des produits
- `supplierService.ts` - Logique métier des fournisseurs
- `categoryService.ts` - Gestion des catégories
- `stockMovementService.ts` - Enregistrement des mouvements
- `notificationService.ts` - Création et gestion des notifications
- `permissionService.ts` - Vérification des permissions granulaires
- `importExportService.ts` - Parsing CSV et génération PDF
- `websocketService.ts` - Gestion des événements temps réel
- `stockAlertService.ts` - Monitoring automatique des stocks

### 3. **Repositories (Data Access)**
Les repositories gèrent l'accès à la base de données. Ils encapsulent les requêtes Drizzle et retournent des données brutes sans logique métier.

**Repositories :**
- `productRepository.ts` - Requêtes produits
- `supplierRepository.ts` - Requêtes fournisseurs
- `categoryRepository.ts` - Requêtes catégories
- `stockMovementRepository.ts` - Requêtes mouvements
- `notificationRepository.ts` - Requêtes notifications

## Flux de Données

```
Client (tRPC) 
    ↓
Router (Validation Zod + Authentification)
    ↓
Service (Logique Métier + Règles)
    ↓
Repository (Requête DB)
    ↓
Database (MySQL/TiDB)
```

## Authentification et Autorisation

### OAuth + JWT
- **OAuth** : Authentification initiale via Manus OAuth
- **JWT** : Sessions persistantes via cookies signés
- **Contexte** : Chaque requête tRPC reçoit `ctx.user` avec les informations de l'utilisateur

### Permissions Granulaires
Le système supporte trois rôles avec permissions différentes :

| Rôle | Produits | Fournisseurs | Catégories | Admin |
|------|----------|-------------|-----------|-------|
| **Viewer** | Lecture | Lecture | Lecture | Non |
| **Manager** | CRUD | CRUD | CRUD | Non |
| **Admin** | CRUD | CRUD | CRUD | Oui |

Les permissions sont vérifiées via `permissionService.requirePermission()` dans chaque procédure protégée.

## Notifications et Temps Réel

### WebSocket (Socket.io)
Le serveur utilise Socket.io pour les notifications en temps réel :

**Événements principaux :**
- `notification:stock_low` - Alerte stock bas
- `notification:stock_critical` - Alerte stock critique
- `product:update` - Mise à jour produit
- `stock:movement` - Mouvement de stock
- `supplier:update` - Mise à jour fournisseur

### Monitoring Automatique
`stockAlertService` vérifie périodiquement les niveaux de stock et déclenche les alertes appropriées.

## Import/Export

### CSV Import
- Parsing robuste avec validation par ligne
- Gestion d'erreurs détaillée
- Support pour produits et fournisseurs

### PDF Export
- Génération de rapports avec statistiques
- Formatage professionnel
- Inclut tous les produits avec détails

## Tests

Le projet inclut **62 tests unitaires** couvrant :
- Repository layer (CRUD operations)
- Service layer (business logic)
- Permission system
- WebSocket events
- Stock alerts

**Exécuter les tests :**
```bash
pnpm test
```

## Dépendances Principales

| Package | Version | Utilisation |
|---------|---------|------------|
| express | 4.21.2 | Framework web |
| @trpc/server | 11.6.0 | RPC framework |
| drizzle-orm | 0.44.5 | ORM |
| socket.io | 4.8.3 | WebSocket |
| zod | 4.1.12 | Validation |
| papaparse | 5.5.3 | CSV parsing |
| pdfkit | 0.13.0 | PDF generation |

## Structure des Fichiers

```
server/
├── _core/                    # Framework core (OAuth, context, etc.)
├── db.ts                     # Database connection
├── routers.ts                # Main router aggregator
├── routers/                  # Feature routers
│   ├── productRouter.ts
│   ├── supplierRouter.ts
│   ├── categoryRouter.ts
│   ├── stockMovementRouter.ts
│   ├── permissionRouter.ts
│   ├── notificationRouter.ts
│   └── importExportRouter.ts
├── services/                 # Business logic
│   ├── productService.ts
│   ├── supplierService.ts
│   ├── categoryService.ts
│   ├── stockMovementService.ts
│   ├── notificationService.ts
│   ├── permissionService.ts
│   ├── importExportService.ts
│   ├── websocketService.ts
│   ├── stockAlertService.ts
│   └── *.test.ts            # Unit tests
└── repositories/             # Data access layer
    ├── productRepository.ts
    ├── supplierRepository.ts
    ├── categoryRepository.ts
    ├── stockMovementRepository.ts
    └── notificationRepository.ts
```

## Points Clés de l'Architecture

1. **Séparation des responsabilités** : Chaque couche a une responsabilité unique et bien définie
2. **Réutilisabilité** : Les services peuvent être appelés par plusieurs routers
3. **Testabilité** : Chaque couche peut être testée indépendamment
4. **Maintenabilité** : Les changements sont localisés à la couche appropriée
5. **Scalabilité** : Facile d'ajouter de nouveaux domaines métier

## Démarrage du Serveur

```bash
# Mode développement
pnpm dev

# Build production
pnpm build

# Démarrage production
pnpm start
```

Le serveur démarre sur le port 3000 (ou le premier port disponible) avec WebSocket automatiquement initialisé.
