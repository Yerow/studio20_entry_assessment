import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { Users } from './collections/Users'
import { Posts } from './collections/Posts'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Blog 20 Admin',
    },
  },
  collections: [Users, Posts],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // On peux ajouter des features custom ici
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),
  cors: [
    process.env.NEXTAUTH_URL || 'http://localhost:3000'
  ],
  csrf: [
    process.env.NEXTAUTH_URL || 'http://localhost:3000'
  ],
})