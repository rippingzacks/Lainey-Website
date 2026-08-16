document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

navToggle.addEventListener('click', () => {
  const isOpen = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

primaryNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Concierge video play buttons
document.querySelectorAll('.concierge-play').forEach(btn => {
  btn.addEventListener('click', () => {
    const video = btn.parentElement.querySelector('video');
    if (!video) return;
    video.play();
    btn.style.display = 'none';
  });
});

// Hero video playlist rotation — deliberately simple. A single video element,
// no loop, no artificial duration timing. The browser's own native 'ended'
// event (fires only once a clip has genuinely played all the way through)
// advances to the next clip, so there is no way for a clip to play twice or
// get cut short — that guarantee comes from the browser itself, not from any
// timing logic we have to get right. A brief opacity dip masks the src swap.
const heroMedia = document.getElementById('heroMedia');
if (heroMedia) {
  let playlist = [];
  try {
    playlist = JSON.parse(heroMedia.getAttribute('data-playlist')) || [];
  } catch (e) {
    playlist = [];
  }

  const heroVideo = document.getElementById('heroVideo');

  if (playlist.length > 1 && heroVideo) {
    let currentIndex = 0;
    const FADE_MS = 350;

    function playNext() {
      currentIndex = (currentIndex + 1) % playlist.length;
      heroVideo.classList.add('is-fading');
      setTimeout(() => {
        heroVideo.src = playlist[currentIndex];
        heroVideo.load();
        const p = heroVideo.play();
        if (p && p.catch) p.catch(() => {});
        heroVideo.classList.remove('is-fading');
      }, FADE_MS);
    }

    heroVideo.addEventListener('ended', playNext);
  }
}
