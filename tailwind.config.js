module.exports = {
  prefix: 'tw-', // ← mọi class đều có prefix: tw-flex, tw-p-4, tw-grid...
  content: ['./src/**/*.{html,ts}'],
  corePlugins: {
    preflight: false, // ← TẮT reset CSS của Tailwind, giữ nguyên style Taiga UI
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
