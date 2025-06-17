import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: () => true, // Everyone can read posts
    create: ({ req: { user } }) => !!user, // Only logged in users can create
    update: ({ req: { user } }) => !!user, // Only logged in users can update
    delete: ({ req: { user } }) => !!user, // Only logged in users can delete
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Post Title',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Post Content',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 200,
      label: 'Excerpt',
      admin: {
        description: 'Brief description of the post (max 200 characters)',
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
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
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
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the title',
      },
      hooks: {
        beforeValidate: [
          ({ value, originalDoc, data }) => {
            if (data?.title && !value) {
              return data.title
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
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create') {
          if (req.user) {
            data.author = req.user.id
          }
          if (data.status === 'published' && !data.publishedAt) {
            data.publishedAt = new Date()
          }
        }
        return data
      },
    ],
  },
  versions: {
    drafts: true,
  },
}