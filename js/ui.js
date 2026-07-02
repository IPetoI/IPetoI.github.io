export function initHamburgerMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navMenu = document.getElementById("navMenu");

  if (!hamburgerMenu || !navMenu) {
    return;
  }

  hamburgerMenu.addEventListener("click", () => {
    const isOpen = hamburgerMenu.getAttribute("aria-expanded") === "true";
    hamburgerMenu.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking a navigation link.
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburgerMenu.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("active");
    });
  });

  // Close menu when clicking outside the navigation.
  document.addEventListener("click", (e) => {
    if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
      hamburgerMenu.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("active");
    }
  });
}

// Initialize smooth scrolling for internal links starting with '#'.
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));

      if (!target) {
        return;
      }

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/**
 * Updates the scroll progress bar (based on a CSS variable
 * used in base.css to control the fixed bar width).
 */
export function updateScrollIndicator() {
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = (window.scrollY / scrollHeight) * 100;
  document.documentElement.style.setProperty(
    "--scroll-percentage",
    `${scrollPercentage}%`,
  );
}

/**
 * Controls the visibility of the hero right panel during scrolling.
 * Hides the panel once the hero section is out of view.
 * H1 and p elements inside the panel are animated in with a staggered effect
 * when the hero section is visible.
 */
export function handleHeroRightVisibility() {
  const heroSection = document.querySelector(".hero-section");
  const heroRight = document.querySelector(".hero-right");
  const splashScreen = document.getElementById("splashScreen");

  if (!heroSection || !heroRight) {
    return;
  }
  
  if (splashScreen) {
    heroRight.classList.remove("animate-in");
    heroRight.classList.remove("show-text");
    heroRight.classList.add("hidden");
    return;
  }

  const rect = heroSection.getBoundingClientRect();

  if (rect.bottom <= 0) {
    heroRight.classList.remove("animate-in");
    heroRight.classList.remove("show-text");
    heroRight.classList.add("hidden");
  } else {
    if (!heroRight.classList.contains("animate-in")) {
      heroRight.classList.remove("hidden");

      requestAnimationFrame(() => {
        heroRight.classList.add("animate-in");

        setTimeout(() => {
          heroRight.classList.add("show-text");
        }, 700);
      });
    }
  }
}

/**
 * Splits all section titles into individual characters so CSS can
 * animate them with a staggered effect, revealing each character
 * one by one when the section becomes visible.
 */
export function initTitleStagger() {
  document.querySelectorAll(".section-title").forEach((title) => {
    if (title.dataset.staggered === "true") {
      return;
    }

    const text = title.textContent;
    title.innerHTML = "";
    title.setAttribute("aria-label", text);

    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      span.className = "title-char";
      span.style.setProperty("--char-index", i);
      span.textContent = char === " " ? "\u00A0" : char;
      title.appendChild(span);
    });

    title.dataset.staggered = "true";
  });
}

/**
 * Scroll-based reveal effects initialization.
 * The marked elements receive the `.visible` class
 * when they are scrolled into the visible area.
 */
export function initScrollEffects() {
  const revealSections = document.querySelectorAll(
    "section, .project-card, .timeline-year, .timeline-note",
  );

  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;

    revealSections.forEach((section) => {
      if (section.getBoundingClientRect().top < triggerBottom) {
        section.classList.add("visible");
      }
    });
  };

  const onScrollOrLoad = () => {
    revealOnScroll();
    updateScrollIndicator();
    handleHeroRightVisibility();
  };

  window.addEventListener("scroll", onScrollOrLoad);
  window.addEventListener("load", onScrollOrLoad);

  onScrollOrLoad();
}

/**
 * Hero section parallax effect: applies a subtle 3D rotation
 * to the profile image based on mouse movement.
 */
export function initHeroParallax() {
  const heroLeft = document.querySelector(".hero-left");
  if (!heroLeft) {
    return;
  }

  document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth - e.clientX * 2) / 100;
    const y = (window.innerHeight - e.clientY * 2) / 100;
    heroLeft.style.transform = `perspective(1000px) rotateY(${x * 0.5}deg) rotateX(${y * 0.5}deg)`;
  });

  document.addEventListener("mouseleave", () => {
    heroLeft.style.transform = "perspective(1000px) rotateY(0) rotateX(0)";
  });
}

export function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) {
    return;
  }

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}