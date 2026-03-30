/**
 * Creates the default admin user if it doesn't exist.
 * Does not modify any other data.
 *
 * Usage: npx ts-node src/scripts/create-admin.ts
 * Or:    npm run create-admin
 *
 * Default credentials: admin@ecodrone.test / admin123
 */
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { hash } from 'bcrypt'

dotenv.config()

const DEFAULT_ADMIN_EMAIL = 'admin@ashesi.edu.gh'
const DEFAULT_ADMIN_PASSWORD = 'password'

async function main() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        console.error('DATABASE_URL is not set')
        process.exit(1)
    }

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const existing = await prisma.users.findFirst({
        where: { email: DEFAULT_ADMIN_EMAIL },
    })

    if (existing) {
        console.log(`Admin already exists: ${DEFAULT_ADMIN_EMAIL}`)
        await prisma.$disconnect()
        return
    }

    const passwordHash = await hash(DEFAULT_ADMIN_PASSWORD, 10)
    await prisma.users.create({
        data: {
            email: DEFAULT_ADMIN_EMAIL,
            password_hash: passwordHash,
            first_name: 'Admin',
            last_name: 'User',
            type: 'admin',
            should_reset_password: false,
        },
    })

    console.log(`Admin account created: ${DEFAULT_ADMIN_EMAIL}`)
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`)
    console.log('You can sign in at POST /auth/signIn with these credentials.')

    await prisma.$disconnect()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
