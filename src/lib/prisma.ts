/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  let prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = (globalThis as any).prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') (globalThis as any).prismaGlobal = prisma
