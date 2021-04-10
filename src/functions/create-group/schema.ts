export default {
  type: "object",
  properties: {
    id: {type: 'string'},
    name: { type: 'string' },
    description: {type: 'string'}
  },
  required: ['id', 'name']
} as const;
