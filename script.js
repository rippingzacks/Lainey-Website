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

// Hero video playlist rotation with crossfade — the next clip is loaded (but not
// played) well in advance, then started fresh at the exact moment we crossfade to
// it, so the transition is smooth and the rotation never stalls on a clip that
// finished playing early in the background.
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
    let hasSwapped = false;

    function loadIntoStandby(index) {
      standbyVideo.src = playlist[index];
      standbyVideo.load();
    }

    function swapToStandby() {
      standbyVideo.currentTime = 0;
      const playPromise = standbyVideo.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});

      activeVideo.classList.remove('is-active');
      standbyVideo.classList.add('is-active');

      const newActive = standbyVideo;
      const newStandby = activeVideo;
      activeVideo = newActive;
      standbyVideo = newStandby;

      currentIndex = (currentIndex + 1) % playlist.length;
      const upcomingIndex = (currentIndex + 1) % playlist.length;
      loadIntoStandby(upcomingIndex);
    }

    function handleTimeUpdate(e) {
      if (e.target !== activeVideo || hasSwapped) return;
      if (!activeVideo.duration || isNaN(activeVideo.duration)) return;
      if (activeVideo.currentTime >= activeVideo.duration - 0.35) {
        hasSwapped = true;
        swapToStandby();
        hasSwapped = false;
      }
    }
    function handleEnded(e) {
      if (e.target !== activeVideo || hasSwapped) return;
      hasSwapped = true;
      swapToStandby();
      hasSwapped = false;
    }

    videoA.addEventListener('timeupdate', handleTimeUpdate);
    videoB.addEventListener('timeupdate', handleTimeUpdate);
    videoA.addEventListener('ended', handleEnded);
    videoB.addEventListener('ended', handleEnded);

    // Preload (but don't play) the second clip right away
    loadIntoStandby(1);
  }
}
