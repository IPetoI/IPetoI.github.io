/**
 * QuerySelector helper that returns elements as an array instead of a NodeList,
 * making it easier to use array methods like .forEach and .map.
 *
 * @param {string} selector - CSS selector.
 * @returns {Element[]} Array of matched elements.
 */
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

export const randomBetween = (min, max) => min + Math.random() * (max - min);

/**
 * Schedules a task when the browser is idle (requestIdleCallback),
 * or falls back to a short setTimeout if not supported.
 *
 * @param {Function} task - The task to execute.
 * @param {number} [timeout=1200] - Maximum waiting time in milliseconds.
 */
export function scheduleIdleTask(task, timeout = 1200) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(task, { timeout });
    return;
  }
  setTimeout(task, 100);
}

/**
 * Creates a simple image preloader utility object that remembers
 * which images have already been loaded (to avoid loading the same image twice),
 * and can preload the next/previous few images from a
 * circular (wrap-around) list.
 *
 * Used by both modal.js (project gallery) and thesis.js (thesis slideshow)
 * to ensure smooth image navigation without lag.
 *
 * @returns {{ preloadNeighbors: (images: string[], index: number) => void }}
 */
export function createImagePreloader() {
  const alreadyPreloaded = new Set();

  function preloadImage(src) {
    if (!src || alreadyPreloaded.has(src)) {
      return;
    }
    alreadyPreloaded.add(src);

    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }

  /**
   * Preloads the current image and a few adjacent images (previous/next)
   * to ensure instant switching when navigating via buttons or swipe gestures.
   *
   * @param {string[]} images - Array of images in the gallery/slideshow.
   * @param {number} index - The currently displayed image index.
   */
  function preloadNeighbors(images, index) {
    if (!images.length) {
      return;
    }

    const len = images.length;
    const offsets = [0, 1, -1, 2];

    offsets.forEach((offset) => {
      const target = (((index + offset) % len) + len) % len;
      preloadImage(images[target]);
    });
  }

  return { preloadNeighbors };
}