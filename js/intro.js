export function createIntro() {
  // Check if intro has already been shown
  const introShown = sessionStorage.getItem('introShown');
  
  if (introShown) {
    console.log('Intro already shown, skipping...');
    return; // Skip intro if already shown
  }

  const introPanel = document.createElement('div');
  introPanel.id = 'intro-panel';
  introPanel.innerHTML = `
    <div id="intro-container">
      <div class="intro-line" id="line-1">Hey there!</div>
      <div class="intro-line" id="line-2">My name's Ardit.</div>
      <div class="intro-line" id="line-3">Welcome to my page!</div>
    </div>
    <button id="skip-intro-btn">SKIP</button>
  `;
  document.body.appendChild(introPanel);

  // Add CSS for skip button
  const skipStyle = document.createElement('style');
  skipStyle.textContent = `
    #skip-intro-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      padding: 12px 24px;
      background-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      border: 2px solid #ffffff;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      z-index: 10000;
      border-radius: 5px;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    }

    #skip-intro-btn:hover {
      background-color: rgba(255, 255, 255, 0.4);
      transform: scale(1.05);
    }

    #skip-intro-btn:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(skipStyle);

  // Skip button click handler
  const skipBtn = document.getElementById('skip-intro-btn');
  skipBtn.addEventListener('click', () => {
    removeIntro();
  });

  // Remove intro after animation completes
  setTimeout(() => {
    removeIntro();
  }, 8500);

  function removeIntro() {
    introPanel.remove();
    // Mark intro as shown in this session
    sessionStorage.setItem('introShown', 'true');
    console.log('Intro removed');
  }
}