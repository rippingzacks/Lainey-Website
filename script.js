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

// Hero video playlist rotation with crossfade. Both video elements are always
// actively playing (one visible, one hidden and looping quietly in the
// background) so there is never a "loading gap" at the moment of a crossfade —
// the clip being revealed is already rendering real frames well before its turn.
// A fixed interval drives the rotation, rather than each clip's own duration,
// so timing can't get thrown off by different clip lengths or buffering speed.
const heroMedia = document.getElementById('heroMedia');
if (heroMedia) {
  let playlist = [];
  try {
    playlist = JSON.parse(heroMedia.getAttribute('data-playlist')) || [];
  } catch (e) {
    playlist = [];
  }

  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');
  const SLIDE_SECONDS = 6;

  if (playlist.length > 1 && videoA && videoB) {
    videoA.loop = true;
    videoB.loop = true;

    let currentIndex = 0;
    let activeVideo = videoA;
    let standbyVideo = videoB;

    function warmUp(video, index) {
      video.src = playlist[index];
      video.load();
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }

    function crossfade() {
      activeVideo.classList.remove('is-active');
      standbyVideo.classList.add('is-active');

      const oldActive = activeVideo;
      activeVideo = standbyVideo;
      standbyVideo = oldActive;

      currentIndex = (currentIndex + 1) % playlist.length;
      const upcomingIndex = (currentIndex + 1) % playlist.length;
      // Give the now-hidden element a moment to fully fade out before swapping
      // its source underneath it.
      setTimeout(() => warmUp(standbyVideo, upcomingIndex), 1300);
    }

    // Get the second clip playing quietly in the background right away
    warmUp(videoB, 1);
    setInterval(crossfade, SLIDE_SECONDS * 1000);
  }
}
