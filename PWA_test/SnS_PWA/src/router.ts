// docs for router https://github.com/thepassle/app-tools/blob/master/router/README.md

import { html, render } from 'lit';

if (!(globalThis as any).URLPattern) {
  await import("urlpattern-polyfill");
}

import { Router } from '@thepassle/app-tools/router.js';
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';

// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';

import './pages/app-home.js';
import './pages/app-about/app-about.js';
import './pages/character-creator.js';
import './pages/character-library.js';
import './pages/character-attributes.js';

const baseURL: string = (import.meta as any).env.BASE_URL;

// Define routes
const routes = [
  {
    path: resolveRouterPath(),
    title: 'Home',
    render: () => html`<app-home></app-home>`
  },
  {
    path: resolveRouterPath('about'),
    title: 'About',
    plugins: [
      lazy(() => import('./pages/app-about/app-about.js')),
    ],
    render: () => html`<app-about></app-about>`
  },
  {
    path: resolveRouterPath('character-creator'),
    title: 'Character Creator',
    plugins: [
      lazy(() => import('./pages/character-creator.js')),
    ],
    render: () => html`<character-creator></character-creator>`
  },
  {
    path: resolveRouterPath('character-library'),
    title: 'Character Library',
    plugins: [
      lazy(() => import('./pages/character-library.js')),
    ],
    render: () => html`<character-library></character-library>`
  },
  {
    path: resolveRouterPath('character-attributes'),
    title: 'Character Attributes',
    plugins: [
      lazy(() => import('./pages/character-attributes.js')),
    ],
    render: () => html`<character-attributes></character-attributes>`
  }
];

// Create the original router with routes
const originalRouter = new Router({ routes });

// Create our custom router object
let outletElement: HTMLElement | null = null;
let currentRoute: any = null;

// Track the current route when it changes
originalRouter.addEventListener('route-changed', (event: any) => {
  currentRoute = event.detail?.route;
  
  if (outletElement && currentRoute?.render) {
    // Directly render the route's content to our outlet
    render(currentRoute.render(), outletElement);
  }
});

// Export a simplified router interface that doesn't need arguments for render
export const router = {
  addEventListener: (name: string, callback: EventListener) => {
    originalRouter.addEventListener(name, callback);
  },
  
  setOutlet(element: HTMLElement) {
    outletElement = element;
    // If we already have a route when setting the outlet, render it immediately
    if (currentRoute?.render) {
      render(currentRoute.render(), outletElement);
    }
  },
  
  render() {
    // If we have a current route and outlet, render it
    if (currentRoute && outletElement) {
      render(currentRoute.render(), outletElement);
    } else {
      // Otherwise, force a route navigation to the current URL to trigger the route-changed event
      originalRouter.navigate(window.location.pathname);
    }
  }
};

// This function will resolve a path with whatever Base URL was passed to the vite build process.
export function resolveRouterPath(unresolvedPath?: string) {
  let resolvedPath = baseURL;
  if(unresolvedPath) {
    resolvedPath = resolvedPath + unresolvedPath;
  }

  return resolvedPath;
}
