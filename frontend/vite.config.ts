/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Os arquivos do build mantêm o hash padrão do Vite no nome: cada versão ganha
// nomes novos, então o cache do navegador nunca serve CSS/JS/imagem antigos.
export default defineConfig({
  // Caminhos relativos permitem servir o app em uma subpasta.
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  test: {
    // Scripts de publicação usam node:test, não o ambiente de navegador.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Endereço fictício: nos testes o fetch é substituído, nenhuma requisição sai da máquina.
    env: { VITE_API_BASE_URL: 'http://api.test' },
  },
});
