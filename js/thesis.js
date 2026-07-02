import { appState, getThesisImages } from "./data.js";
import { scheduleIdleTask, createImagePreloader } from "./utils.js";

const { preloadNeighbors } = createImagePreloader();

function getCurrentLang() {
  return document.documentElement.lang === "en" ? "en" : "hu";
}

/**
 * Displays the thesis slide at the given index using circular indexing
 * and a sliding animation.
 *
 * @param {number} index - The index of the slide to display.
 */
function showThesisSlide(index) {
  const thesisImage = document.getElementById("thesisImage");
  const thesisCounter = document.getElementById("thesisCounter");
  if (!thesisImage || !thesisCounter) {
    return;
  }

  const thesisImages = getThesisImages(getCurrentLang());
  if (!thesisImages.length) {
    return;
  }

  const previousIndex = appState.thesisIndex;

  appState.thesisIndex =
    ((index % thesisImages.length) + thesisImages.length) % thesisImages.length;

  const isNext =
    index > previousIndex ||
    (previousIndex === thesisImages.length - 1 && appState.thesisIndex === 0);
  const direction = isNext ? "slide-left" : "slide-right";

  thesisImage.classList.remove("slide-left", "slide-right");
  thesisImage.src = thesisImages[appState.thesisIndex];
  thesisCounter.textContent = String(appState.thesisIndex + 1);

  scheduleIdleTask(() => preloadNeighbors(thesisImages, appState.thesisIndex));

  setTimeout(() => thesisImage.classList.add(direction), 10);
  setTimeout(() => thesisImage.classList.remove(direction), 450);
}

// Initializes touch swipe navigation for the thesis slide.
function initThesisSwipe() {
  const thesisImage = document.getElementById("thesisImage");
  if (!thesisImage) {
    return;
  }

  let touchStartX = 0;
  let touchStartY = 0;
  const minSwipeDistance = 40;

  thesisImage.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true },
  );

  thesisImage.addEventListener(
    "touchend",
    (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (
        Math.abs(deltaX) < minSwipeDistance ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX < 0) {
        showThesisSlide(appState.thesisIndex + 1);
      } else {
        showThesisSlide(appState.thesisIndex - 1);
      }
    },
    { passive: true },
  );
}

/**
 * Initializes the thesis slideshow with button and keyboard navigation.
 * Also updates the current slide on language change, since the
 * Hungarian and English slide sets use separate image files.
 *
 * @param {HTMLElement|null} modal - The project modal element, used to
 *   prevent keyboard navigation conflicts when it is open.
 */
export function initThesisSlider(modal) {
  const prevBtn = document.querySelector(".thesis-prev");
  const nextBtn = document.querySelector(".thesis-next");

  // The first rendered image should definitely match the current language.
  showThesisSlide(appState.thesisIndex);

  scheduleIdleTask(() =>
    preloadNeighbors(getThesisImages(getCurrentLang()), appState.thesisIndex),
  );

  prevBtn?.addEventListener("click", () =>
    showThesisSlide(appState.thesisIndex - 1),
  );
  nextBtn?.addEventListener("click", () =>
    showThesisSlide(appState.thesisIndex + 1),
  );

  document.addEventListener("keydown", (e) => {
    const thesisSection = document.querySelector(".thesis-section");
    if (!thesisSection) {
      return;
    }

    const rect = thesisSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    // Prevent interfering with modal keyboard controls when it is open.
    if (!isVisible || modal?.classList.contains("open")) {
      return;
    }

    if (e.key === "ArrowLeft") {
      showThesisSlide(appState.thesisIndex - 1);
    }
    if (e.key === "ArrowRight") {
      showThesisSlide(appState.thesisIndex + 1);
    }
  });

  document.addEventListener("languageChanged", () => {
    showThesisSlide(appState.thesisIndex);
    scheduleIdleTask(() =>
      preloadNeighbors(getThesisImages(getCurrentLang()), appState.thesisIndex),
    );
  });

  initThesisSwipe();
}