# Database Schema - Structure Relationnelle

## Vue d'ensemble

La base de données utilise **MySQL/TiDB** avec **Drizzle ORM** pour la gestion des schémas et migrations. Le design suit les principes de normalisation relationnelle pour assurer l'intégrité des données.

## Tables Principales

### 1. **users**
Stocke les informations des utilisateurs authentifiés via OAuth.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique auto-incrémenté |
| `openId` | VARCHAR(64) | Identifiant OAuth unique |
| `name` | TEXT | Nom complet de l'utilisateur |
| `email` | VARCHAR(320) | Adresse email |
| `loginMethod` | VARCHAR(64) | Méthode de connexion (OAuth, etc.) |
| `role` | ENUM | Rôle : `user`, `admin` |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de dernière modification |
| `lastSignedIn` | TIMESTAMP | Dernière connexion |

**Index :** `openId` (unique)

### 2. **categories**
Catégories de produits pour l'organisation.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `name` | VARCHAR(255) | Nom de la catégorie |
| `description` | TEXT | Description optionnelle |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de modification |

**Index :** `name` (pour recherche rapide)

### 3. **products**
Produits de l'inventaire avec détails et stock.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `sku` | VARCHAR(100) | Stock Keeping Unit (unique) |
| `name` | VARCHAR(255) | Nom du produit |
| `description` | TEXT | Description détaillée |
| `categoryId` | INT (FK) | Référence à la catégorie |
| `quantity` | INT | Quantité en stock |
| `minStockLevel` | INT | Niveau minimum avant alerte |
| `unitPrice` | DECIMAL(10,2) | Prix unitaire |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de modification |

**Index :** `sku` (unique), `categoryId` (FK)
**Contrainte FK :** `categoryId` → `categories.id` (CASCADE DELETE)

### 4. **suppliers**
Fournisseurs de produits.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `name` | VARCHAR(255) | Nom du fournisseur |
| `email` | VARCHAR(320) | Email de contact |
| `phone` | VARCHAR(20) | Numéro de téléphone |
| `address` | TEXT | Adresse complète |
| `city` | VARCHAR(100) | Ville |
| `country` | VARCHAR(100) | Pays |
| `createdAt` | TIMESTAMP | Date de création |
| `updatedAt` | TIMESTAMP | Date de modification |

**Index :** `email` (pour recherche)

### 5. **product_suppliers** (Junction Table)
Relation many-to-many entre produits et fournisseurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `productId` | INT (FK) | Référence au produit |
| `supplierId` | INT (FK) | Référence au fournisseur |
| `supplierSku` | VARCHAR(100) | SKU chez le fournisseur |
| `leadTime` | INT | Délai de livraison (jours) |
| `createdAt` | TIMESTAMP | Date de création |

**Index :** `productId`, `supplierId` (composite unique)
**Contraintes FK :** `productId` → `products.id`, `supplierId` → `suppliers.id` (CASCADE DELETE)

### 6. **stock_movements**
Historique de tous les mouvements de stock.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `productId` | INT (FK) | Référence au produit |
| `movementType` | ENUM | Type : `adjustment`, `purchase`, `sale`, `return`, `damage` |
| `quantity` | INT | Quantité du mouvement |
| `reason` | VARCHAR(255) | Raison du mouvement |
| `createdAt` | TIMESTAMP | Date du mouvement |

**Index :** `productId`, `createdAt` (pour requêtes temporelles)
**Contrainte FK :** `productId` → `products.id` (CASCADE DELETE)

### 7. **notifications**
Notifications persistantes pour les utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `userId` | INT (FK) | Référence à l'utilisateur |
| `type` | VARCHAR(50) | Type : `stock_low`, `stock_critical`, `supplier_alert`, `system` |
| `title` | VARCHAR(255) | Titre de la notification |
| `message` | TEXT | Contenu du message |
| `productId` | INT (FK) | Référence produit (optionnel) |
| `supplierId` | INT (FK) | Référence fournisseur (optionnel) |
| `read` | ENUM | Statut : `true`, `false` |
| `createdAt` | TIMESTAMP | Date de création |

