// payload.config.ts - PayloadCMS v3
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

export default buildConfig({
  // Configuration admin
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Blog 20 Admin',
    },
  },
  
  // Collections
  collections: [
    // Collection Users avec auth
    {
      slug: 'users',
      auth: true, // PayloadCMS v3 syntaxe simplifiée
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'role', 'createdAt'],
        group: 'Admin',
      },
      access: {
        create: () => true,
        read: ({ req: { user } }) => {
          if (!user) return false
          if (user.role === 'admin') return true
          return { id: { equals: user.id } }
        },
        update: ({ req: { user } }) => {
          if (!user) return false
          if (user.role === 'admin') return true
          return { id: { equals: user.id } }
        },
        delete: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin'
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Nom complet',
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Auteur', value: 'author' },
            { label: 'Utilisateur', value: 'user' },
          ],
          defaultValue: 'user',
          required: true,
          admin: {
            position: 'sidebar',
          },
          access: {
            update: ({ req: { user } }) => {
              if (!user) return false
              return user.role === 'admin'
            },
          },
        },
        {
          name: 'avatar',
          type: 'text',
          label: 'Avatar URL (optionnel)',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Biographie',
          maxLength: 500,
        },
      ],
    },

    // Collection Posts
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'author', 'status', 'createdAt'],
        group: 'Contenu',
        pagination: {
          defaultLimit: 10,
        },
      },
      access: {
        read: ({ req: { user } }) => {
          // Approche simplifiée pour éviter les erreurs de typage
          if (!user) {
            return { status: { equals: 'published' } }
          }
          
          if (user.role === 'admin') {
            return true
          }
          
          // Pour les utilisateurs normaux, on retourne true et on filtre dans l'API
          return true
        },
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => {
          if (!user) return false
          if (user.role === 'admin') return true
          return { author: { equals: user.id } }
        },
        delete: ({ req: { user } }) => {
          if (!user) return false
          if (user.role === 'admin') return true
          return { author: { equals: user.id } }
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Titre du post',
          admin: {
            placeholder: 'Entrez le titre de votre article...',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          label: 'Contenu',
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => defaultFeatures,
          }),
        },
        {
          name: 'excerpt',
          type: 'textarea',
          maxLength: 200,
          label: 'Extrait',
          admin: {
            description: 'Courte description de l\'article (max 200 caractères)',
            placeholder: 'Résumé de votre article...',
          },
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Brouillon', value: 'draft' },
            { label: 'Publié', value: 'published' },
          ],
          defaultValue: 'draft',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            position: 'sidebar',
            date: {
              pickerAppearance: 'dayAndTime',
            },
            description: 'Date de publication',
          },
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          admin: {
            position: 'sidebar',
            description: 'URL de l\'article (généré automatiquement)',
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (data?.title && !value) {
                  return data.title
                    .toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '')
                    .substring(0, 50)
                }
                return value
              },
            ],
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            position: 'sidebar',
            description: 'Article mis en avant',
          },
        },
        {
          name: 'tags',
          type: 'text',
          hasMany: true,
          admin: {
            position: 'sidebar',
          },
        },
      ],
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            if (operation === 'create') {
              // Auto-assigner l'auteur
              if (!data.author && req.user) {
                data.author = req.user.id
              }
              // Auto-assigner la date de publication
              if (data.status === 'published' && !data.publishedAt) {
                data.publishedAt = new Date()
              }
            }
            return data
          },
        ],
      },
      versions: {
        drafts: {
          autosave: {
            interval: 30000,
          },
        },
      },
    },
  ],

  // Éditeur rich text
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => defaultFeatures,
  }),

  // Clé secrète
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  
  // Génération des types TypeScript
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  
  // Base de données
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),

  // CORS et CSRF
  cors: [
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),

  csrf: [
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
})