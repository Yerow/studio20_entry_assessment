import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

export default buildConfig({
  // Configuration admin simplifiée
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Blog 20 Admin',
    },
  },

  // Collections avec configuration correcte
  collections: [
    // Collection Users
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'role', 'createdAt'],
        group: 'Administration',
        listSearchableFields: ['name', 'email'],
        description: 'Gérer les utilisateurs de la plateforme Blog 20',
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
            { label: '👑 Admin', value: 'admin' },
            { label: '✍️ Auteur', value: 'author' },
            { label: '👤 Utilisateur', value: 'user' },
          ],
          defaultValue: 'user',
          required: true,
          admin: {
            position: 'sidebar',
            description: 'Définit les permissions de l\'utilisateur',
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
          label: 'Avatar URL',
          admin: {
            position: 'sidebar',
            placeholder: 'https://example.com/avatar.jpg',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Biographie',
          maxLength: 500,
          admin: {
            description: 'Une courte description de l\'utilisateur',
          },
        },
        // Statistiques groupées
        {
          name: 'stats',
          type: 'group',
          label: 'Statistiques',
          admin: {
            position: 'sidebar',
          },
          fields: [
            {
              name: 'postCount',
              type: 'number',
              label: 'Nombre de posts',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'lastLoginAt',
              type: 'date',
              label: 'Dernière connexion',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
      hooks: {
        afterLogin: [
          async ({ req, user }) => {
            // Mettre à jour la dernière connexion
            try {
              await req.payload.update({
                collection: 'users',
                id: user.id,
                data: {
                  'stats.lastLoginAt': new Date(),
                },
              })
            } catch (error) {
              console.error('Error updating last login:', error)
            }
          }
        ],
      },
    },

    // Collection Posts corrigée
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'author', 'status', 'publishedAt', 'createdAt'],
        group: 'Contenu',
        listSearchableFields: ['title', 'excerpt'],
        description: 'Gérer les articles du blog',
        pagination: {
          defaultLimit: 25,
        },
      },
      access: {
        read: ({ req: { user } }) => {
          if (!user) {
            return { status: { equals: 'published' } }
          }
          if (user.role === 'admin') return true
          return true // Simplification pour éviter les erreurs
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
            placeholder: 'Entrez un titre accrocheur...',
            description: 'Le titre apparaîtra sur la page d\'accueil et dans les résultats de recherche',
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
            description: 'Résumé affiché sur la page d\'accueil (max 200 caractères)',
            placeholder: 'Décrivez brièvement votre article...',
          },
        },
        
        // Sidebar fields
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
            { label: '📝 Brouillon', value: 'draft' },
            { label: '👀 En révision', value: 'review' },
            { label: '✅ Publié', value: 'published' },
            { label: '🔒 Archivé', value: 'archived' },
          ],
          defaultValue: 'draft',
          admin: {
            position: 'sidebar',
            description: 'Statut de publication de l\'article',
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
            description: 'Date et heure de publication',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            position: 'sidebar',
            description: 'Mettre en avant sur la page d\'accueil',
          },
        },
        
        // Métadonnées
        {
          name: 'slug',
          type: 'text',
          unique: true,
          label: 'URL (slug)',
          admin: {
            position: 'sidebar',
            description: 'URL de l\'article (généré automatiquement depuis le titre)',
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (data?.title && !value) {
                  return data.title
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                    .substring(0, 50)
                }
                return value
              },
            ],
          },
        },
        {
          name: 'tags',
          type: 'text',
          hasMany: true,
          label: 'Tags',
          admin: {
            position: 'sidebar',
            description: 'Mots-clés pour catégoriser l\'article',
          },
        },

        // SEO
        {
          name: 'seo',
          type: 'group',
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              label: 'Meta Title',
              maxLength: 60,
              admin: {
                description: 'Titre affiché dans les résultats de recherche (max 60 caractères)',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Meta Description',
              maxLength: 160,
              admin: {
                description: 'Description affichée dans les résultats de recherche (max 160 caractères)',
              },
            },
            {
              name: 'ogImage',
              type: 'text',
              label: 'Image Open Graph',
              admin: {
                placeholder: 'https://example.com/image.jpg',
                description: 'Image affichée lors du partage sur les réseaux sociaux',
              },
            },
          ],
        },

        // Analytics (read-only)
        {
          name: 'analytics',
          type: 'group',
          label: 'Statistiques',
          admin: {
            position: 'sidebar',
          },
          fields: [
            {
              name: 'views',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'likes',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'shares',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
      
      // Hooks pour automatiser les tâches
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            // Auto-assigner l'auteur lors de la création
            if (operation === 'create' && !data.author && req.user) {
              data.author = req.user.id
            }
            
            // Auto-assigner la date de publication
            if (data.status === 'published' && !data.publishedAt) {
              data.publishedAt = new Date()
            }
            
            return data
          },
        ],
        afterChange: [
          async ({ req, doc, operation }) => {
            // Mettre à jour le compteur de posts de l'auteur
            if (operation === 'create' && doc.author) {
              try {
                const author = await req.payload.findByID({
                  collection: 'users',
                  id: doc.author,
                })
                
                if (author) {
                  await req.payload.update({
                    collection: 'users',
                    id: doc.author,
                    data: {
                      'stats.postCount': (author.stats?.postCount || 0) + 1,
                    },
                  })
                }
              } catch (error) {
                console.error('Error updating author stats:', error)
              }
            }
          },
        ],
      },
      
      // Versions et brouillons
      versions: {
        drafts: {
          autosave: {
            interval: 30000, // 30 secondes
          },
        },
        maxPerDoc: 25,
      },
    },

    // Collection Categories simple
    {
      slug: 'categories',
      admin: {
        useAsTitle: 'name',
        group: 'Contenu',
        description: 'Catégories pour organiser les articles',
      },
      access: {
        read: () => true,
        create: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin' || user.role === 'author'
        },
        update: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin' || user.role === 'author'
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
          label: 'Nom de la catégorie',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'color',
          type: 'text',
          label: 'Couleur (hex)',
          admin: {
            placeholder: '#3B82F6',
          },
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          label: 'Slug',
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (data?.name && !value) {
                  return data.name
                    .toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '')
                }
                return value
              },
            ],
          },
        },
      ],
    },
  ],

  // Globals pour les paramètres du site
  globals: [
    {
      slug: 'site-settings',
      label: 'Paramètres du Site',
      admin: {
        group: 'Configuration',
        description: 'Configuration générale de Blog 20',
      },
      access: {
        read: () => true,
        update: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin'
        },
      },
      fields: [
        {
          name: 'general',
          type: 'group',
          label: 'Général',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              defaultValue: 'Blog 20',
              label: 'Nom du site',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              label: 'Description du site',
              defaultValue: 'Une plateforme de blog moderne',
            },
            {
              name: 'siteUrl',
              type: 'text',
              label: 'URL du site',
              defaultValue: 'https://your-blog.vercel.app',
            },
          ],
        },
        {
          name: 'socialMedia',
          type: 'group',
          label: 'Réseaux Sociaux',
          fields: [
            {
              name: 'twitter',
              type: 'text',
              label: 'Twitter',
              admin: {
                placeholder: '@votre_compte',
              },
            },
            {
              name: 'github',
              type: 'text',
              label: 'GitHub',
              admin: {
                placeholder: 'https://github.com/votre-compte',
              },
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn',
              admin: {
                placeholder: 'https://linkedin.com/in/votre-profil',
              },
            },
          ],
        },
      ],
    },
  ],

  // Configuration de base
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => defaultFeatures,
  }),

  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),

  // CORS et CSRF pour Vercel
  cors: [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
  ].filter(Boolean),

  csrf: [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
  ].filter(Boolean),

  serverURL: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000',
})