**Index :** `userId`, `read` (pour affichage)
**Contraintes FK :** `userId`, `productId`, `supplierId` (CASCADE DELETE)

### 8. **user_permissions**
Permissions granulaires par utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `userId` | INT (FK) | Référence à l'utilisateur |
| `resource` | VARCHAR(100) | Ressource : `products`, `suppliers`, `categories` |
| `action` | VARCHAR(50) | Action : `read`, `create`, `update`, `delete` |
| `createdAt` | TIMESTAMP | Date d'attribution |

**Index :** `userId`, `resource` (composite)
**Contrainte FK :** `userId` → `users.id` (CASCADE DELETE)

### 9. **import_history**
Historique des imports/exports.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK) | Identifiant unique |
| `userId` | INT (FK) | Utilisateur qui a effectué l'import |
| `type` | VARCHAR(50) | Type : `import_csv`, `export_csv`, `export_pdf` |
| `resourceType` | VARCHAR(100) | Ressource : `products`, `suppliers`, `reports` |
| `fileName` | VARCHAR(255) | Nom du fichier |
| `recordsProcessed` | INT | Nombre d'enregistrements traités |
| `status` | ENUM | Statut : `success`, `failed`, `partial` |
| `errorMessage` | TEXT | Message d'erreur (si applicable) |
| `createdAt` | TIMESTAMP | Date de l'opération |

**Index :** `userId`, `createdAt` (pour historique)
**Contrainte FK :** `userId` → `users.id` (CASCADE DELETE)

## Diagramme Relationnel

```
users (1) ──────┬──────── (N) notifications
                ├──────── (N) user_permissions
                └──────── (N) import_history

categories (1) ──────── (N) products

products (1) ──────┬──────── (N) stock_movements
                   └──────── (N) product_suppliers (N)

suppliers (1) ──────── (N) product_suppliers
```

## Migrations

Les migrations sont gérées avec **Drizzle Kit** :

```bash
# Générer les migrations
drizzle-kit generate

# Appliquer les migrations
drizzle-kit migrate

# Ou utiliser le raccourci
pnpm db:push
```

## Intégrité des Données

### Contraintes de Clés Étrangères
- **CASCADE DELETE** : Suppression automatique des enregistrements enfants
- **Exemple** : Supprimer une catégorie supprime tous ses produits

### Validations au Niveau Base de Données
- **Unique** : `users.openId`, `products.sku`, `suppliers.email`
- **Not Null** : Tous les champs critiques
- **Check** : Quantités positives, prix valides

### Transactions
Les opérations critiques (imports, suppressions en cascade) utilisent des transactions pour assurer la cohérence.

## Indexation

Les index sont créés pour optimiser les requêtes courantes :

| Table | Index | Utilité |
|-------|-------|---------|
| `products` | `categoryId` | Filtrer par catégorie |
| `products` | `sku` | Recherche par SKU |
| `stock_movements` | `productId, createdAt` | Historique par produit |
| `notifications` | `userId, read` | Affichage des notifications |
| `user_permissions` | `userId, resource` | Vérification des permissions |

## Performance

### Requêtes Optimisées
- Jointures préchargées pour éviter N+1
- Pagination côté base de données
- Agrégations directement en SQL

### Exemple : Obtenir les produits bas stock
```sql
SELECT p.*, c.name as categoryName
FROM products p
JOIN categories c ON p.categoryId = c.id
WHERE p.quantity < p.minStockLevel
ORDER BY p.quantity ASC
LIMIT 50;
```

## Sauvegarde et Récupération

La base de données est hébergée avec :
- Sauvegardes automatiques quotidiennes
- Réplication pour haute disponibilité
- Récupération point-in-time disponible

## Démarrage

```bash
# Initialiser la base de données
pnpm db:push

# Vérifier le schéma
drizzle-kit studio  # Interface web pour explorer
```

## Points Clés du Design

1. **Normalisation** : Évite la redondance et les anomalies
2. **Intégrité Référentielle** : Contraintes FK assurent la cohérence
3. **Performance** : Index stratégiques pour requêtes courantes
4. **Auditabilité** : Timestamps sur tous les enregistrements
5. **Scalabilité** : Structure prête pour millions de lignes
