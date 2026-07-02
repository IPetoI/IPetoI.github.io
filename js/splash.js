import { randomBetween } from "./utils.js";

const MIN_SPLASH_MS = 1500;
const MAX_SPLASH_MS = 4500;
const SPLASH_FADE_MS = 420;
const PRELOAD_TIMEOUT_MS = 2500;

function waitForMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Loads a single image as a Promise.
 * Even if the image fails to load, the promise resolves so that
 * the splash screen does not get stuck indefinitely.
 */
function preloadImageSource(src, timeoutMs = PRELOAD_TIMEOUT_MS) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const img = new Image();
    let settled = false;

    const finalize = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    img.onload = finalize;
    img.onerror = finalize;
    img.src = src;

    setTimeout(finalize, timeoutMs);
  });
}

function getBackgroundImageSource(element) {
  if (!element) {
    return "";
  }

  const backgroundImage =
    window.getComputedStyle(element).backgroundImage || "";
  const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/i);
  return match?.[1] || "";
}

/**
 * Collects image sources that are shown immediately after the splash screen
 * disappears (hero image, CV preview, splash logo background),
 * so they can be preloaded in advance.
 */
function getCriticalImageSources() {
  const sources = [];
  const heroImage = document.querySelector(".hero-pic-large");
  const cvImage = document.querySelector(".cv-img-preview");
  const splashCircle = document.querySelector(".logo-circle");
  const splashCircleBackground = getBackgroundImageSource(splashCircle);

  if (heroImage) {
    sources.push(heroImage.currentSrc || heroImage.getAttribute("src") || "");
  }
  if (cvImage) {
    sources.push(cvImage.currentSrc || cvImage.getAttribute("src") || "");
  }
  if (splashCircleBackground) {
    sources.push(splashCircleBackground);
  }

  return [...new Set(sources.filter(Boolean))];
}

/**
 * Creates a controller that animates the splash screen progress bar:
 * it gradually fills up to 90%, then jumps quickly to 100% when
 * the complete() function is called.
 */
function createSplashProgressController(splashScreen) {
  const loaderBar = splashScreen?.querySelector(".loader-bar");
  let frameId = 0;
  let startedAt = 0;
  let frozen = false;

  const setWidth = (value) => {
    if (!loaderBar) {
      return;
    }
    const clamped = Math.max(0, Math.min(100, value));
    loaderBar.style.width = `${clamped}%`;
  };

  const tick = () => {
    if (frozen) {
      return;
    }
    const elapsed = performance.now() - startedAt;
    const ratio = Math.min(elapsed / MIN_SPLASH_MS, 1);

    const visualProgress = ratio < 1 ? ratio * 90 : 90;
    setWidth(visualProgress);
    frameId = window.requestAnimationFrame(tick);
  };

  return {
    start() {
      if (!loaderBar) {
        return;
      }
      startedAt = performance.now();
      loaderBar.style.width = "0%";
      frameId = window.requestAnimationFrame(tick);
    },
    async complete() {
      frozen = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      setWidth(100);
      await waitForMs(120);
    },
  };
}

function hideSplashNow(splashScreen, handleHeroRightVisibility) {
  if (!splashScreen || splashScreen.dataset.removed === "true") {
    return;
  }

  splashScreen.dataset.removed = "true";
  splashScreen.classList.add("fade-out");

  setTimeout(() => {
    splashScreen.parentNode?.removeChild(splashScreen);
    document.body.style.overflow = "";
    document.documentElement.style.setProperty("--progress-bar-visible", "1");

    handleHeroRightVisibility();
  }, SPLASH_FADE_MS);
}

/**
 * Initializes the splash screen particle system: generates floating,
 * flickering animated dots with random position, size, and timing.
 */
export function initSplashParticles() {
  const particlesContainer = document.querySelector(".splash-particles");
  if (!particlesContainer) {
    return;
  }

  particlesContainer.innerHTML = "";
  const particleCount = 60;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    const size = randomBetween(2, 40);
    particle.style.width = particle.style.height = `${size}px`;
    particle.style.left = `${randomBetween(0, 100)}%`;
    particle.style.top = `${randomBetween(0, 100)}%`;
    particle.dataset.amp = randomBetween(0.5, 1.7).toFixed(2);
    particle.dataset.baseScale = randomBetween(0.8, 1.6).toFixed(2);

    particlesContainer.appendChild(particle);
  }

  document
    .querySelectorAll(".splash-particles .particle")
    .forEach((particle) => {
      const duration = randomBetween(4, 8);
      const delay = -randomBetween(0, duration);
      const baseScale =
        parseFloat(particle.dataset.baseScale) || randomBetween(0.8, 1.4);
      const scale = baseScale * randomBetween(0.9, 1.1);
      const amplitude =
        parseFloat(particle.dataset.amp) || randomBetween(0.5, 1.7);
      const blinkDuration = randomBetween(1.5, 3);
      const blinkDelay = -randomBetween(0, blinkDuration);

      particle.style.animation =
        `float-particle ${duration}s linear infinite ${delay}s, ` +
        `blink ${blinkDuration}s ease-in-out infinite ${blinkDelay}s`;

      particle.style.setProperty("--scale", scale.toFixed(2));
      particle.style.setProperty("--amp", amplitude.toFixed(2));
    });
}

/**
 * Removes the splash screen at the end of loading.
 * Ensures a minimum display duration (MIN_SPLASH_MS), but never
 * waits longer than MAX_SPLASH_MS.
 *
 * @param {Function} handleHeroRightVisibility - Callback that controls
 *   the visibility of the hero right panel, called after the splash screen is removed.
 */
export function removeSplash(handleHeroRightVisibility) {
  const splashScreen = document.getElementById("splashScreen");
  if (!splashScreen) {
    return;
  }

  document.body.style.overflow = "hidden";
  document.documentElement.style.setProperty("--progress-bar-visible", "0");
  window.scrollTo(0, 0);

  const progress = createSplashProgressController(splashScreen);
  progress.start();

  const startedAt = performance.now();
  const maxWait = waitForMs(MAX_SPLASH_MS);
  const criticalSources = getCriticalImageSources();
  const criticalImagesReady = Promise.allSettled(
    criticalSources.map((src) => preloadImageSource(src)),
  );
  const minWait = waitForMs(MIN_SPLASH_MS);

  Promise.race([
    Promise.allSettled([criticalImagesReady, minWait]),
    maxWait,
  ]).finally(async () => {
    const elapsed = performance.now() - startedAt;

    if (elapsed < MIN_SPLASH_MS) {
      await waitForMs(MIN_SPLASH_MS - elapsed);
    }

    await progress.complete();
    hideSplashNow(splashScreen, handleHeroRightVisibility);
  });
}