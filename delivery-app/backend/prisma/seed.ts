import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { hash } from 'bcrypt'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Cleaning up database...')

    // Using deleteMany instead of executeRaw to avoid "table not found" errors due to case-sensitivity
    // and ensuring we delete in reverse order of dependency
    await prisma.menu.deleteMany()
    await prisma.vendors.deleteMany()
    await prisma.locations.deleteMany()

    console.log('Database cleared')
    console.log('Starting database seed...')

    // 1. Create delivery locations (Auto-generating IDs)
    const csLab = await prisma.locations.create({
        data: {
            name: 'CS Lab, Block 7',
            latitude: 5.759544610764003,
            longitude: -0.2202397965185288,
        },
    })

    const theHive = await prisma.locations.create({
        data: {
            name: 'The Hive',
            latitude: 5.758509439496953,
            longitude: -0.21980420737950218,
        },
    })

    const library = await prisma.locations.create({
        data: {
            name: 'Library',
            latitude: 5.759786765250098,
            longitude: -0.21981310866974965,
        },
    })

    const engineeringBlock = await prisma.locations.create({
        data: {
            name: 'Engineering Block',
            latitude: 5.759256616125967,
            longitude: -0.2195679687039781,
        },
    })

    console.log('Locations created')

    // 2. Create vendors (All linked to theHive.id)
    const akornor = await prisma.vendors.create({
        data: {
            name: 'Akornor Cafeteria',
            location_id: theHive.id,
            hours: '7:00 AM – 8:00 PM',
            description: 'Main campus dining — Jollof, Banku, local favorites',
            momo_number: '024 123 4567',
        },
    })

    const hallmark = await prisma.vendors.create({
        data: {
            name: 'Hallmark Cafeteria',
            location_id: theHive.id,
            hours: '6:30 AM – 9:00 PM',
            description: 'Waakye, Fufu, hearty meals',
            momo_number: '055 987 6543',
        },
    })

    const akofena = await prisma.vendors.create({
        data: {
            name: 'Akofena Cafeteria',
            location_id: theHive.id,
            hours: '7:00 AM – 7:00 PM',
            description: 'Quick bites — Kelewele, Spring Rolls, Sobolo',
            momo_number: '027 456 7890',
        },
    })

    const essentials = await prisma.vendors.create({
        data: {
            name: 'Essentials Shop',
            location_id: theHive.id,
            hours: '8:00 AM – 6:00 PM',
            description: 'Non-food items — chargers, notebooks, snack packs',
            momo_number: '059 321 0987',
        },
    })

    console.log('Vendors created')

    // 3. Helper to batch create menu items
    const createMenuItems = async (vendorId: string, items: any[]) => {
        for (const item of items) {
            await prisma.menu.create({
                data: {
                    vendor_id: vendorId,
                    name: item.name,
                    category: item.category as any,
                    unit_cost: item.price,
                    description: item.description,
                    thumbnail_url: item.thumbnail_url,
                    available: true,
                },
            })
        }
    }

    // --- AKORNOR MENU ITEMS ---
    console.log('Seeding Akornor items...')
    await createMenuItems(akornor.id, [
        {
            name: 'Jollof Rice',
            category: 'food',
            price: 15.0,
            description: 'Spicy West African rice dish',
            thumbnail_url:
                'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        },
        {
            name: 'Fried Rice & Chicken',
            category: 'food',
            price: 18.0,
            description: 'Savory fried rice with grilled chicken',
            thumbnail_url:
                'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
        },
        {
            name: 'Banku & Tilapia',
            category: 'food',
            price: 20.0,
            description: 'Fermented corn dough with grilled tilapia',
            thumbnail_url:
                'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
        },
        {
            name: 'Plain Rice & Stew',
            category: 'food',
            price: 12.0,
            description: 'White rice with tomato stew',
            thumbnail_url:
                'https://images.unsplash.com/photo-1516684732162-798a0062be99',
        },
        {
            name: 'Water (500ml)',
            category: 'drinks',
            price: 3.0,
            description: 'Bottled water',
            thumbnail_url:
                'https://images.unsplash.com/photo-1548839140-29a749e1cf4d',
        },
        {
            name: 'Coca-Cola',
            category: 'drinks',
            price: 5.0,
            description: 'Refreshing soda',
            thumbnail_url:
                'https://images.unsplash.com/photo-1554866585-cd94860890b7',
        },
        {
            name: 'Sobolo (Hibiscus)',
            category: 'drinks',
            price: 4.0,
            description: 'Refreshing hibiscus drink',
            thumbnail_url:
                'https://images.unsplash.com/photo-1556679343-c7306c1976bc',
        },
        {
            name: 'Fresh Juice',
            category: 'drinks',
            price: 7.0,
            description: 'Freshly squeezed juice',
            thumbnail_url:
                'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
        },
        {
            name: 'Kelewele',
            category: 'snacks',
            price: 5.0,
            description: 'Spicy fried plantains',
            thumbnail_url:
                'https://images.unsplash.com/photo-1587334207863-c8c85a3c362e',
        },
        {
            name: 'Meat Pie',
            category: 'snacks',
            price: 8.0,
            description: 'Savory meat-filled pastry',
            thumbnail_url:
                'https://images.unsplash.com/photo-1509440159596-0249088772ff',
        },
        {
            name: 'Spring Rolls (3pc)',
            category: 'snacks',
            price: 6.0,
            description: 'Crispy vegetable rolls',
            thumbnail_url:
                'https://images.unsplash.com/photo-1541529086526-db283c563270',
        },
    ])

    // --- HALLMARK MENU ITEMS ---
    console.log('Seeding Hallmark items...')
    await createMenuItems(hallmark.id, [
        {
            name: 'Waakye',
            category: 'food',
            price: 16.0,
            description: 'Rice and beans with sides',
            thumbnail_url:
                'https://images.unsplash.com/photo-1585032226651-759b368d7246',
        },
        {
            name: 'Fufu & Light Soup',
            category: 'food',
            price: 22.0,
            description: 'Pounded cassava with goat light soup',
            thumbnail_url:
                'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        },
        {
            name: 'Red Red',
            category: 'food',
            price: 14.0,
            description: 'Black-eyed peas stew with fried plantain',
            thumbnail_url:
                'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26',
        },
        {
            name: 'Kenkey & Fish',
            category: 'food',
            price: 18.0,
            description: 'Fermented corn dough with fish',
            thumbnail_url:
                'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
        },
        {
            name: 'Malta Guinness',
            category: 'drinks',
            price: 6.0,
            description: 'Non-alcoholic malt drink',
            thumbnail_url:
                'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3',
        },
        {
            name: 'Malt',
            category: 'drinks',
            price: 5.0,
            description: 'Malt beverage',
            thumbnail_url:
                'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3',
        },
        {
            name: 'Asaana (Corn Drink)',
            category: 'drinks',
            price: 4.0,
            description: 'Traditional corn beverage',
            thumbnail_url:
                'https://images.unsplash.com/photo-1556679343-c7306c1976bc',
        },
        {
            name: 'Bofrot (3pc)',
            category: 'snacks',
            price: 3.0,
            description: 'Sweet fried dough balls',
            thumbnail_url:
                'https://images.unsplash.com/photo-1603532648955-039310d9ed75',
        },
    ])

    // --- AKOFENA MENU ITEMS ---
    console.log('Seeding Akofena items...')
    await createMenuItems(akofena.id, [
        {
            name: 'Chicken Shawarma',
            category: 'food',
            price: 15.0,
            description: 'Grilled chicken wrap',
            thumbnail_url:
                'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
        },
        {
            name: 'Beef Burger',
            category: 'food',
            price: 20.0,
            description: 'Juicy beef burger',
            thumbnail_url:
                'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        },
        {
            name: 'Club Sandwich',
            category: 'food',
            price: 18.0,
            description: 'Triple-decker sandwich',
            thumbnail_url:
                'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
        },
        {
            name: 'Kelewele',
            category: 'snacks',
            price: 5.0,
            description: 'Spicy fried plantains',
            thumbnail_url:
                'https://images.unsplash.com/photo-1587334207863-c8c85a3c362e',
        },
        {
            name: 'Spring Rolls (3pc)',
            category: 'snacks',
            price: 6.0,
            description: 'Crispy vegetable rolls',
            thumbnail_url:
                'https://images.unsplash.com/photo-1541529086526-db283c563270',
        },
        {
            name: 'Chicken Wings (5pc)',
            category: 'snacks',
            price: 12.0,
            description: 'Crispy chicken wings',
            thumbnail_url:
                'https://images.unsplash.com/photo-1608039829572-78524f79c4c7',
        },
        {
            name: 'Sobolo',
            category: 'drinks',
            price: 4.0,
            description: 'Refreshing hibiscus drink',
            thumbnail_url:
                'https://images.unsplash.com/photo-1556679343-c7306c1976bc',
        },
        {
            name: 'Iced Tea',
            category: 'drinks',
            price: 5.0,
            description: 'Chilled tea',
            thumbnail_url:
                'https://images.unsplash.com/photo-1556679343-c7306c1976bc',
        },
        {
            name: 'Smoothie',
            category: 'drinks',
            price: 10.0,
            description: 'Fresh fruit smoothie',
            thumbnail_url:
                'https://images.unsplash.com/photo-1505252585461-04db1eb84625',
        },
    ])

    // --- ESSENTIALS SHOP ITEMS ---
    console.log('Seeding Essentials items...')
    await createMenuItems(essentials.id, [
        {
            name: 'Phone Charger (Type-C)',
            category: 'electronics',
            price: 25.0,
            description: 'USB Type-C charger',
            thumbnail_url:
                'https://images.unsplash.com/photo-1583863788434-e58a36330cf0',
        },
        {
            name: 'Notebook (A4)',
            category: 'stationery',
            price: 8.0,
            description: 'A4 ruled notebook',
            thumbnail_url:
                'https://images.unsplash.com/photo-1531346878377-a5be20888e57',
        },
        {
            name: 'Pen Pack (5pc)',
            category: 'stationery',
            price: 5.0,
            description: 'Pack of 5 ballpoint pens',
            thumbnail_url:
                'https://images.unsplash.com/photo-1586075010923-2dd4570fb338',
        },
        {
            name: 'Snack Pack',
            category: 'snacks',
            price: 10.0,
            description: 'Assorted snacks',
            thumbnail_url:
                'https://images.unsplash.com/photo-1621939514649-280e2ee25f60',
        },
        {
            name: 'Energy Drink',
            category: 'drinks',
            price: 7.0,
            description: 'Energy boost drink',
            thumbnail_url:
                'https://images.unsplash.com/photo-1622543925917-763c34f1f0a2',
        },
        {
            name: 'Hand Sanitizer',
            category: 'stationery',
            price: 12.0,
            description: 'Antibacterial hand sanitizer',
            thumbnail_url:
                'https://images.unsplash.com/photo-1584744982491-665216d95f8b',
        },
    ])

    console.log('All menu items created')

    // Create default admin user for testing if none exists
    const adminEmail = 'admin@ecodrone.test'
    const existingAdmin = await prisma.users.findFirst({
        where: { email: adminEmail },
    })
    if (!existingAdmin) {
        const adminPasswordHash = await hash('admin123', 10)
        await prisma.users.create({
            data: {
                email: adminEmail,
                password_hash: adminPasswordHash,
                first_name: 'Admin',
                last_name: 'User',
                type: 'admin',
                should_reset_password: false,
            },
        })
        console.log('Default admin user created (admin@ecodrone.test / admin123)')
    }

    console.log('Database seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
