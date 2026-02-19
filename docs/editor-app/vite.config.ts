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
    },
    publicDir: 'public',
  };
});
