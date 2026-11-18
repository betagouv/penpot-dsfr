module.exports = {
  printWidth: 150,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  overrides: [
    {
      // Keep the markdown as written, the SIG documentation has its own conventions (directives...)
      files: '*.md',
      options: { proseWrap: 'preserve' },
    },
  ],
};
