export function createOverlays() {
  // About overlay
  const aboutOverlay = document.createElement('div');
  aboutOverlay.id = 'about-overlay';
  aboutOverlay.className = 'page-overlay';
  aboutOverlay.innerHTML = `
    <button class="close-btn">×</button>
    <div class="overlay-content">
      <h1>ABOUT ME</h1>
      <p>Welcome to my portfolio! I'm a 3D artist and developer with a love for creating immersive experiences and videogames.</p>
      <p>With a background in both art and programming, I specialize in 3D design, game development, and creative coding.
      I enjoy pushing the boundaries of what's possible on the web and bringing my artistic visions to life through code.</p>
      <h2>SKILLSET</h2>
      <ul>
        <li>2D Art</li>
        <li>3D Modeling, Rigging & Animation</li>
        <li>Creative Coding</li>
        <li>Game Development & Design</li>
      </ul>
    </div>
  `;
  document.body.appendChild(aboutOverlay);

  // Contact overlay
  const contactOverlay = document.createElement('div');
  contactOverlay.id = 'contact-overlay';
  contactOverlay.className = 'page-overlay';
  contactOverlay.innerHTML = `
    <button class="close-btn">×</button>
    <div class="overlay-content">
      <h1>CONTACT</h1>
      <div class="contact-info">
        <p>Email: <a href="mailto:your@email.com">your@email.com</a></p>
        <p>LinkedIn: <a href="https://linkedin.com/in/yourprofile" target="_blank">Your Profile</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(contactOverlay);
}