module.exports = {
  types: {
    feat: {
      description: 'A new feature',
      emoji: '✨',
      value: 'feat'
    },
    fix: {
      description: 'A bug fix',
      emoji: '🐛',
      value: 'fix'
    },
    docs: {
      description: 'Documentation only changes',
      emoji: '📚',
      value: 'docs'
    },
    style: {
      description: 'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
      emoji: '💎',
      value: 'style'
    },
    refactor: {
      description: 'A code change that neither fixes a bug nor adds a feature',
      emoji: '📦',
      value: 'refactor'
    },
    perf: {
      description: 'A code change that improves performance',
      emoji: '🚀',
      value: 'perf'
    },
    test: {
      description: 'Adding missing tests or correcting existing tests',
      emoji: '🚨',
      value: 'test'
    },
    build: {
      description: 'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
      emoji: '🛠',
      value: 'build'
    },
    ci: {
      description: 'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
      emoji: '⚙️',
      value: 'ci'
    },
    chore: {
      description: 'Other changes that don\'t modify src or test files',
      emoji: '♻️',
      value: 'chore'
    },
    revert: {
      description: 'Reverts a previous commit',
      emoji: '🗑',
      value: 'revert'
    }
  },
  scopes: [
    { name: 'android', description: 'Android platform' },
    { name: 'ios', description: 'iOS platform' },
    { name: 'core', description: 'Core functionality' },
    { name: 'types', description: 'TypeScript types' },
    { name: 'docs', description: 'Documentation' },
    { name: 'example', description: 'Example app' },
    { name: 'ci', description: 'CI/CD' },
    { name: 'deps', description: 'Dependencies' }
  ],
  scopeOverrides: {
    feat: [
      { name: 'android', description: 'Android platform features' },
      { name: 'ios', description: 'iOS platform features' },
      { name: 'core', description: 'Core functionality features' }
    ],
    fix: [
      { name: 'android', description: 'Android platform fixes' },
      { name: 'ios', description: 'iOS platform fixes' },
      { name: 'core', description: 'Core functionality fixes' }
    ]
  },
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 72,
  subjectSeparator: ': ',
  ticketNumberPrefix: 'KHALTI-',
  ticketNumberSuffix: ': '
};
