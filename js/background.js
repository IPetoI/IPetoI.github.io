import { randomBetween } from "./utils.js";
import { appState } from "./data.js";

/**
 * Creates a container (or reuses an existing one) and populates it
 * with randomly positioned animated elements.
 *
 * @param {HTMLElement} container - The container that holds the generated elements.
 * @param {number} count - The number of elements to generate.
 * @param {() => HTMLElement} createElement - A function that creates a single element.
 */
function fillContainerWithRandomElements(container, count, createElement) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    container.appendChild(createElement(i));
  }
}

/**
 * Generates background particles behind the content.
 *
 * @param {number} count - Number of particles (default: 18)
 */
export function generateBgParticles(count = 18) {
  const container = document.getElementById("bgParticles");
  if (!container) {
    return;
  }

  fillContainerWithRandomElements(container, count, () => {
    const particle = document.createElement("div");
    particle.className = "bg-particle";

    const size = 4 + Math.random() ** 2 * 10;
    particle.style.width = particle.style.height = `${size}px`;
    particle.style.left = `${randomBetween(0, 100)}%`;
    particle.style.top = `${randomBetween(0, 100)}%`;
    particle.style.opacity = randomBetween(0.5, 0.2).toFixed(2);
    particle.style.animationDuration = `${randomBetween(8, 20)}s`;
    particle.style.animationDelay = `${randomBetween(0, 5)}s`;

    return particle;
  });
}

/**
 * Generates geometric background shapes (triangle, square, circle).
 *
 * @param {number} count - Number of shapes (default: 20)
 */
export function generateShapes(count = 20) {
  let container = document.getElementById("bgShapes");

  if (!container) {
    container = document.createElement("div");
    container.id = "bgShapes";
    container.className = "bg-shapes";
    document.body.appendChild(container);
  }

  const shapeTypes = ["triangle", "square", "circle"];

  fillContainerWithRandomElements(container, count, () => {
    const shape = document.createElement("div");
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    shape.classList.add("shape", `shape-${type}`);

    const size = randomBetween(24, 156);
    shape.style.setProperty("--size", `${size}px`);
    shape.style.setProperty("--color", "rgba(0, 100, 90, 0.4)");
    shape.style.left = `${randomBetween(0, 100)}%`;
    shape.style.top = `${randomBetween(0, 100)}%`;
    shape.style.animationDuration = `${randomBetween(35, 60)}s`;
    shape.style.animationDelay = `-${randomBetween(0, 60)}s`;
    shape.style.transition = "transform 0.4s ease-out, opacity 0.3s ease-out";

    return shape;
  });
}

// Updates the position of background shapes based on scrolling, with momentum effect.
export function updateShapesOnScroll() {
  const shapes = document.querySelectorAll(".bg-shapes .shape");
  const scrollY = window.scrollY;
  const scrollDelta = scrollY - appState.lastScrollY;

  appState.lastScrollY = scrollY;
  appState.shapeMomentum += scrollDelta * 0.3;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = maxScroll ? scrollY / maxScroll : 0.5;

  shapes.forEach((shape, index) => {
    const moveFactor = 0.2 + (index % 2) * 5;
    const moveDistance = scrollY * moveFactor * appState.shapeMomentum * 3;
    const rotation = moveDistance * 2;
    const opacity = 0.1 + scrollPercentage * 0.1;

    shape.style.transform = `translateY(${moveDistance}px) rotate(${rotation}deg)`;
    shape.style.opacity = opacity;
  });
}

export function initBackgroundVisuals() {
  generateBgParticles(18);
  generateShapes(24);
  window.addEventListener("scroll", updateShapesOnScroll);
}