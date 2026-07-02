import { $$ } from "./utils.js";
import { translations } from "./data.js";

const translatableElements = $$("[data-i18n]");
const translatableLabelElements = $$("[data-i18n-label]");
const translatableSrcElements = $$("[data-i18n-src]");
const translatableHrefElements = $$("[data-i18n-href]");

export function applyTranslations(lang) {
  document.documentElement.lang = lang;

  translatableElements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const value = translations[lang]?.[key];
    if (value === undefined) {
      return;
    }

    if (element.tagName.toLowerCase() === "meta") {
      element.setAttribute("content", value);
    } else {
      element.innerHTML = value;
    }
  });

  translatableLabelElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-label");
    const value = translations[lang]?.[key];
    if (value !== undefined) {
      element.setAttribute("aria-label", value);
    }
  });

  translatableSrcElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-src");
    const value = translations[lang]?.[key];
    if (value === undefined) {
      return;
    }

    element.setAttribute("src", value);
  });

  translatableHrefElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-href");
    const value = translations[lang]?.[key];
    if (value === undefined) {
      return;
    }

    element.setAttribute("href", value);
  });

  $$(".lang-toggle").forEach((toggle) => {
    toggle.textContent = lang === "hu" ? "EN" : "HU";
  });

  localStorage.setItem("preferredLang", lang);

  // Signal to other modules (thesis slideshow)
  document.dispatchEvent(
    new CustomEvent("languageChanged", {
      detail: { lang },
    }),
  );
}

function toggleLanguage() {
  const currentLang = document.documentElement.lang || "hu";
  const nextLang = currentLang === "hu" ? "en" : "hu";
  applyTranslations(nextLang);
}

/**
 * Initializes the i18n system: loads the saved language preference
 * and sets up event listeners for the language switch buttons.
 */
export function initI18n() {
  const savedLang = localStorage.getItem("preferredLang") || "hu";
  applyTranslations(savedLang);

  $$(".lang-toggle").forEach((toggleButton) => {
    toggleButton.addEventListener("click", toggleLanguage);
  });
}