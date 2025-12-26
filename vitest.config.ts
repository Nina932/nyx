/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react() as any],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'tests/', 'server/'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
});
