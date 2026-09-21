export function createOverlays() {
  // About overlay
  const aboutOverlay = document.createElement('div');
  aboutOverlay.id = 'about-overlay';
  aboutOverlay.className = 'page-overlay';
  aboutOverlay.innerHTML = `
    <button class="close-btn">×</button>
    <div class="overlay-content">
      <h1>ABOUT ME</h1>
      <p>Welcome to my portfolio! I'm a multimedia artist, designer and game dev based in Lucerne, Switzerland. I love creating and designing digital experiences and art.</p>
      <p>With a background in both art and programming, I specialize in 3D design, game design and creative coding.
      I always aim to push the boundaries of what's possible, bend the rules and think further than outside the box.</p>
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
      <h1>CONTACT ME</h1>
      <div class="contact-info">
        <p><a href="mailto:ardit.stojkaj@gmail.com">Mail</a></p>
        <p><a href="https://www.linkedin.com/in/ardit-stojkaj-05466b168/" target="_blank">LinkedIn</a></p>
        <p><a href="https://www.instagram.com/mf_doodoo/" Target="_blank">Instagram</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(contactOverlay);
}