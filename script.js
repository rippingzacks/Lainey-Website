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

// Hero video playlist rotation — plays each clip once, in sequence, looping back to the first
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  let playlist = [];
  try {
    playlist = JSON.parse(heroVideo.getAttribute('data-playlist')) || [];
  } catch (e) {
    playlist = [];
  }
  let heroIndex = 0;
  if (playlist.length > 1) {
    heroVideo.addEventListener('ended', () => {
      heroIndex = (heroIndex + 1) % playlist.length;
      heroVideo.src = playlist[heroIndex];
      heroVideo.play();
    });
  }
}
