export function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'mouse-tooltip';
  document.body.appendChild(tooltip);

  const style = document.createElement('style');
  style.textContent = `
    #mouse-tooltip {
      position: fixed;
      top: 0;
      left: 0;
      padding: 4px 10px;
      font-family: 'Roboto', sans-serif;
      font-size: 32px;
      letter-spacing: 1px;
      color: #fff;
      background: rgb(0, 0, 0);
      border-radius: 0px 5px 5px 5px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 60;
      white-space: nowrap;
    }
    #mouse-tooltip.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  return tooltip;
}