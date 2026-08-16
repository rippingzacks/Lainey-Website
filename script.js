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
// finished playing early in the background. Before swapping, we confirm the
// standby clip actually has enough buffered data to play smoothly rather than
// forcing playback on an under-ready video (which causes stutter/freezing).
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
    let waitingToSwap = false;
    const HAVE_FUTURE_DATA = 3;

    function loadIntoStandby(index) {
      standbyVideo.src = playlist[index];
      standbyVideo.load();
    }

    function doSwap() {
      const revealNow = () => {
        activeVideo.classList.remove('is-active');
        standbyVideo.classList.add('is-active');

        const oldActive = activeVideo;
        const newActive = standbyVideo;
        activeVideo = newActive;
        standbyVideo = oldActive;

        // Let the old clip finish fading out before resetting/parking it
        setTimeout(() => {
          standbyVideo.pause();
          standbyVideo.currentTime = 0;
        }, 1250);

        currentIndex = (currentIndex + 1) % playlist.length;
        const upcomingIndex = (currentIndex + 1) % playlist.length;
        loadIntoStandby(upcomingIndex);
      };

      standbyVideo.currentTime = 0;
      const playPromise = standbyVideo.play();

      // Only reveal the clip once it's actually rendering a real frame, not the
      // instant we ask it to play — this is what was causing the visible flash.
      let revealed = false;
      const onPlaying = () => {
        if (revealed) return;
        revealed = true;
        standbyVideo.removeEventListener('playing', onPlaying);
        revealNow();
      };
      standbyVideo.addEventListener('playing', onPlaying);
      // Safety net in case 'playing' never fires for some reason
      setTimeout(() => {
        if (!revealed) {
          revealed = true;
          standbyVideo.removeEventListener('playing', onPlaying);
          revealNow();
        }
      }, 400);

      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    }

    function attemptSwap() {
      if (waitingToSwap) return;
      // If the next clip isn't sufficiently buffered yet, wait briefly rather
      // than forcing playback and causing a stutter.
      if (standbyVideo.readyState < HAVE_FUTURE_DATA) {
        waitingToSwap = true;
        let attempts = 0;
        const check = () => {
          attempts++;
          if (standbyVideo.readyState >= HAVE_FUTURE_DATA || attempts > 20) {
            waitingToSwap = false;
            doSwap();
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      } else {
        doSwap();
      }
    }

    function handleTimeUpdate(e) {
      if (e.target !== activeVideo || hasSwapped) return;
      if (!activeVideo.duration || isNaN(activeVideo.duration)) return;
      if (activeVideo.currentTime >= activeVideo.duration - 0.5) {
        hasSwapped = true;
        attemptSwap();
        hasSwapped = false;
      }
    }
    function handleEnded(e) {
      if (e.target !== activeVideo || hasSwapped) return;
      hasSwapped = true;
      attemptSwap();
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
