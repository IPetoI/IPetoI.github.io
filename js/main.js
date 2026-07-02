import { initI18n } from "./i18n.js";
import {
  initHamburgerMenu,
  initSmoothScroll,
  initScrollEffects,
  initHeroParallax,
  handleHeroRightVisibility,
  initBackToTop,
  initTitleStagger,
} from "./ui.js";
import { initSplashParticles, removeSplash } from "./splash.js";
import { initBackgroundVisuals } from "./background.js";
import { initProjectModal } from "./modal.js";
import { initThesisSlider } from "./thesis.js";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);

initI18n();

// Initialize UI functionality.
initHamburgerMenu();
initSmoothScroll();
initScrollEffects();
initHeroParallax();
initTitleStagger();
initBackToTop();

// Initialize visual effects.
initSplashParticles();
initBackgroundVisuals();

const modal = initProjectModal();
initThesisSlider(modal);

removeSplash(handleHeroRightVisibility);