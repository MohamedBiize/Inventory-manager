# Inventory Management System - Architecture Documentation

## Overview

This is a professional-grade inventory management system built with a **clean layered architecture** designed for clarity and maintainability. The system is perfect for a Web Architecture course as it demonstrates clear separation of concerns, proper data flow, and scalable design patterns.

## Architecture Layers

The application follows a **4-layer architecture pattern**:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│            Pages → Components → Hooks (tRPC)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  tRPC Router Layer                      │
│         (categoryRouter, productRouter, etc.)           │
│              Input Validation with Zod                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                         │
│    (categoryService, productService, supplierService)  │
│            Business Logic & Validation                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Repository Layer                        │
│   (categoryRepository, productRepository, etc.)        │
│              Data Access Abstraction                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Database Layer (Drizzle ORM)              │
│              MySQL/TiDB with 6 Tables                  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Example: Creating a Product

```
1. Frontend (ProductDialog.tsx)
   └─ User fills form and submits
   
2. tRPC Mutation (productRouter.ts)
   └─ Input validation with Zod schema
   └─ Calls productService.createProduct()
   
3. Service Layer (productService.ts)
   └─ Business logic validation
   └─ Verifies category exists
   └─ Checks for duplicate SKU
   └─ Calls productRepository.create()
   
4. Repository Layer (productRepository.ts)
   └─ Prepares database query
   └─ Calls getDb().insert()
   
5. Database Layer (Drizzle ORM)
   └─ Executes INSERT query
   └─ Returns created product
   
6. Response flows back up the chain
   └─ Frontend receives typed response
   └─ UI updates with new product
```

## Database Schema (6 Tables)

### 1. **users** - Authentication
- Stores OAuth user information
- Fields: id, openId, name, email, role, timestamps

### 2. **categories** - Product Categories
- Organizes products into logical groups
- Fields: id, name, description, timestamps
- Unique constraint on name

### 3. **products** - Product Inventory
- Core product information
- Fields: id, name, sku, description, categoryId, quantity, unitPrice, minStockLevel, timestamps
- Foreign key to categories
- Unique constraint on SKU

### 4. **suppliers** - Vendor Information
- Supplier contact details
- Fields: id, name, email, phone, address, city, country, timestamps
- Unique constraint on name

### 5. **product_suppliers** - Many-to-Many Relationship
- Links products to suppliers with supplier-specific pricing
- Fields: id, productId, supplierId, supplierSku, supplierPrice, leadTimeDays, timestamps
- Foreign keys to products and suppliers
- Unique constraint on (productId, supplierId)

### 6. **stock_movements** - Inventory Audit Trail
- Records all inventory changes
- Fields: id, productId, movementType, quantity, reason, createdAt
- Movement types: purchase, sale, adjustment, return, damage
- Foreign key to products

## Key Features

### Authentication & Security
- **OAuth Integration**: Manus OAuth for secure user authentication
- **JWT Tokens**: Session-based authentication with secure cookies
- **Protected Procedures**: All business operations require authentication
- **Role-Based Access**: Admin/User role support built-in

### Data Validation
- **Zod Schemas**: Type-safe input validation at tRPC layer
- **Service Layer Validation**: Business logic validation before database operations
- **Type Safety**: Full TypeScript typing from database to frontend

### UI Components
- **AG Grid Integration**: Professional data grid for products and suppliers
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dashboard Layout**: Sidebar navigation with collapsible menu
- **Form Dialogs**: Modal forms for creating/editing entities
- **Charts & Visualizations**: Recharts for inventory analytics

## File Structure

