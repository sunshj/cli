/** @type {import('cz-git').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-leading-space': [2, 'always'],
    'subject-full-stop': [0, 'never']
  },
  plugins: [
    {
      rules: {
        'subject-leading-space': ({ header }) => {
          return [header.includes(': '), 'The subject prefix must contain spaces, such as "feat: "']
        }
      }
    }
  ]
}
