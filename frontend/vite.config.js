
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'tinymce-core',
              test: /node_modules\/tinymce\/(tinymce|icons|themes|models)\//,
            },
            {
              name: 'tinymce-plugins',
              test: /node_modules\/tinymce\/plugins\//,
            },
            {
              name: 'tinymce-i18n',
              test: /node_modules\/tinymce-i18n\//,
            },
          ],
        },
      },
    },
  },
})
