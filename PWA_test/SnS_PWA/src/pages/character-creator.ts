import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../components/header.js';
import '../components/header.js';

@customElement('character-creator')
export class CharacterCreator extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 16px;
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
        <h1>Character Creator</h1>
        <p>Create your character here.</p>
      </main>
    `;
  }

  goToCharAttributes() {
    window.location.href = '/character-attributes';
  }

  goBack() {
    window.history.back();
  }
}
