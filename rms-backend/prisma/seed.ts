import 'dotenv/config';
import { PrismaClient, Role, MenuCategory, TableStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: { email: 'admin@restaurant.com', name: 'Admin User', password: adminPassword, role: Role.ADMIN },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@restaurant.com' },
    update: {},
    create: { email: 'staff@restaurant.com', name: 'Staff Member', password: staffPassword, role: Role.STAFF },
  });

  console.log('✅ Users created');

  // Create tables
  const tableData = [
    { tableNumber: 1, capacity: 2 },
    { tableNumber: 2, capacity: 4 },
    { tableNumber: 3, capacity: 4 },
    { tableNumber: 4, capacity: 6 },
    { tableNumber: 5, capacity: 6 },
    { tableNumber: 6, capacity: 8 },
    { tableNumber: 7, capacity: 2 },
    { tableNumber: 8, capacity: 4 },
  ];

  for (const t of tableData) {
    await prisma.restaurantTable.upsert({
      where: { tableNumber: t.tableNumber },
      update: {},
      create: t,
    });
  }

  console.log('✅ Tables created');

  // Create menu items
  const menuItems = [
    { name: 'Bruschetta', description: 'Toasted bread with tomatoes and basil', price: 8.99, category: MenuCategory.APPETIZER },
    { name: 'Calamari Fritti', description: 'Crispy fried squid with marinara sauce', price: 12.99, category: MenuCategory.APPETIZER },
    { name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan', price: 10.99, category: MenuCategory.APPETIZER },
    { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter sauce', price: 26.99, category: MenuCategory.MAIN_COURSE },
    { name: 'Beef Tenderloin', description: '8oz tenderloin with red wine reduction', price: 38.99, category: MenuCategory.MAIN_COURSE },
    { name: 'Chicken Marsala', description: 'Pan-seared chicken with mushroom marsala', price: 22.99, category: MenuCategory.MAIN_COURSE },
    { name: 'Pasta Carbonara', description: 'Spaghetti with pancetta and egg sauce', price: 18.99, category: MenuCategory.MAIN_COURSE },
    { name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella', price: 16.99, category: MenuCategory.MAIN_COURSE },
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso', price: 8.99, category: MenuCategory.DESSERT },
    { name: 'Crème Brûlée', description: 'Vanilla custard with caramelized sugar', price: 7.99, category: MenuCategory.DESSERT },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with vanilla ice cream', price: 9.99, category: MenuCategory.DESSERT },
    { name: 'Sparkling Water', description: 'San Pellegrino 500ml', price: 3.99, category: MenuCategory.BEVERAGE },
    { name: 'House Red Wine', description: 'Glass of Chianti Classico', price: 9.99, category: MenuCategory.BEVERAGE },
    { name: 'Espresso', description: 'Double shot espresso', price: 3.49, category: MenuCategory.BEVERAGE },
    { name: 'Chef\'s Special', description: 'Ask your server for today\'s special', price: 32.99, category: MenuCategory.SPECIAL },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: item.name.toLowerCase().replace(/\s+/g, '-'), ...item },
    });
  }

  console.log('✅ Menu items created');
  console.log('🎉 Seeding complete!');
  console.log('\nCredentials:');
  console.log('  Admin: admin@restaurant.com / admin123');
  console.log('  Staff: staff@restaurant.com / staff123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
