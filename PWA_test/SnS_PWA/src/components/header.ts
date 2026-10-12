import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router.ts';

import '@shoelace-style/shoelace/dist/components/button/button.js';
@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'PWA Starter';

  @property({ type: Boolean}) enableBack: boolean = false;

  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--app-color-primary);
      color: white;
      padding: 12px;
      padding-top: 4px;

      position: fixed;
      left: env(titlebar-area-x, 0);
      top: env(titlebar-area-y, 0);
      height: env(titlebar-area-height, 30px);
      width: env(titlebar-area-width, 100%);
      -webkit-app-region: drag;
    }

    header h1 {
      margin-top: 0;
      margin-bottom: 0;
      font-size: 12px;
      font-weight: bold;
    }

    nav a {
      margin-left: 10px;
    }

    #back-button-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    @media(prefers-color-scheme: light) {
      header {
        color: black;
      }

      nav a {
        color: initial;
      }
    }

    :host {
      display: block;
      background-color: #5d4037;
      color: white;
      padding: 10px;
      text-align: center;
    }

    nav {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      background-color: #6d4c41;
      border-radius: 4px;
    }

    a:hover {
      background-color: #8d6e63;
    }
  `;

  render() {
    return html`
      <header>

        <div id="back-button-block">
          ${this.enableBack ? html`<sl-button size="small" href="${resolveRouterPath()}">
            Back
          </sl-button>` : null}

          <h1>${this.title}</h1>
        </div>
      </header>
      <nav>
        <a href="/">Home</a>
        <a href="/character-creator">Character Creator</a>
        <a href="/character-library">Character Library</a>
        <a href="/about">About</a>
      </nav>
    `;
  }
}
