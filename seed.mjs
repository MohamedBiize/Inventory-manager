/**
 * Database Seed Script
 * Populates the database with realistic test data for development and testing.
 * 
 * Usage: node seed.mjs
 * 
 * This script creates:
 * - 5 product categories
 * - 15 products with varying prices and quantities
 * - 5 suppliers with contact information
 * - Product-supplier relationships
 * - Initial stock movements
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

/**
 * Parse MySQL connection string
 */
function parseConnectionString(url) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      user: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.slice(1),
      port: urlObj.port || 3306,
      ssl: {}, // Required for TiDB Cloud - empty object enables SSL
    };
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    process.exit(1);
  }
}

/**
 * Test data definitions
 */
const testData = {
  categories: [
    { name: 'Electronics', description: 'Electronic devices and components' },
    { name: 'Office Supplies', description: 'Stationery and office equipment' },
    { name: 'Furniture', description: 'Office and industrial furniture' },
    { name: 'Tools & Equipment', description: 'Hand tools and power equipment' },
    { name: 'Packaging Materials', description: 'Boxes, tape, and packaging supplies' },
  ],

  suppliers: [
    {
      name: 'TechSupply Co.',
      email: 'contact@techsupply.com',
      phone: '+1-555-0101',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'USA',
    },
    {
      name: 'Global Distributors Ltd',
      email: 'sales@globaldist.com',
      phone: '+44-20-7946-0958',
      address: '456 Commerce Road',
      city: 'London',
      country: 'UK',
    },
    {
      name: 'Asian Manufacturing Inc',
      email: 'export@asianmfg.com',
      phone: '+86-10-1234-5678',
      address: '789 Industrial Park',
      city: 'Shanghai',
      country: 'China',
    },
    {
      name: 'European Office Solutions',
      email: 'info@euoffice.eu',
      phone: '+33-1-42-68-53-00',
      address: '321 Business Avenue',
      city: 'Paris',
      country: 'France',
    },
    {
      name: 'Premium Equipment Traders',
      email: 'orders@premiumequip.com',
      phone: '+1-555-0199',
      address: '654 Industrial Blvd',
      city: 'Chicago',
      country: 'USA',
    },
  ],

  products: [
    // Electronics
    {
      sku: 'ELEC-001',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with USB receiver',
      categoryId: 1,
      quantity: 150,
      minStockLevel: 50,
      unitPrice: 25.99,
    },
    {
      sku: 'ELEC-002',
      name: 'USB-C Hub',
      description: 'Multi-port USB-C hub with HDMI and SD card reader',
      categoryId: 1,
      quantity: 85,
      minStockLevel: 30,
      unitPrice: 49.99,
    },
    {
      sku: 'ELEC-003',
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with Cherry MX switches',
      categoryId: 1,
      quantity: 42,
      minStockLevel: 20,
      unitPrice: 129.99,
    },
    {
      sku: 'ELEC-004',
      name: 'Webcam 1080p',
      description: 'Full HD webcam with auto-focus and noise cancellation',
      categoryId: 1,
      quantity: 28,
      minStockLevel: 15,
      unitPrice: 79.99,
    },

    // Office Supplies
    {
      sku: 'OFF-001',
      name: 'A4 Paper (500 sheets)',
      description: 'Premium white A4 copy paper',
      categoryId: 2,
      quantity: 500,
      minStockLevel: 200,
      unitPrice: 5.99,
    },
    {
      sku: 'OFF-002',
      name: 'Ballpoint Pens (Box of 50)',
      description: 'Blue ballpoint pens, smooth writing',
      categoryId: 2,
      quantity: 1200,
      minStockLevel: 300,
      unitPrice: 12.99,
    },
    {
      sku: 'OFF-003',
      name: 'Desk Organizer',
      description: 'Multi-compartment desk organizer',
      categoryId: 2,
      quantity: 75,
      minStockLevel: 25,
      unitPrice: 34.99,
    },

    // Furniture
    {
      sku: 'FURN-001',
      name: 'Ergonomic Office Chair',
      description: 'Height-adjustable chair with lumbar support',
      categoryId: 3,
      quantity: 12,
      minStockLevel: 5,
      unitPrice: 299.99,
    },
    {
      sku: 'FURN-002',
      name: 'Standing Desk',
      description: 'Electric standing desk with memory presets',
      categoryId: 3,
      quantity: 8,
      minStockLevel: 3,
      unitPrice: 599.99,
    },
    {
      sku: 'FURN-003',
      name: 'Filing Cabinet',
      description: '4-drawer metal filing cabinet',
      categoryId: 3,
      quantity: 15,
      minStockLevel: 5,
      unitPrice: 199.99,
    },

    // Tools & Equipment
    {
      sku: 'TOOL-001',
      name: 'Power Drill',
      description: '20V cordless drill with battery and charger',
      categoryId: 4,
      quantity: 22,
      minStockLevel: 10,
      unitPrice: 89.99,
    },
    {
      sku: 'TOOL-002',
      name: 'Tool Set (100 pieces)',
      description: 'Comprehensive tool set in carrying case',
      categoryId: 4,
      quantity: 18,
      minStockLevel: 8,
      unitPrice: 149.99,
    },
    {
      sku: 'TOOL-003',
      name: 'Measuring Tape (25m)',
      description: 'Retractable measuring tape with lock',
      categoryId: 4,
      quantity: 95,
      minStockLevel: 30,
      unitPrice: 15.99,
    },

    // Packaging Materials
    {
      sku: 'PKG-001',
      name: 'Cardboard Boxes (100 pack)',
      description: 'Standard brown cardboard boxes 20x15x10cm',
      categoryId: 5,
      quantity: 300,
      minStockLevel: 100,
      unitPrice: 24.99,
    },
    {
      sku: 'PKG-002',
      name: 'Packing Tape (6 rolls)',
      description: 'Clear packing tape 48mm x 50m',
      categoryId: 5,
      quantity: 450,
      minStockLevel: 150,
      unitPrice: 8.99,
    },
  ],

  productSuppliers: [
    // Electronics suppliers
    { productId: 1, supplierId: 1, supplierSku: 'TS-MOUSE-001', supplierPrice: 18.99, leadTimeDays: 7 },
    { productId: 2, supplierId: 1, supplierSku: 'TS-HUB-001', supplierPrice: 35.99, leadTimeDays: 5 },
    { productId: 3, supplierId: 3, supplierSku: 'AMI-KB-001', supplierPrice: 95.99, leadTimeDays: 14 },
    { productId: 4, supplierId: 1, supplierSku: 'TS-CAM-001', supplierPrice: 59.99, leadTimeDays: 7 },

    // Office supplies suppliers
    { productId: 5, supplierId: 2, supplierSku: 'GD-PAPER-A4', supplierPrice: 3.99, leadTimeDays: 3 },
    { productId: 6, supplierId: 2, supplierSku: 'GD-PENS-50', supplierPrice: 8.99, leadTimeDays: 3 },
    { productId: 7, supplierId: 4, supplierSku: 'EOS-ORG-001', supplierPrice: 24.99, leadTimeDays: 5 },

    // Furniture suppliers
    { productId: 8, supplierId: 4, supplierSku: 'EOS-CHAIR-001', supplierPrice: 199.99, leadTimeDays: 10 },
    { productId: 9, supplierId: 4, supplierSku: 'EOS-DESK-001', supplierPrice: 449.99, leadTimeDays: 14 },
    { productId: 10, supplierId: 2, supplierSku: 'GD-CABINET-001', supplierPrice: 149.99, leadTimeDays: 7 },

    // Tools suppliers
    { productId: 11, supplierId: 5, supplierSku: 'PET-DRILL-001', supplierPrice: 64.99, leadTimeDays: 5 },
    { productId: 12, supplierId: 5, supplierSku: 'PET-TOOLSET-001', supplierPrice: 109.99, leadTimeDays: 7 },
    { productId: 13, supplierId: 5, supplierSku: 'PET-TAPE-001', supplierPrice: 11.99, leadTimeDays: 3 },

    // Packaging suppliers
    { productId: 14, supplierId: 3, supplierSku: 'AMI-BOX-001', supplierPrice: 18.99, leadTimeDays: 10 },
    { productId: 15, supplierId: 2, supplierSku: 'GD-TAPE-001', supplierPrice: 6.99, leadTimeDays: 3 },
  ],

  stockMovements: [
    // Initial purchase movements
    { productId: 1, movementType: 'purchase', quantity: 150, reason: 'Initial stock purchase' },
    { productId: 2, movementType: 'purchase', quantity: 85, reason: 'Initial stock purchase' },
    { productId: 3, movementType: 'purchase', quantity: 50, reason: 'Initial stock purchase' },
    { productId: 4, movementType: 'purchase', quantity: 30, reason: 'Initial stock purchase' },
    { productId: 5, movementType: 'purchase', quantity: 500, reason: 'Initial stock purchase' },
    { productId: 6, movementType: 'purchase', quantity: 1200, reason: 'Initial stock purchase' },
    { productId: 7, movementType: 'purchase', quantity: 75, reason: 'Initial stock purchase' },
    { productId: 8, movementType: 'purchase', quantity: 15, reason: 'Initial stock purchase' },
    { productId: 9, movementType: 'purchase', quantity: 10, reason: 'Initial stock purchase' },
    { productId: 10, movementType: 'purchase', quantity: 20, reason: 'Initial stock purchase' },
    { productId: 11, movementType: 'purchase', quantity: 25, reason: 'Initial stock purchase' },
    { productId: 12, movementType: 'purchase', quantity: 20, reason: 'Initial stock purchase' },
    { productId: 13, movementType: 'purchase', quantity: 100, reason: 'Initial stock purchase' },
    { productId: 14, movementType: 'purchase', quantity: 300, reason: 'Initial stock purchase' },
    { productId: 15, movementType: 'purchase', quantity: 500, reason: 'Initial stock purchase' },

    // Sample sales
    { productId: 1, movementType: 'sale', quantity: -5, reason: 'Customer order #001' },
    { productId: 2, movementType: 'sale', quantity: -3, reason: 'Customer order #002' },
    { productId: 5, movementType: 'sale', quantity: -50, reason: 'Bulk order from ABC Corp' },
    { productId: 6, movementType: 'sale', quantity: -100, reason: 'Bulk order from ABC Corp' },
    { productId: 8, movementType: 'sale', quantity: -3, reason: 'Customer order #003' },

    // Adjustments
    { productId: 3, movementType: 'adjustment', quantity: -8, reason: 'Inventory count discrepancy' },
    { productId: 11, movementType: 'adjustment', quantity: -3, reason: 'Damaged units removed' },
    { productId: 14, movementType: 'adjustment', quantity: 50, reason: 'Recount correction' },
  ],
};

