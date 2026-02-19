import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // For GitHub Pages deployment: /gh-aw-editor-visualizer/
  // For gh-aw docs site: /gh-aw/editor/
  const base = mode === 'ghpages'
    ? '/gh-aw-editor-visualizer/'
    : '/gh-aw/editor/';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: mode === 'ghpages' ? 'dist' : '../public/editor',
      emptyOutDir: true,
      target: 'es2020',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core -- loaded by everything, cache separately
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor';
            }
            // Flow canvas -- large, cache separately
            if (id.includes('node_modules/@xyflow') || id.includes('node_modules/@dagrejs')) {
              return 'flow-vendor';
            }
            // Syntax highlighting -- only used in lazy-loaded editors
            if (id.includes('node_modules/prism-react-renderer')) {
              return 'prism-vendor';
            }
            // Radix dialog -- only used in WelcomeModal (lazy)
            if (id.includes('node_modules/@radix-ui')) {
              return 'radix-vendor';
            }
          },
        },
      },
    },
    publicDir: 'public',
  };
});
