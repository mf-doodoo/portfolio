export function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'mouse-tooltip';
  document.body.appendChild(tooltip);

  const cursorDot = document.createElement('div');
  cursorDot.id = 'cursor-dot';
  document.body.appendChild(cursorDot);

  const style = document.createElement('style');
  style.textContent = `
    #mouse-tooltip {
      position: fixed;
      top: 0;
      left: 0;
      padding: 4px 10px;
      font-family: sans-serif;
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #fff;
      background: rgba(0, 0, 0, 1);
      border-radius: 0px 20px 20px 20px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 60;
      white-space: nowrap;
    }
    #mouse-tooltip.visible {
      opacity: 1;
    }

    #cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fff;
      mix-blend-mode: difference;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.15s ease, width 0.15s ease, height 0.15s ease;
      z-index: 2001;
    }
    #cursor-dot.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  return { tooltip, cursorDot };
}