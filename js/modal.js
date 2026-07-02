import { appState } from "./data.js";
import { scheduleIdleTask, createImagePreloader } from "./utils.js";

const { preloadNeighbors } = createImagePreloader();

/**
 * Populates the modal content based on the clicked project card,
 * including title, description, and gallery images.
 *
 * @param {HTMLElement} card - The clicked project card.
 * @param {HTMLElement} modal - The modal element.
 */
function setModalContent(card, modal) {
  const title = card.querySelector(".project-info h3")?.textContent || "";
  const text = card.querySelector(".project-info p")?.textContent || "";
  const description = card.querySelector(".project-info a")?.textContent || "";
  const galleryAttr = card.dataset.gallery;
  const images = galleryAttr
    ? galleryAttr.split("|")
    : [card.querySelector("img")?.src];

  appState.modalImages = images.filter(Boolean);
  appState.modalIndex = 0;

  modal.querySelector(".modal-title").textContent = title;
  modal.querySelector(".modal-text").textContent = text;
  modal.querySelector(".modal-description").textContent = description;
  modal.querySelector(".modal-image").src = appState.modalImages[0] || "";

  // Preload the current and nearby images to ensure smooth navigation.
  scheduleIdleTask(() =>
    preloadNeighbors(appState.modalImages, appState.modalIndex),
  );
}

function openModal(card, modal) {
  setModalContent(card, modal);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/**
 * Displays the image at the given index in the modal using circular indexing
 * (after the last image, it loops back to the first, and vice versa).
 *
 * @param {number} index - The index of the image to display.
 * @param {HTMLElement} modal - The modal element.
 */
function showImage(index, modal) {
  const image = modal.querySelector(".modal-image");
  if (!image || !appState.modalImages.length) {
    return;
  }

  appState.modalIndex =
    (index + appState.modalImages.length) % appState.modalImages.length;

  image.classList.add("fading");
  setTimeout(() => {
    image.src = appState.modalImages[appState.modalIndex];
    image.classList.remove("fading");
  }, 180);

  scheduleIdleTask(() =>
    preloadNeighbors(appState.modalImages, appState.modalIndex),
  );
}

/**
 * Enables touch swipe navigation on the modal image.
 *
 * @param {HTMLElement} modal - The modal element.
 */
function initModalSwipe(modal) {
  const image = modal.querySelector(".modal-image");
  if (!image) {
    return;
  }

  let touchStartX = 0;
  let touchStartY = 0;
  const minSwipeDistance = 40;

  image.addEventListener(
    "touchstart",
    (e) => {
      if (!modal.classList.contains("open")) {
        return;
      }
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true },
  );

  image.addEventListener(
    "touchend",
    (e) => {
      if (!modal.classList.contains("open")) {
        return;
      }
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // Only handle intentional horizontal swipe gestures.
      if (
        Math.abs(deltaX) < minSwipeDistance ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX < 0) {
        showImage(appState.modalIndex + 1, modal);
      } else {
        showImage(appState.modalIndex - 1, modal);
      }
    },
    { passive: true },
  );
}

export function initProjectModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) {
    return null;
  }

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card, modal));
  });

  modal
    .querySelector(".modal-close")
    ?.addEventListener("click", () => closeModal(modal));

  // Close the modal when clicking outside the content area.
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });

  modal
    .querySelector(".modal-arrow.prev")
    ?.addEventListener("click", () =>
      showImage(appState.modalIndex - 1, modal),
    );
  modal
    .querySelector(".modal-arrow.next")
    ?.addEventListener("click", () =>
      showImage(appState.modalIndex + 1, modal),
    );

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) {
      return;
    }

    if (e.key === "Escape") closeModal(modal);
    if (e.key === "ArrowLeft") showImage(appState.modalIndex - 1, modal);
    if (e.key === "ArrowRight") showImage(appState.modalIndex + 1, modal);
  });

  initModalSwipe(modal);

  return modal;
}