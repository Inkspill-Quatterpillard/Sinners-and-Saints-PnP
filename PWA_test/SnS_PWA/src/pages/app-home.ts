import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles.js';
import '../components/header.js';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  static styles = [
    styles,
    css`
    #welcomeBar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    #welcomeCard,
    #infoCard {
      padding: 18px;
      padding-top: 0px;
    }

    sl-card::part(footer) {
      display: flex;
      justify-content: flex-end;
    }

    @media(min-width: 750px) {
      sl-card {
        width: 70vw;
      }
    }


    @media (horizontal-viewport-segments: 2) {
      #welcomeBar {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }

      #welcomeCard {
        margin-right: 64px;
      }
    }

    :host {
      display: block;
      padding: 16px;
    }

    .button-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
      align-items: center; /* Ensure buttons are centered */
    }

    button {
      background-color: #5d4037;
      color: white;
      border: none;
      padding: 12px 20px;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 4px;
      text-align: center;
      width: 200px; /* Ensure consistent button width */
    }

    button:hover {
      background-color: #6d4c41;
    }

    .explicit-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
      align-items: center; /* Ensure explicit buttons are centered */
    }
  `];

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  render() {
    return html`
      <app-header></app-header>
      <main>
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page of your PWA.</p>
      </main>
    `;
  }

  navigateTo(path: string) {
    window.location.href = path;
  }
}
