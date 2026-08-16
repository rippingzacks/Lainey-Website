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
// Each crossfade is timed to that clip's own real duration, captured via the
// 'loadedmetadata' event rather than read on-demand (which was unreliable and
// fell back to a generic timer — cutting long clips short and letting short
// clips loop twice before switching).
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
    videoA.loop = true;
    videoB.loop = true;

    let currentIndex = 0;
    let activeVideo = videoA;
    let standbyVideo = videoB;
    let cycleTimer = null;
    const durationByIndex = {};

    function cacheDuration(video, index) {
      // If metadata already loaded (common for the very first clip, which the
      // browser starts fetching immediately via the HTML autoplay attribute),
      // grab it now — otherwise the 'loadedmetadata' event may have already
      // fired once and we'd wait forever for an event that never comes again.
      if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
        durationByIndex[index] = video.duration;
        return;
      }
      const onMeta = () => {
        if (video.duration && isFinite(video.duration)) {
          durationByIndex[index] = video.duration;
        }
        video.removeEventListener('loadedmetadata', onMeta);
      };
      video.addEventListener('loadedmetadata', onMeta);
    }

    function warmUp(video, index) {
      video.src = playlist[index];
      cacheDuration(video, index);
      video.load();
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }

    function scheduleNextCrossfade() {
      if (cycleTimer) clearTimeout(cycleTimer);
      const known = durationByIndex[currentIndex];
      if (known) {
        const ms = Math.max(2500, known * 1000 - 150);
        cycleTimer = setTimeout(crossfade, ms);
      } else {
        // Duration not cached yet for some reason — check again shortly
        // rather than guessing with a fixed fallback that could be wrong.
        cycleTimer = setTimeout(scheduleNextCrossfade, 150);
      }
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

      scheduleNextCrossfade();
    }

    // Get the second clip playing quietly in the background right away
    cacheDuration(videoA, 0);
    warmUp(videoB, 1);
    scheduleNextCrossfade();
  }
}