/**
 * Main seed function
 */
async function seed() {
  const config = parseConnectionString(DATABASE_URL);
  let connection;

  try {
    console.log('🌱 Starting database seed...\n');

    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Seed categories
    console.log('📁 Seeding categories...');
    for (const category of testData.categories) {
      await connection.execute(
        'INSERT INTO categories (name, description, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
        [category.name, category.description]
      );
    }
    console.log(`✅ Created ${testData.categories.length} categories\n`);

    // Seed suppliers
    console.log('🏢 Seeding suppliers...');
    for (const supplier of testData.suppliers) {
      await connection.execute(
        'INSERT INTO suppliers (name, email, phone, address, city, country, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [supplier.name, supplier.email, supplier.phone, supplier.address, supplier.city, supplier.country]
      );
    }
    console.log(`✅ Created ${testData.suppliers.length} suppliers\n`);

    // Seed products
    console.log('📦 Seeding products...');
    for (const product of testData.products) {
      await connection.execute(
        'INSERT INTO products (sku, name, description, categoryId, quantity, minStockLevel, unitPrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          product.sku,
          product.name,
          product.description,
          product.categoryId,
          product.quantity,
          product.minStockLevel,
          product.unitPrice,
        ]
      );
    }
    console.log(`✅ Created ${testData.products.length} products\n`);

    // Seed product-supplier relationships
    console.log('🔗 Seeding product-supplier relationships...');
    for (const ps of testData.productSuppliers) {
      await connection.execute(
        'INSERT INTO product_suppliers (productId, supplierId, supplierSku, supplierPrice, leadTimeDays, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
        [ps.productId, ps.supplierId, ps.supplierSku, ps.supplierPrice, ps.leadTimeDays]
      );
    }
    console.log(`✅ Created ${testData.productSuppliers.length} product-supplier relationships\n`);

    // Seed stock movements
    console.log('📊 Seeding stock movements...');
    for (const movement of testData.stockMovements) {
      await connection.execute(
        'INSERT INTO stock_movements (productId, movementType, quantity, reason, createdAt) VALUES (?, ?, ?, ?, NOW())',
        [movement.productId, movement.movementType, movement.quantity, movement.reason]
      );
    }
    console.log(`✅ Created ${testData.stockMovements.length} stock movements\n`);

    console.log('🎉 Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${testData.categories.length} categories`);
    console.log(`   - ${testData.suppliers.length} suppliers`);
    console.log(`   - ${testData.products.length} products`);
    console.log(`   - ${testData.productSuppliers.length} product-supplier relationships`);
    console.log(`   - ${testData.stockMovements.length} stock movements\n`);
    console.log('💡 Tip: Log in to the application to see the seeded data in action!\n');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the seed
seed();
