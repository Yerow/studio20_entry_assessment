import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

// Function to detect environment and build URL
const getServerURL = (): string => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://studio20-entry-assessment.vercel.app'
  }
  
  return 'http://localhost:3000'
}

// Function to get allowed origins
const getAllowedOrigins = (): string[] => {
  const origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://studio20-entry-assessment.vercel.app',
  ]
  
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith('https://')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`
    
    if (!origins.includes(vercelUrl)) {
      origins.push(vercelUrl)
    }
  }
  
  console.log('🌐 PayloadCMS Allowed Origins:', origins)
  console.log('🖥️ PayloadCMS Server URL:', getServerURL())
  
  return origins
}

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Blog 20 Admin',
    },
  },

  cors: getAllowedOrigins(),
  csrf: getAllowedOrigins(),
  serverURL: getServerURL(),

  collections: [
    // 👥 USERS COLLECTION - User management with secure signup
    {
      slug: 'users',
      auth: {
        verify: false,
        tokenExpiration: 7200, // 2 hours
        maxLoginAttempts: 5,
        lockTime: 600000, // 10 minutes
      },
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'role', 'createdAt'],
        group: 'Administration',
      },
      access: {
        // 📖 READ: All logged-in users can view profiles
        read: ({ req: { user } }) => {
          return Boolean(user) // Logged-in users only
        },
        
        // ➕ CREATE: Public for signup, but with secure validation
        create: () => true, // Allow public signup
        
        // ✏️ UPDATE: User can modify their own profile, admin can modify all
        update: ({ req: { user }, id }) => {
          if (!user) return false
          
          // Admins can modify all profiles
          if (user.role === 'admin') return true
          
          // Others can only modify their own profile
          return user.id === id
        },
        
        // 🗑️ DELETE: Only admins can delete users
        delete: ({ req: { user } }) => {
          return user?.role === 'admin'
        },
        
        // 🚪 ADMIN ACCESS: All logged-in users
        admin: ({ req: { user } }) => Boolean(user),
      },
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            // 🔒 SIGNUP SECURITY: Strict role validation
            if (operation === 'create') {
              // If no logged-in user (public signup)
              if (!req.user) {
                // Only "member" and "author" are allowed for signup
                if (!data.role || !['member', 'author'].includes(data.role)) {
                  console.log('⚠️ Attempted creation with unauthorized role:', data.role)
                  data.role = 'member' // Force to member by default
                }
                
                // Explicitly prevent admin creation via signup
                if (data.role === 'admin') {
                  console.log('🚨 Attempted admin creation via signup blocked')
                  data.role = 'member'
                }
                
                console.log('✅ New user created with role:', data.role)
              } else {
                // If it's a logged-in admin creating a user
                if (req.user.role === 'admin') {
                  // Admin can assign any role
                  if (!data.role) {
                    data.role = 'member'
                  }
                } else {
                  // Non-admins cannot create users via admin interface
                  throw new Error('Only administrators can create users via the admin interface')
                }
              }
            }
            
            // 🔒 UPDATE SECURITY: Prevent unauthorized role modifications
            if (operation === 'update' && req.user?.role !== 'admin') {
              // Non-admins cannot modify their own role
              delete data.role
              console.log('⚠️ Role modification attempt by non-admin blocked')
            }
            
            return data
          },
        ],
        
        afterChange: [
          ({ req, operation, doc }) => {
            if (operation === 'create') {
              console.log(`👤 New user created: ${doc.name} (${doc.email}) - Role: ${doc.role}`)
            }
          },
        ],
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 100,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'member',
          options: [
            { 
              label: '👑 Admin - Complete Management', 
              value: 'admin' 
            },
            { 
              label: '✍️ Author - Content Creation', 
              value: 'author' 
            },
            { 
              label: '👤 Member - Read Only', 
              value: 'member' 
            },
          ],
          access: {
            // Admin interface: only admins can modify roles
            update: ({ req: { user } }) => user?.role === 'admin',
          },
          admin: {
            description: 'Admin: all rights | Author: create posts | Member: read only',
            condition: (data, siblingData, { user }) => {
              // Hide admin choice in interface if not admin
              return user?.role === 'admin'
            }
          }
        },
        {
          name: 'bio',
          type: 'textarea',
          maxLength: 500,
          admin: {
            description: 'Public biography (optional)'
          }
        },
      ],
    },

    // 📝 POSTS COLLECTION - Article management
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'author', 'status', 'publishedAt', 'createdAt'],
        group: 'Content',
      },
      access: {
        // 📖 READ: Strategy based on role
        read: ({ req: { user } }) => {
          if (!user) {
            // 🔓 Public: Only published posts
            return {
              status: { equals: 'published' }
            }
          }
          
          if (user.role === 'admin') {
            // 👑 Admin: All posts
            return true
          }
          
          if (user.role === 'author') {
            // ✍️ Author: Own posts (all statuses) + published posts from others
            return {
              or: [
                { author: { equals: user.id } }, // Own posts
                { status: { equals: 'published' } } // Published posts from others
              ]
            }
          }
          
          // 👤 Member: Only published posts
          return {
            status: { equals: 'published' }
          }
        },
        
        // ➕ CREATE: Admins and authors can create posts
        create: ({ req: { user } }) => {
          return user?.role === 'admin' || user?.role === 'author'
        },
        
        // ✏️ UPDATE: Post owner or admin
        update: ({ req: { user }, doc }) => {
          if (!user) return false
          
          // Admins can modify all posts
          if (user.role === 'admin') return true
          
          // Authors can only modify their own posts
          if (user.role === 'author') {
            return doc?.author === user.id
          }
          
          // Members cannot modify
          return false
        },
        
        // 🗑️ DELETE: Post owner or admin
        delete: ({ req: { user }, doc }) => {
          if (!user) return false
          
          // Admins can delete all posts
          if (user.role === 'admin') return true
          
          // Authors can only delete their own posts
          if (user.role === 'author') {
            return doc?.author === user.id
          }
          
          // Members cannot delete
          return false
        },
      },
      hooks: {
        beforeChange: [
          ({ req, operation, data }) => {
            // Auto-assign author during creation
            if (operation === 'create' && req.user) {
              data.author = req.user.id
            }
            
            // Auto-assign publishedAt if status changes to 'published'
            if (data.status === 'published' && !data.publishedAt) {
              data.publishedAt = new Date().toISOString()
            }
            
            return data
          },
        ],
        beforeUpdate: [
          ({ req, doc, data }) => {
            // Additional permission check
            if (!req.user) {
              throw new Error('Authentication required')
            }
            
            // Admins can modify everything
            if (req.user.role === 'admin') {
              return data
            }
            
            // Authors can only modify their own posts
            if (req.user.role === 'author' && doc.author !== req.user.id) {
              throw new Error('You can only edit your own posts')
            }
            
            // Non-admins cannot change the author
            if (req.user.role !== 'admin' && data.author && data.author !== doc.author) {
              throw new Error('You cannot change the author of a post')
            }
            
            return data
          },
        ],
        beforeDelete: [
          ({ req, doc }) => {
            // Additional permission check
            if (!req.user) {
              throw new Error('Authentication required')
            }
            
            // Admins can delete everything
            if (req.user.role === 'admin') {
              return doc
            }
            
            // Authors can only delete their own posts
            if (req.user.role === 'author' && doc.author !== req.user.id) {
              throw new Error('You can only delete your own posts')
            }
            
            // Members cannot delete anything
            if (req.user.role === 'member') {
              throw new Error('Members cannot delete posts')
            }
            
            return doc
          },
        ],
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          maxLength: 200,
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
          maxLength: 300,
          admin: {
            description: 'Article summary (optional, auto-generated if empty)'
          }
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          access: {
            // Only admins can change the author of a post
            update: ({ req: { user } }) => user?.role === 'admin',
          },
          admin: {
            description: 'Post author (automatically assigned)'
          }
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          options: [
            { label: '📝 Draft', value: 'draft' },
            { label: '🌟 Published', value: 'published' },
          ],
          admin: {
            description: 'Publication status'
          }
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            condition: (data) => data.status === 'published',
            date: {
              pickerAppearance: 'dayAndTime',
            },
            description: 'Publication date (automatic when status changes to "Published")'
          },
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            position: 'sidebar',
            description: 'Article URL (auto-generated)'
          },
          hooks: {
            beforeValidate: [
              ({ data, value }) => {
                if (!value && data?.title) {
                  return data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                }
                return value
              },
            ],
          },
        },
      ],
    },
  ],

  // Database
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
    connectOptions: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  }),

  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET!,
  
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },

  // Environment-based configuration
  ...(process.env.NODE_ENV === 'development' ? {
    debug: true,
    loggerOptions: {
      level: 'info',
    },
  } : {
    debug: false,
    loggerOptions: {
      level: 'warn',
    },
    rateLimit: {
      max: 500,
      window: 15 * 60 * 1000,
    },
  }),
})