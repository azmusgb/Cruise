module.exports = [
  {
    ignores: [
      'node_modules/**',
      'reports/**',
      'tests/**',
      'tools/_archive/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {},
  },
];
