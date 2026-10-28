// =============================================================
// TECH AAKRITI 2027 — SPIDER-MAN CUSTOM ANIMATED CURSOR (ADVANCED)
// High-performance sticker hand, Spidey-Sense, Web Throwing FX & Drag Slinging
// =============================================================

export class SpiderCursor {
  constructor() {
    this.root = null;
    this.wrapper = null;
    this.hoverWeb = null;
    this.glowBox = null;
    this.defaultIcon = null;
    this.shootIcon = null;
    this.dragIcon = null;
    this.loadingIcon = null;

    // Live Web Slinging SVG element
    this.slingSvg = null;
    this.slingPath = null;
    this.slingZigzag = null;

    // Pointer state
    this.x = -100;
    this.y = -100;
    this.targetX = -100;
    this.targetY = -100;
    this.lastX = -100;
    this.lastY = -100;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Aerodynamic flight banking & animation physics
    this.currentTilt = 0;
    this.senseTimeout = null;

    // State flags
    this.isInitialized = false;
    this.isVisible = false;
    this.isMouseDown = false;
    this.isDragging = false;
    this.isHovering = false;
    this.isTextMode = false;
    this.isLoading = false;
    this.prefersReducedMotion = false;

    // Throttles & intervals
    this.rafId = null;
    this.loadingObserver = null;

    // Bound listeners for clean removal
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);
    this.onMouseEnter = this.handleMouseEnter.bind(this);
    this.onWindowResize = this.handleResize.bind(this);
    this.onVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  init() {
    if (typeof window === "undefined" || this.isInitialized) return this;

    // Check pointer capabilities: do NOT hijack touch / coarse pointer devices
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) {
      return this;
    }

    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", (e) => {
        this.prefersReducedMotion = e.matches;
      });
    }

    this.buildDOM();
    this.bindEvents();
    this.initLoadingWatcher();
    this.startLoop();

    document.documentElement.classList.add("has-spider-cursor");
    this.isInitialized = true;
    return this;
  }

  buildDOM() {
    // Prevent duplicate DOM elements
    const existing = document.getElementById("spider-cursor-root");
    if (existing) {
      existing.remove();
    }

    const root = document.createElement("div");
    root.id = "spider-cursor-root";
    root.className = "spider-cursor-root";
    root.setAttribute("aria-hidden", "true");

    root.innerHTML = `
      <div class="spider-cursor-wrapper" id="spider-cursor-wrapper">
        <!-- Spidey-Sense Warning Waves (Flashes on interactive target encounter) -->
        <div class="spider-sense-aura" id="spider-sense-aura">
          <svg class="spider-sense-svg" viewBox="0 0 60 30" fill="none">
            <path class="sense-arc arc-3" d="M 5,26 Q 30,2 55,26" />
            <path class="sense-arc arc-2" d="M 12,27 Q 30,8 48,27" />
            <path class="sense-arc arc-1" d="M 19,28 Q 30,14 41,28" />
          </svg>
        </div>

        <!-- Glowing Spider Emblem Accent (Reduced size: 32x38px) -->
        <div class="spider-cursor-glow">
          <img src="/cursor/spider-symbol-glow.png" alt="" class="spider-glow-img" draggable="false" />
        </div>

        <!-- Radial Animated Web Halo (Hover state: 82x82px) -->
        <div class="spider-cursor-hover-web" id="spider-cursor-hover-web">
          <svg class="spider-hover-web-svg" viewBox="0 0 120 120" fill="none">
            <!-- 8 Web Spokes -->
            <line class="web-line" x1="60" y1="60" x2="60" y2="4" />
            <line class="web-line" x1="60" y1="60" x2="100" y2="20" />
            <line class="web-line" x1="60" y1="60" x2="116" y2="60" />
            <line class="web-line" x1="60" y1="60" x2="100" y2="100" />
            <line class="web-line" x1="60" y1="60" x2="60" y2="116" />
            <line class="web-line" x1="60" y1="60" x2="20" y2="100" />
            <line class="web-line" x1="60" y1="60" x2="4" y2="60" />
            <line class="web-line" x1="60" y1="60" x2="20" y2="20" />
            <!-- Concentric Web Rings -->
            <polygon class="web-spiral spiral-3" points="60,14 92,27 106,60 92,93 60,106 28,93 14,60 28,27" />
            <polygon class="web-spiral spiral-2" points="60,26 84,36 94,60 84,84 60,94 36,84 26,60 36,36" />
            <polygon class="web-spiral spiral-1" points="60,40 74,46 80,60 74,74 60,80 46,74 40,60 46,46" />
            <!-- Sticky Web Droplets at outer intersections -->
            <circle class="web-hover-node" cx="60" cy="14" r="2.2" />
            <circle class="web-hover-node" cx="92" cy="27" r="2.2" />
            <circle class="web-hover-node" cx="106" cy="60" r="2.2" />
            <circle class="web-hover-node" cx="92" cy="93" r="2.2" />
            <circle class="web-hover-node" cx="60" cy="106" r="2.2" />
            <circle class="web-hover-node" cx="28" cy="93" r="2.2" />
            <circle class="web-hover-node" cx="14" cy="60" r="2.2" />
            <circle class="web-hover-node" cx="28" cy="27" r="2.2" />
          </svg>
        </div>

        <!-- Hand Icons Stack -->
        <div class="spider-cursor-hand">
          <img src="/cursor/spider-hand-default.png" alt="" class="spider-icon icon-default" draggable="false" />
          <img src="/cursor/spider-hand-shoot.png" alt="" class="spider-icon icon-shoot" draggable="false" />
          <img src="/cursor/spider-hand-drag.png" alt="" class="spider-icon icon-drag" draggable="false" />
          <img src="/cursor/spider-loading.png" alt="" class="spider-icon icon-loading" draggable="false" />
        </div>
      </div>
    `;

    document.body.appendChild(root);

    this.root = root;
    this.wrapper = root.querySelector(".spider-cursor-wrapper");
    this.hoverWeb = root.querySelector(".spider-cursor-hover-web");
    this.glowBox = root.querySelector(".spider-cursor-glow");
    this.defaultIcon = root.querySelector(".icon-default");
    this.shootIcon = root.querySelector(".icon-shoot");
    this.dragIcon = root.querySelector(".icon-drag");
    this.loadingIcon = root.querySelector(".icon-loading");

    // Build Live Drag Slinging SVG container
    const sling = document.createElement("div");
    sling.id = "spider-sling-container";
    sling.className = "spider-sling-svg";
    sling.setAttribute("aria-hidden", "true");
    sling.style.display = "none";
    sling.innerHTML = `
      <svg width="100%" height="100%">
        <path class="spider-sling-zigzag" d="" />
        <path class="spider-sling-line" d="" />
      </svg>
    `;
    document.body.appendChild(sling);
    this.slingSvg = sling;
    this.slingPath = sling.querySelector(".spider-sling-line");
    this.slingZigzag = sling.querySelector(".spider-sling-zigzag");
  }

  bindEvents() {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    document.addEventListener("mouseleave", this.onMouseLeave);
    document.addEventListener("mouseenter", this.onMouseEnter);
    window.addEventListener("resize", this.onWindowResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    // Keyboard navigation focus check
    window.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (this.root) {
          this.root.classList.remove("is-hovering");
          this.root.classList.remove("has-spidey-sense");
        }
      }
    });
  }

  handlePointerMove(e) {
    // Keep coordinates within viewport boundaries
    this.targetX = Math.max(0, Math.min(window.innerWidth, e.clientX));
    this.targetY = Math.max(0, Math.min(window.innerHeight, e.clientY));

    if (!this.isVisible) {
      this.isVisible = true;
      this.x = this.targetX;
      this.y = this.targetY;
      if (this.root) this.root.classList.add("is-visible");
    }

    // Check dragging state if mouse is down
    if (this.isMouseDown) {
      const dx = this.targetX - this.dragStartX;
      const dy = this.targetY - this.dragStartY;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        if (!this.isDragging) {
          this.isDragging = true;
          if (this.root) this.root.classList.add("is-dragging");
          if (this.slingSvg) this.slingSvg.style.display = "block";
        }

        // Update live elastic web slinging line with physics sag and wobble
        this.updateSlingWeb(this.dragStartX, this.dragStartY, this.targetX, this.targetY);
      }
    }

    // Check hovered target
    this.checkHoverTarget(e.target);
  }

  updateSlingWeb(x1, y1, x2, y2) {
    if (!this.slingPath || this.prefersReducedMotion) return;

    const dx = x1 - x2;
    const dy = y1 - y2;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) return;

    const rayAngleRad = Math.atan2(dy, dx);

    // Ray originates directly at the hand's fingertips/web-shooter in the ray direction
    const wristX = x2 + Math.cos(rayAngleRad) * 14;
    const wristY = y2 + Math.sin(rayAngleRad) * 14;

    // Dynamic tension: as web is pulled further, it tightens (less sag)
    const tension = Math.min(1, dist / 350);
    const sag = (1 - tension * 0.7) * Math.min(35, dist * 0.15);

    // Harmonic vibration wave
    const wobble = Math.sin(performance.now() * 0.024) * (2 + tension * 3);

    const midX = (x1 + wristX) / 2;
    const midY = (y1 + wristY) / 2 + sag + wobble;

    const d = `M ${x1} ${y1} Q ${midX} ${midY} ${wristX} ${wristY}`;
    this.slingPath.setAttribute("d", d);
    if (this.slingZigzag) {
      this.slingZigzag.setAttribute("d", d);
    }
  }

  triggerSpideySense() {
    if (this.prefersReducedMotion || !this.root) return;
    this.root.classList.add("has-spidey-sense");
    if (this.senseTimeout) clearTimeout(this.senseTimeout);
    this.senseTimeout = setTimeout(() => {
      if (this.root) {
        this.root.classList.remove("has-spidey-sense");
      }
    }, 550);
  }

  checkHoverTarget(target) {
    if (!target || !this.root) return;

    // 1. Check if hovering over editable text or input
    const isTextInput = target.closest(
      'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"], .selectable-text'
    );

    if (isTextInput) {
      if (!this.isTextMode) {
        this.isTextMode = true;
        this.root.classList.add("is-text");
      }
      return;
    } else {
      if (this.isTextMode) {
        this.isTextMode = false;
        this.root.classList.remove("is-text");
      }
    }

    // 2. Check interactive / clickable elements
    const isInteractive = target.closest(
      'a, button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"], select, summary, .team-card, .domain-pill, .category-item, .card, .venue-action-btn, .clear-search-btn, .reset-filter-btn, .modal-close-btn, .menu, .aftermovie-yt-btn, .aftermovie-sound-btn, .clickable, [data-cursor="pointer"], .nav-link, .nav-logo, .social-icon, .sponsor-card, .event-card, .faq-header, .stat-card, .pill, .filter-chip'
    );

    if (isInteractive && !this.isHovering && !this.isDragging) {
      this.isHovering = true;
      this.root.classList.add("is-hovering");
      // Trigger Spidey-Sense warning flash
      this.triggerSpideySense();
    } else if (!isInteractive && this.isHovering) {
      this.isHovering = false;
      this.root.classList.remove("is-hovering");
      this.root.classList.remove("has-spidey-sense");
    }
  }

  handlePointerDown(e) {
    if (e.button !== 0) return; // Left click only
    this.isMouseDown = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    if (this.root && !this.isTextMode) {
      this.root.classList.add("is-clicking");
    }

    // THROW WEB! Shoots a web strand & anchors a web splat at the clicked position
    this.throwWeb(e.clientX, e.clientY);
  }

  handlePointerUp() {
    this.isMouseDown = false;

    if (this.isDragging) {
      this.isDragging = false;
      this.currentTilt = 0; // Reset rotation cleanly
      if (this.root) this.root.classList.remove("is-dragging");
      if (this.slingSvg) {
        // Quick snap fade on release
        this.slingSvg.style.display = "none";
        if (this.slingPath) this.slingPath.setAttribute("d", "");
      }
    }

    if (this.root) {
      this.root.classList.remove("is-clicking");
    }
  }

  handleMouseLeave() {
    this.isVisible = false;
    if (this.root) {
      this.root.classList.remove("is-visible");
      this.root.classList.remove("is-hovering");
      this.root.classList.remove("is-clicking");
      this.root.classList.remove("is-dragging");
      this.root.classList.remove("has-spidey-sense");
    }
    if (this.slingSvg) this.slingSvg.style.display = "none";
  }

  handleMouseEnter() {
    this.isVisible = true;
    if (this.root) {
      this.root.classList.add("is-visible");
    }
  }

  handleResize() {
    this.targetX = Math.max(0, Math.min(window.innerWidth, this.targetX));
    this.targetY = Math.max(0, Math.min(window.innerHeight, this.targetY));
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.handleMouseLeave();
    }
  }

  // -------------------------------------------------------------
  // REAL LOADING DETECTION WATCHER
  // (Observes .is-loading class and #preloader visibility)
  // -------------------------------------------------------------
  initLoadingWatcher() {
    const updateLoadingState = () => {
      const preloader = document.getElementById("preloader");
      const hasLoadingClass =
        document.documentElement.classList.contains("is-loading") ||
        document.body.classList.contains("is-loading");
      const isPreloaderActive =
        preloader &&
        window.getComputedStyle(preloader).display !== "none" &&
        window.getComputedStyle(preloader).opacity !== "0";

      const currentlyLoading = Boolean(hasLoadingClass || isPreloaderActive);

      if (currentlyLoading !== this.isLoading) {
        this.isLoading = currentlyLoading;
        if (this.root) {
          if (this.isLoading) {
            this.root.classList.add("is-loading");
          } else {
            this.root.classList.remove("is-loading");
          }
        }
      }
    };

    updateLoadingState();

    // Observe documentElement & body class mutations
    this.loadingObserver = new MutationObserver(() => {
      updateLoadingState();
    });

    this.loadingObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (document.body) {
      this.loadingObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    const preloader = document.getElementById("preloader");
    if (preloader) {
      this.loadingObserver.observe(preloader, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    window.addEventListener("load", () => {
      setTimeout(updateLoadingState, 100);
      setTimeout(updateLoadingState, 800);
    });
  }

  // -------------------------------------------------------------
  // THROW WEB EFFECT ON CLICK
  // Shoots an animated web strand, splats a spiderweb & emits sparks
  // -------------------------------------------------------------
  throwWeb(targetX, targetY) {
    if (this.prefersReducedMotion) return;

    // 1. Spawn the web line shooting from the wrist towards target
    const wristX = targetX + 14;
    const wristY = targetY + 38;

    const strandSvg = document.createElement("div");
    strandSvg.className = "spider-thrown-strand";
    strandSvg.setAttribute("aria-hidden", "true");
    strandSvg.innerHTML = `
      <svg width="100%" height="100%">
        <line class="thrown-strand-path" x1="${wristX}" y1="${wristY}" x2="${targetX}" y2="${targetY}" />
      </svg>
    `;
    document.body.appendChild(strandSvg);

    // 2. Spawn the Web Splat impact at target
    const splat = document.createElement("div");
    splat.className = "spider-web-splat";
    splat.style.left = `${targetX}px`;
    splat.style.top = `${targetY}px`;
    splat.setAttribute("aria-hidden", "true");

    splat.innerHTML = `
      <svg viewBox="0 0 140 140" class="web-splat-svg">
        <!-- Expanding Web Shockwave Halo -->
        <circle class="web-splat-shockwave" cx="70" cy="70" r="15" />

        <!-- 8 Radial Spokes -->
        <line class="web-splat-spoke" x1="70" y1="70" x2="70" y2="8" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="114" y2="26" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="132" y2="70" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="114" y2="114" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="70" y2="132" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="26" y2="114" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="8" y2="70" />
        <line class="web-splat-spoke" x1="70" y1="70" x2="26" y2="26" />

        <!-- 3 Concentric Polygonal Web Threads -->
        <polygon class="web-splat-spiral outer" points="70,20 105,35 120,70 105,105 70,120 35,105 20,70 35,35" />
        <polygon class="web-splat-spiral mid" points="70,36 94,46 104,70 94,94 70,104 46,94 36,70 46,46" />
        <polygon class="web-splat-spiral inner" points="70,52 83,57 88,70 83,83 70,88 57,83 52,70 57,57" />

        <!-- Sticky Web Droplets at outer intersections -->
        <circle class="web-splat-node" cx="70" cy="20" r="2.5" />
        <circle class="web-splat-node" cx="105" cy="35" r="2.5" />
        <circle class="web-splat-node" cx="120" cy="70" r="2.5" />
        <circle class="web-splat-node" cx="105" cy="105" r="2.5" />
        <circle class="web-splat-node" cx="70" cy="120" r="2.5" />
        <circle class="web-splat-node" cx="35" cy="105" r="2.5" />
        <circle class="web-splat-node" cx="20" cy="70" r="2.5" />
        <circle class="web-splat-node" cx="35" cy="35" r="2.5" />

        <!-- Central Web Core -->
        <circle class="web-splat-core" cx="70" cy="70" r="4.5" />
      </svg>
    `;

    document.body.appendChild(splat);

    // 3. Spawn Web Sparks / Silk Shrapnel
    this.spawnWebParticles(targetX, targetY);

    // Clean up DOM nodes after animations complete
    setTimeout(() => {
      strandSvg.remove();
    }, 380);

    setTimeout(() => {
      splat.remove();
    }, 450);
  }

  // -------------------------------------------------------------
  // WEB IMPACT SILK SPARKS / SHRAPNEL
  // -------------------------------------------------------------
  spawnWebParticles(x, y) {
    if (this.prefersReducedMotion) return;
    const container = document.createElement("div");
    container.className = "spider-sparks-container";
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.setAttribute("aria-hidden", "true");

    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.45;
      const dist = 24 + Math.random() * 26;
      const dx = (Math.cos(angle) * dist).toFixed(1);
      const dy = (Math.sin(angle) * dist).toFixed(1);

      const p = document.createElement("span");
      p.className = "spider-spark-particle";
      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      container.appendChild(p);
    }

    document.body.appendChild(container);

    setTimeout(() => {
      container.remove();
    }, 420);
  }

  // -------------------------------------------------------------
  // MAIN ANIMATION LOOP (requestAnimationFrame)
  // Direct zero-lag precision tracking + dynamic ray alignment rotation
  // -------------------------------------------------------------
  startLoop() {
    const loop = () => {
      if (this.root && this.isVisible) {
        // Direct zero-lag position update for precision pointing
        this.x = this.targetX;
        this.y = this.targetY;

        // Calculate pointer velocity for aerodynamic banking
        const vx = this.x - this.lastX;
        const vy = this.y - this.lastY;

        let tiltTransform = "";

        if (!this.prefersReducedMotion) {
          let targetAngle = 0;

          if (this.isDragging) {
            // Lock hand rotation dynamically to point along the ray towards the anchor
            const dx = this.dragStartX - this.x;
            const dy = this.dragStartY - this.y;
            if (Math.hypot(dx, dy) > 2) {
              const rayAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
              // spider-hand-drag.png naturally points at -135deg (up-left).
              // Rotating by rayAngle + 135deg aims the fingers directly along the ray towards anchor!
              this.currentTilt = rayAngle + 135;
            }
          } else if (this.isHovering) {
            // While hovering: subtle interactive wobble to mouse velocity
            targetAngle = Math.max(-8, Math.min(8, vx * 0.25));
            this.currentTilt += (targetAngle - this.currentTilt) * 0.22;
          } else {
            // Free flight: natural aerodynamic banking into turns
            targetAngle = Math.max(-12, Math.min(12, vx * 0.45));
            this.currentTilt += (targetAngle - this.currentTilt) * 0.22;
          }

          if (Math.abs(this.currentTilt) > 0.05) {
            tiltTransform = ` rotate(${this.currentTilt.toFixed(1)}deg)`;
          }
        }

        this.root.style.transform = `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0)${tiltTransform}`;

        this.lastX = this.x;
        this.lastY = this.y;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.loadingObserver) {
      this.loadingObserver.disconnect();
      this.loadingObserver = null;
    }
    if (this.senseTimeout) {
      clearTimeout(this.senseTimeout);
      this.senseTimeout = null;
    }

    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("mouseleave", this.onMouseLeave);
    document.removeEventListener("mouseenter", this.onMouseEnter);
    window.removeEventListener("resize", this.onWindowResize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);

    document.documentElement.classList.remove("has-spider-cursor");

    if (this.root) {
      this.root.remove();
      this.root = null;
    }
    if (this.slingSvg) {
      this.slingSvg.remove();
      this.slingSvg = null;
    }

    this.isInitialized = false;
  }
}

// Global Singleton Initialization
let globalCursorInstance = null;

export function initSpiderCursor() {
  if (typeof window === "undefined") return null;

  if (window.__techAakritiSpiderCursor) {
    return window.__techAakritiSpiderCursor;
  }

  globalCursorInstance = new SpiderCursor();
  globalCursorInstance.init();
  window.__techAakritiSpiderCursor = globalCursorInstance;

  return globalCursorInstance;
}

// Self-initialize automatically when script is loaded in browser
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initSpiderCursor();
    });
  } else {
    initSpiderCursor();
  }
}
