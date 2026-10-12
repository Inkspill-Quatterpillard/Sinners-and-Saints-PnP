import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/header.js';

@customElement('character-attributes')
export class CharacterAttributes extends LitElement {
  @state() char_attributes: Record<string, number> = {
    Str: 10,
    Con: 10,
    Cha: 10,
    Kno: 10,
    Int: 10,
    Wil: 10,
    Per: 10,
  };

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .attribute {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .attribute input {
      width: 50px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      text-align: center;
    }

    .attribute {
      cursor: grab;
    }

    .attribute.dragging {
      opacity: 0.5;
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
        <h1>Character Attributes</h1>
        <p>Define your character's attributes here.</p>
      </main>
    `;
  }

  updateAttribute(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    this.char_attributes = { ...this.char_attributes, [key]: parseInt(input.value, 10) };
  }

  randomizeAttributes() {
    const randomValue = () => Math.floor(Math.random() * (18 - 3 + 1)) + 3;
    this.char_attributes = Object.fromEntries(
      Object.keys(this.char_attributes).map((key) => [key, randomValue()])
    );
  }

  handleDragStart(event: DragEvent, key: string) {
    event.dataTransfer?.setData('text/plain', key);
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  handleDrop(event: DragEvent, targetKey: string) {
    event.preventDefault();
    const sourceKey = event.dataTransfer?.getData('text/plain');
    if (sourceKey && sourceKey !== targetKey) {
      const newAttributes = { ...this.char_attributes };
      [newAttributes[sourceKey], newAttributes[targetKey]] = [
        newAttributes[targetKey],
        newAttributes[sourceKey],
      ];
      this.char_attributes = newAttributes;
    }
    const draggingElement = this.shadowRoot?.querySelector('.dragging');
    draggingElement?.classList.remove('dragging');
  }

  saveCharacter(event: Event) {
    event.preventDefault();
    console.log('Character saved:', this.char_attributes);
    window.location.href = '/character-library';
  }

  goBack() {
    window.history.back();
  }
}
