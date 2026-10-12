# SvelteKit für die Oberfläche, Regellogik ohne Framework

Die App wird mit SvelteKit gebaut: statischer Build, PWA über `vite-plugin-pwa`, Speicherung in IndexedDB, alles in TypeScript. Die Regellogik bekommt eigene reine TypeScript-Module ohne Bezug zu Svelte. Dazu gehören abgeleitete Werte, Gültigkeit und die Neubewertung nach einer Änderung. So lässt sie sich unabhängig von der Oberfläche testen.

Svelte statt React oder Lit: Es braucht am wenigsten Boilerplate und liest sich am ehesten wie „HTML mit Logik“. Das ist wichtig, weil der Maintainer aus Python kommt und die App selbst verstehen und ändern können soll. Lit aus dem früheren `PWA_test` wurde wegen seiner kleineren Community verworfen.
