import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

// You can also import styles from another file
// if you prefer to keep your CSS seperate from your component
import { styles } from './about-styles.ts';

import { styles as sharedStyles } from '../../styles/shared-styles.ts'

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '../../components/header.js';

@customElement('app-about')
export class AppAbout extends LitElement {
  static styles = [
    sharedStyles,
    styles
  ]

  render() {
    return html`
      <app-header></app-header>
      <main>
        <h1>About Page</h1>
        <p>Learn more about this PWA here.</p>
      </main>
    `;
  }
}
