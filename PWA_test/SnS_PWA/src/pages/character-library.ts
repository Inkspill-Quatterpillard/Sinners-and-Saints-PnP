import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../components/header.js';
import '../components/header.js';

@customElement('character-library')
export class CharacterLibrary extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    .character-list {
      margin-bottom: 16px;
    }

    .character-item {
      margin: 8px 0;
    }

    button {
      background-color: #5d4037;
      color: white;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
    }

    button:hover {
      background-color: #6d4c41;
    }
  `;

  render() {
    return html`
      <app-header></app-header>
      <main>
        <h1>Character Library</h1>
        <p>Browse your characters here.</p>
      </main>
    `;
  }

  createNewChar() {
    window.location.href = '/character-attributes';
  }

  goBack() {
    window.history.back();
  }
}
