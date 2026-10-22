import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 해시 라우팅 + 상대 경로라서 Artifact, GitHub Pages(서브 경로), 로컬 파일 어디서든 열린다.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100_000_000,
  },
})