```
server/
├── repositories/           # Data access layer
│   ├── categoryRepository.ts
│   ├── productRepository.ts
│   ├── supplierRepository.ts
│   └── stockMovementRepository.ts
├── services/              # Business logic layer
│   ├── categoryService.ts
│   ├── productService.ts
│   ├── supplierService.ts
│   └── stockMovementService.ts
├── routers/               # tRPC API layer
│   ├── categoryRouter.ts
│   ├── productRouter.ts
│   ├── supplierRouter.ts
│   └── stockMovementRouter.ts
├── routers.ts            # Main router aggregation
└── db.ts                 # Database connection

client/src/
├── pages/                 # Page components
│   ├── Dashboard.tsx      # Main dashboard with statistics
│   ├── Products.tsx       # Product management with AG Grid
│   ├── Suppliers.tsx      # Supplier management with AG Grid
│   ├── Categories.tsx     # Category CRUD operations
│   └── Reports.tsx        # Analytics and visualizations
├── components/            # Reusable components
│   ├── ProductDialog.tsx  # Product create/edit form
│   ├── SupplierDialog.tsx # Supplier create/edit form
│   └── DashboardLayout.tsx # Main layout wrapper
└── lib/trpc.ts           # tRPC client setup

drizzle/
└── schema.ts             # Database schema definitions
```

## Code Quality

### Testing
- **Unit Tests**: Vitest for repository and service layers
- **Test Coverage**: Examples provided for all major operations
- **Mocking**: Database mocks for isolated testing

### Documentation
- **JSDoc Comments**: All functions documented with purpose and parameters
- **Type Definitions**: Full TypeScript interfaces for all data structures
- **Architecture Guide**: This document explains the design

### Best Practices
- **Separation of Concerns**: Each layer has a single responsibility
- **DRY Principle**: Reusable services and repositories
- **Error Handling**: Consistent error handling with meaningful messages
- **Input Validation**: Multiple validation layers (Zod → Service → Repository)

## API Endpoints (tRPC Procedures)

### Categories
- `categories.list()` - Get all categories
- `categories.get(id)` - Get single category
- `categories.create(data)` - Create category
- `categories.update(id, data)` - Update category
- `categories.delete(id)` - Delete category

### Products
- `products.list(filter?)` - Get products with optional filtering
- `products.get(id)` - Get single product
- `products.lowStock()` - Get low stock products
- `products.stats()` - Get inventory statistics
- `products.create(data)` - Create product
- `products.update(id, data)` - Update product
- `products.delete(id)` - Delete product

### Suppliers
- `suppliers.list()` - Get all suppliers
- `suppliers.get(id)` - Get single supplier
- `suppliers.create(data)` - Create supplier
- `suppliers.update(id, data)` - Update supplier
- `suppliers.delete(id)` - Delete supplier

### Stock Movements
- `stockMovements.list()` - Get all movements
- `stockMovements.byProduct(productId)` - Get movements for product
- `stockMovements.byDateRange(startDate, endDate)` - Get movements in date range
- `stockMovements.summary(productId)` - Get movement summary
- `stockMovements.totals(productId)` - Get total in/out quantities
- `stockMovements.record(data)` - Record new movement

## Running the Application

### Development
```bash
pnpm install
pnpm db:push          # Run migrations
pnpm dev              # Start dev server
```

### Testing
```bash
pnpm test             # Run vitest
pnpm check            # TypeScript type check
```

### Building
```bash
pnpm build            # Build for production
pnpm start            # Start production server
```

## Key Design Decisions

1. **tRPC over REST**: Type-safe API with automatic client generation
2. **Service Layer**: Centralizes business logic separate from data access
3. **Repository Pattern**: Abstracts database queries for easier testing
4. **AG Grid**: Professional data grid for complex data management
5. **Layered Architecture**: Clear separation enables easy testing and maintenance

## Scalability Considerations

- **Pagination**: Implemented in product repository for large datasets
- **Filtering**: Advanced filtering options for products by category, price, stock
- **Indexing**: Database indexes on frequently queried columns
- **Caching**: Can be added at service layer for expensive operations
- **Async Operations**: All database operations are async-ready

## Security Features

- **Input Validation**: Zod schemas prevent invalid data
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries
- **Authentication**: OAuth + JWT for secure access
- **Authorization**: Protected procedures require authentication
- **Type Safety**: TypeScript prevents runtime type errors

## Conclusion

This architecture provides a solid foundation for learning web application design patterns. The clear separation of layers makes it easy to understand data flow, test individual components, and scale the application as needed.
