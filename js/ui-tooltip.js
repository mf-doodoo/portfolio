export function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'mouse-tooltip';
  document.body.appendChild(tooltip);

  const cursorOuter = document.createElement('div');
  cursorOuter.id = 'cursor-outer';
  document.body.appendChild(cursorOuter);

  const cursorInner = document.createElement('div');
  cursorInner.id = 'cursor-inner';
  document.body.appendChild(cursorInner);

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

    #cursor-outer {
      position: fixed;
      top: 0;
      left: 0;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.15s ease;
      z-index: 58;
    }
    #cursor-inner {
      position: fixed;
      top: 0;
      left: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #000;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.15s ease;
      z-index: 59;
    }
    #cursor-outer.visible,
    #cursor-inner.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  return { tooltip, cursorOuter, cursorInner };
}