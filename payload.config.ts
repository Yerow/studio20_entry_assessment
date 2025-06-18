import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

export default buildConfig({
  admin: {
    user: 'users',
  },

  // Configuration CSRF et CORS - Simplifiée
  csrf: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],

  cors: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
  ],

  serverURL: 'http://localhost:3000',

  collections: [
    // Collection Users - Permissions très ouvertes
    {
      slug: 'users',
      auth: {
        verify: false,
        tokenExpiration: 7200,
      },
      admin: {
        useAsTitle: 'name',
      },
      // Permissions très permissives pour éviter les erreurs
      access: {
        create: () => true,
        read: () => true,
        update: () => true,
        delete: ({ req: { user } }) => user?.role === 'admin',
        admin: () => true, // Tout le monde peut accéder à l'admin temporairement
      },
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            // S'assurer que le rôle est valide
            if (operation === 'create' && !req.user) {
              if (!data.role || !['member', 'author', 'admin'].includes(data.role)) {
                data.role = 'member'
              }
            }
            return data
          },
        ],
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'member',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Author', value: 'author' },
            { label: 'Member', value: 'member' },
          ],
        },
        {
          name: 'bio',
          type: 'textarea',
        },
      ],
    },

    // Collection Posts - Permissions très ouvertes
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
      },
      // Permissions très permissives pour éviter les erreurs
      access: {
        create: ({ req: { user } }) => !!user, // Tout utilisateur connecté
        read: () => true, // Tout le monde peut lire
        update: () => true, // Tout le monde peut modifier (temporaire)
        delete: () => true, // Tout le monde peut supprimer (temporaire)
      },
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            // Auto-assigner l'auteur
            if (operation === 'create' && req.user) {
              data.author = req.user.id
            }
            return data
          },
        ],
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          editor: lexicalEditor({}),
        },
        {
          name: 'excerpt',
          type: 'textarea',
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'published',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
        },
        {
          name: 'publishedAt',
          type: 'date',
        },
      ],
    },
  ],

  // Configuration de base
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),

  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET!,
  
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
})