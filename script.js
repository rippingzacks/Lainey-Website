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

// Hero video playlist rotation with crossfade — preloads the next clip in the
// background so the transition is a smooth fade rather than a hard reload/cut.
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

  if (playlist.length > 1 && videoA && videoB) {
    let currentIndex = 0;
    let activeVideo = videoA;
    let standbyVideo = videoB;
    let isCrossfading = false;
    const CROSSFADE_LEAD = 1.0; // seconds before the clip ends to start the crossfade

    function preloadStandby(index) {
      standbyVideo.src = playlist[index];
      standbyVideo.load();
      const playPromise = standbyVideo.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    }

    function crossfadeToStandby() {
      activeVideo.classList.remove('is-active');
      standbyVideo.classList.add('is-active');
      const nextActive = standbyVideo;
      const nextStandby = activeVideo;
      activeVideo = nextActive;
      standbyVideo = nextStandby;
      currentIndex = (currentIndex + 1) % playlist.length;
      const upcomingIndex = (currentIndex + 1) % playlist.length;
      preloadStandby(upcomingIndex);
      isCrossfading = false;
    }

    function handleTimeUpdate(e){
      if (e.target !== activeVideo) return;
      if (isCrossfading) return;
      if (!activeVideo.duration) return;
      if (activeVideo.currentTime >= activeVideo.duration - CROSSFADE_LEAD) {
        isCrossfading = true;
        crossfadeToStandby();
      }
    }
    videoA.addEventListener('timeupdate', handleTimeUpdate);
    videoB.addEventListener('timeupdate', handleTimeUpdate);

    // Kick off preloading the second clip right away
    preloadStandby(1);
  }
}
