export function createIntro() {
  const introPanel = document.createElement('div');
  introPanel.id = 'intro-panel';
  introPanel.innerHTML = `
    <div id="intro-container">
      <div class="intro-line" id="line-1">Hey there!</div>
      <div class="intro-line" id="line-2">My name's Ardit</div>
      <div class="intro-line" id="line-3">Welcome to my page</div>
    </div>
  `;
  document.body.appendChild(introPanel);

  // Remove intro after animation completes
  setTimeout(() => {
    introPanel.remove();
    console.log('Intro animation complete');
  }, 8500);
}