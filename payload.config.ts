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
  
  // Collections (vos données)
  collections: [
    // Collection Users (authentification)
    {
      slug: 'users',
      auth: {
        tokenExpiration: 7200, // 2 heures
        verify: false,
        maxLoginAttempts: 5,
        lockTime: 600 * 1000, // 10 minutes
      },
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'role', 'createdAt'],
        group: 'Admin',
      },
      access: {
        create: () => true, // Permet la création du premier utilisateur
        read: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin',
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
        },
      ],
    },

    // Collection Posts (articles de blog)
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
        read: () => true, // Tout le monde peut lire
        create: ({ req: { user } }) => !!user, // Utilisateurs connectés peuvent créer
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => user?.role === 'admin', // Seuls les admins peuvent supprimer
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
      ],
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            if (operation === 'create') {
              // Assigner l'auteur automatiquement
              if (req.user) {
                data.author = req.user.id
              }
              // Assigner la date de publication si l'article est publié
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
            interval: 30000, // Sauvegarde automatique toutes les 30 secondes
          },
        },
      },
    },
  ],

  // Éditeur rich text
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => defaultFeatures,
  }),

  // Clé secrète (importante pour la sécurité)
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  
  // Génération des types TypeScript
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  
  // Base de données
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),

  // CORS et CSRF pour la sécurité
  cors: [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),

  csrf: [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ].filter(Boolean),
})