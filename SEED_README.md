# Database Seed Script

## Overview

The `seed.mjs` script populates your inventory management database with realistic test data for development and testing purposes.

## What Gets Seeded

The script creates the following test data:

- **5 Product Categories**: Electronics, Office Supplies, Furniture, Tools & Equipment, Packaging Materials
- **15 Products**: With realistic names, SKUs, prices, and quantities across all categories
- **5 Suppliers**: With complete contact information (email, phone, address, city, country)
- **15 Product-Supplier Relationships**: Linking products to suppliers with supplier-specific SKUs and lead times
- **23 Stock Movements**: Initial purchases, sample sales, and inventory adjustments

## Running the Seed

### Prerequisites

Ensure your environment variables are configured:
- `DATABASE_URL` must be set in your `.env` file

### Execute the Seed

```bash
# From the project root directory
node seed.mjs
```

### Expected Output

```
🌱 Starting database seed...
✅ Connected to database
📁 Seeding categories...
✅ Created 5 categories
🏢 Seeding suppliers...
✅ Created 5 suppliers
📦 Seeding products...
✅ Created 15 products
🔗 Seeding product-supplier relationships...
✅ Created 15 product-supplier relationships
📊 Seeding stock movements...
✅ Created 23 stock movements
🎉 Database seed completed successfully!
```

## Sample Data Details

### Categories
- Electronics
- Office Supplies
- Furniture
- Tools & Equipment
- Packaging Materials

### Sample Products

| SKU | Name | Category | Quantity | Min Stock | Unit Price |
|-----|------|----------|----------|-----------|------------|
| ELEC-001 | Wireless Mouse | Electronics | 150 | 50 | $25.99 |
| OFF-001 | A4 Paper (500 sheets) | Office Supplies | 500 | 200 | $5.99 |
| FURN-001 | Ergonomic Office Chair | Furniture | 12 | 5 | $299.99 |
| TOOL-001 | Power Drill | Tools & Equipment | 22 | 10 | $89.99 |
| PKG-001 | Cardboard Boxes (100 pack) | Packaging Materials | 300 | 100 | $24.99 |

### Sample Suppliers

| Name | Email | Country |
|------|-------|---------|
| TechSupply Co. | contact@techsupply.com | USA |
| Global Distributors Ltd | sales@globaldist.com | UK |
| Asian Manufacturing Inc | export@asianmfg.com | China |
| European Office Solutions | info@euoffice.eu | France |
| Premium Equipment Traders | orders@premiumequip.com | USA |

## Clearing the Database

If you need to clear the database before reseeding:

```bash
# Using the seed script will automatically handle conflicts
# Or manually truncate tables (be careful with foreign keys):

SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE notifications;
TRUNCATE TABLE product_suppliers;
TRUNCATE TABLE products;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS=1;
```

## Testing the Seeded Data

After running the seed script:

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Log in to the application** with your OAuth credentials

3. **Navigate to different pages** to see the seeded data:
   - **Dashboard**: View statistics (Total Products, Stock Value, Low Stock alerts)
   - **Products**: Browse the 15 seeded products in AG Grid
   - **Suppliers**: View the 5 seeded suppliers
   - **Categories**: See the 5 product categories
   - **Reports**: Check stock movement visualizations

## Features to Test

- **Filtering**: Use AG Grid filters to search products by name, SKU, or category
- **Sorting**: Sort products by price, quantity, or other columns
- **Editing**: Edit product quantities and prices (changes are tracked in stock movements)
- **Stock Alerts**: Products with quantity below `minStockLevel` are highlighted
- **Real-time Notifications**: WebSocket alerts for low stock items

## Notes

- The seed script uses SSL/TLS for database connections (required for TiDB Cloud)
- All timestamps are set to the current time when seeding
- Stock movements include purchase, sale, and adjustment types
- Supplier prices are typically 20-30% lower than retail prices

## Troubleshooting

### "Duplicate entry" error
The database already contains data. Clear it first using the SQL commands above.

### "Unknown column" error
Your database schema may not be up to date. Run migrations:
```bash
pnpm db:push
```

### Connection errors
Verify your `DATABASE_URL` is correct and includes SSL configuration for TiDB Cloud.

## Next Steps

After seeding, you can:
1. Test the import/export functionality with the seeded data
2. Create additional products and suppliers through the UI
3. Test WebSocket notifications by updating product quantities
4. Generate reports based on the seeded stock movements
