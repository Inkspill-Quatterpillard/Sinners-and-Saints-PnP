import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './pages/app-home.js';
import './pages/app-about/app-about.js';
import './pages/character-creator.js';
import './pages/character-library.js';
import './pages/character-attributes.js';
import './components/header.js';
import './styles/global.css';
import { router } from './router.js';

@customElement('app-index')
export class AppIndex extends LitElement {
  @state() currentPage = 'Home';
  @state() isSidebarVisible = true;

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background: url('https://www.transparenttextures.com/patterns/paper-fibers.png') #d7ccc8;
      font-family: Arial, sans-serif;
    }

    .top-bar {
      background-color: #5d4037;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .top-bar button {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
    }

    .container {
      display: flex;
      height: calc(100vh - 50px);
    }

    .side-menu {
      width: 200px;
      background-color: #8d6e63;
      color: white;
      padding: 10px;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .side-menu.hidden {
      transform: translateX(-100%);
    }

    .side-menu a {
      display: block;
      color: white;
      text-decoration: none;
      margin: 10px 0;
      padding: 5px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .side-menu a:hover {
      background-color: #6d4c41;
    }

    .main-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }
  `;

  firstUpdated() {
    router.addEventListener('route-changed', (event: any) => {
      const route = event.detail?.route;
      this.currentPage = route?.title || 'Home';
      this.requestUpdate();
    });

    // Set the outlet element and call render without arguments
    const routerOutlet = this.shadowRoot?.getElementById('router-outlet');
    if (routerOutlet) {
      router.setOutlet(routerOutlet);
      router.render(); // No arguments needed now
    }
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  render() {
    return html`
      <div class="top-bar">
        <button @click="${this.toggleSidebar}">
          ${this.isSidebarVisible ? '✖' : '☰'}
        </button>
        <span>${this.currentPage}</span>
      </div>
      <div class="container">
        <nav class="side-menu ${this.isSidebarVisible ? '' : 'hidden'}">
          <a href="/">Home</a>
          <a href="/character-creator">Character Creator</a>
          <a href="/character-library">Character Library</a>
          <a href="/about">About</a>
        </nav>
        <main class="main-content" id="router-outlet">
          <!-- The router will render content here -->
        </main>
      </div>
    `;
  }
}

