import { css } from 'lit';

// these styles can be imported from any component
// for an example of how to use this, check /pages/about-about.ts
export const styles = css`
  @media(min-width: 1000px) {
    sl-card {
      max-width: 70vw;
    }
  }

  main {
    margin-top: 34px;
    padding: 12px;
  }
`;

export const sharedStyles = css`
  button {
    padding: 8px 16px;
    background-color:rgb(136, 62, 62);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  input, textarea {
    width: 100%;
    padding: 8px;
    margin: 4px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;