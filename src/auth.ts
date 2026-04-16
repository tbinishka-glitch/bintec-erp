import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import path from 'path'

function getDb() {
  const rawPath = process.env.DATABASE_URL?.replace('file:', '') ?? 'prisma/leeds_v2.db'
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath)
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  return new PrismaClient({ adapter })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        employeeNo: { label: 'Employee No', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.employeeNo) return null

        const db = getDb()
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: { role: true, organization: true },
          })

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password,
          )

          if (!passwordsMatch) return null

          // Verify if either the Email OR the Employee Number matches the user record
          const emailMatch = user.email === credentials.email
          const empNoMatch = user.staffId === credentials.employeeNo

          if (!emailMatch && !empNoMatch) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roleId: user.roleId,
            roleName: user.role?.name,
            organizationId: user.organizationId,
            branchId: user.branchId,
            forcePasswordChange: user.forcePasswordChange,
            employeeCategoryId: user.employeeCategoryId,
          }
        } finally {
          await db.$disconnect()
        }
      },
    }),
  ],
})
