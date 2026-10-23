import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import './App.jsx';

createInertiaApp({
    title: (title) => `${title} — Sewa Kamera`,
    resolve: (name) => resolvePageComponent(`./${name}.jsx`, import.meta.glob('./**/*.jsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#245942',
    },
});
