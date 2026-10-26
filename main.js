// Greenbond Finance — homepage interactions & GSAP animations.
// Fully progressively enhanced; every module falls back gracefully if scripts or markup are absent.

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- FAQ accordion ---------- */
  // Each .acc__item holds a trigger button and a panel.
  // Single-open accordion: opening one question automatically closes any other.
  // Smoothly animated with GSAP height & opacity transitions.
  const initAccordion = () => {
    const items = $$(".acc__item");
    if (!items.length) return;

    // Ensure all panels have an inner container for zero-height cleanly animated collapse
    items.forEach((item) => {
      const panel = $(".acc__panel", item);
      if (panel && !$(".acc__panel-inner", panel)) {
        const inner = document.createElement("div");
        inner.className = "acc__panel-inner";
        while (panel.firstChild) {
          inner.appendChild(panel.firstChild);
        }
        panel.appendChild(inner);
      }
    });

    const setItemOpen = (item, open, animate = false) => {
      const btn = $(".acc__btn", item);
      const panel = $(".acc__panel", item);
      if (!btn || !panel) return;

      item.dataset.open = String(open);
      btn.setAttribute("aria-expanded", String(open));

      if (animate && window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.killTweensOf(panel);
        if (open) {
          panel.hidden = false;
          // Temporarily set height to auto to compute natural full scroll height
          gsap.set(panel, { height: "auto", overflow: "hidden" });
          const targetHeight = panel.offsetHeight;
          const currentHeight = panel.style.height && panel.style.height !== "auto"
            ? parseFloat(panel.style.height)
            : 0;

          gsap.fromTo(
            panel,
            { height: currentHeight, opacity: currentHeight > 0 ? (parseFloat(panel.style.opacity) || 0) : 0 },
            {
              height: targetHeight,
              opacity: 1,
              duration: 0.32,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(panel, { clearProps: "height,overflow" });
              }
            }
          );
        } else {
          if (!panel.hidden) {
            gsap.set(panel, { overflow: "hidden" });
            gsap.to(panel, {
              height: 0,
              opacity: 0,
              duration: 0.28,
              ease: "power2.out",
              onComplete: () => {
                panel.hidden = true;
                gsap.set(panel, { clearProps: "height,opacity,overflow" });
              }
            });
          }
        }
      } else {
        panel.hidden = !open;
        if (open) {
          panel.style.removeProperty("height");
          panel.style.removeProperty("opacity");
          panel.style.removeProperty("overflow");
        }
      }
    };

    items.forEach((item) => {
      const btn = $(".acc__btn", item);
      if (!btn) return;

      // Normalise initial markup state without animation
      setItemOpen(item, item.dataset.open === "true", false);

      btn.addEventListener("click", () => {
        const isCurrentlyOpen = item.dataset.open === "true";

        if (!isCurrentlyOpen) {
          // Close all other items in the same container
          const parent = item.closest(".acc") || document;
          $$(".acc__item", parent).forEach((otherItem) => {
            if (otherItem !== item && otherItem.dataset.open === "true") {
              setItemOpen(otherItem, false, true);
            }
          });
          setItemOpen(item, true, true);
        } else {
          // Toggle closed if user clicks the active question again
          setItemOpen(item, false, true);
        }
      });
    });
  };

  /* ---------- Hero carousel ---------- */
  // The dots are a tablist: each tab owns one .hero__slide tabpanel.
  // Slides transition smoothly with GSAP crossfade and slide reveals.
  const initCarousel = () => {
    const dots = $$("#hero-dots .dot");
    const slides = $$(".hero__slide");
    const prev = $("#hero-prev");
    const next = $("#hero-next");
    if (!dots.length || !slides.length) return;

    let index = Math.max(
      0,
      dots.findIndex((d) => d.getAttribute("aria-selected") === "true")
    );

    const show = (n, focus = false) => {
      index = (n + dots.length) % dots.length;

      dots.forEach((dot, i) => {
        const active = i === index;
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
        if (active && focus) dot.focus();
      });

      slides.forEach((slide, i) => {
        const isTarget = i === index;
        if (isTarget) {
          slide.hidden = false;
          if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const body = slide.querySelector(".hero__slide__body");
            if (body) {
              gsap.fromTo(
                body,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
              );
            }
          }
        } else {
          slide.hidden = true;
        }
      });
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => show(i));
      dot.addEventListener("keydown", (e) => {
        const keys = {
          ArrowRight: index + 1,
          ArrowLeft: index - 1,
          Home: 0,
          End: dots.length - 1,
        };
        if (!(e.key in keys)) return;
        e.preventDefault();
        show(keys[e.key], true);
      });
    });

    prev?.addEventListener("click", () => show(index - 1));
    next?.addEventListener("click", () => show(index + 1));

    show(index);
  };

  /* ---------- Nav dropdown ---------- */
  const initDropdown = () => {
    const trigger = $("#products-trigger");
    const menu = $("#products-menu");
    if (!trigger || !menu) return;

    const setOpen = (open) => {
      trigger.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    };

    setOpen(false);

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(trigger.getAttribute("aria-expanded") !== "true");
    });

    const dropdown = trigger.closest(".nav__dropdown");
    let hoverTimer;

    dropdown?.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimer);
      setOpen(true);
    });

    dropdown?.addEventListener("mouseleave", () => {
      hoverTimer = setTimeout(() => setOpen(false), 120);
    });

    document.addEventListener("click", (e) => {
      if (!dropdown?.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        trigger.focus();
      }
    });

    menu.addEventListener("focusin", () => setOpen(true));
  };

  /* ---------- Mobile navigation ---------- */
  const initMobileNav = () => {
    const toggle = $("#nav-toggle");
    const nav = $("#primary-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };

    setOpen(false);

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  };

  /* ---------- Newsletter form ---------- */
  const initNewsletter = () => {
    const form = $("#newsletter-form");
    const feedback = $("#newsletter-feedback");
    if (!form || !feedback) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = $("#nl-email");
      const value = email?.value.trim() ?? "";

      if (!email?.checkValidity()) {
        email?.reportValidity();
        return;
      }

      feedback.textContent = `Thanks — we'll send updates to ${value}.`;
      feedback.hidden = false;
      feedback.dataset.state = "success";
      form.reset();
    });
  };

  /* ---------- Numbers counter animation ---------- */
  // Fast, subtle eased counter animation triggered when scrolling to .numbers.
  const initCounters = () => {
    const section = $(".numbers");
    const statNums = $$(".stat__num", section);
    if (!section || !statNums.length) return;

    const counters = statNums.map((el) => {
      const rawText = el.textContent.trim();
      const prefix = el.dataset.prefix ?? rawText.match(/^[^\d.]*/)?.[0] ?? "";
      const suffix = el.dataset.suffix ?? rawText.match(/[^\d.]*$/)?.[0] ?? "";
      const numStr = el.dataset.target ?? rawText.replace(/^[^\d.]*/, "").replace(/[^\d.]*$/, "");
      const target = parseFloat(numStr) || 0;
      const decimals = el.dataset.decimals !== undefined
        ? parseInt(el.dataset.decimals, 10)
        : (numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0);

      return { el, prefix, suffix, target, decimals, finalVal: rawText };
    });

    const formatValue = ({ prefix, suffix, decimals }, currentNum) => {
      const numFormatted = decimals > 0 ? currentNum.toFixed(decimals) : Math.round(currentNum).toString();
      return `${prefix}${numFormatted}${suffix}`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const animateCounters = () => {
      const duration = 950;
      const startTime = performance.now();
      const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      counters.forEach((item) => {
        item.el.textContent = formatValue(item, 0);
      });

      const frame = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeOutExpo(progress);

        counters.forEach((item) => {
          if (progress >= 1) {
            item.el.textContent = item.finalVal;
          } else {
            const current = item.target * eased;
            item.el.textContent = formatValue(item, current);
          }
        });

        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      };

      requestAnimationFrame(frame);
    };

    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 85%",
        once: true,
        onEnter: animateCounters
      });
    } else if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounters();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(section);
    } else {
      animateCounters();
    }
  };

  /* ---------- Comprehensive GSAP Animations ---------- */
  const initGsapAnimations = () => {
    if (!window.gsap) return;

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Obey accessibility settings
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // 1. Hero Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const nav = $(".nav");
    if (nav) {
      heroTl.from(nav, { y: -20, opacity: 0, duration: 0.7, clearProps: "transform,opacity" });
    }

    const heroBadge = $(".hero__badge");
    const heroTitle = $(".hero__title");
    const heroSub = $(".hero__sub");
    const heroActions = $$(".hero__actions .btn");
    const heroChips = $$(".chips .chip, .chips .chip__sep");
    const heroArt = $(".hero__art");
    const heroControls = $(".hero__controls");

    if (heroBadge) heroTl.from(heroBadge, { y: 20, opacity: 0, duration: 0.45 }, "-=0.3");
    if (heroTitle) heroTl.from(heroTitle, { y: 32, opacity: 0, duration: 0.6 }, "-=0.3");
    if (heroArt) heroTl.from(heroArt, { scale: 0.96, opacity: 0, duration: 0.6 }, "<+=0.1");
    if (heroSub) heroTl.from(heroSub, { y: 22, opacity: 0, duration: 0.5 }, "-=0.35");
    if (heroActions.length) heroTl.from(heroActions, { y: 20, opacity: 0, stagger: 0.08, duration: 0.45 }, "-=0.3");
    if (heroChips.length) heroTl.from(heroChips, { opacity: 0, y: 15, stagger: 0.04, duration: 0.35 }, "-=0.25");
    if (heroControls) heroTl.from(heroControls, { opacity: 0, y: 15, duration: 0.4 }, "-=0.2");

    // 2. Floating continuous micro-animations
    const coin = $(".coin");
    if (coin) {
      gsap.to(coin, {
        y: "-=14",
        rotation: 3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    const swirlA = $(".swirl--a img");
    const swirlB = $(".swirl--b img");
    if (swirlA) {
      gsap.to(swirlA, { rotation: -5, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
    if (swirlB) {
      gsap.to(swirlB, { rotation: 5, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }

    // If ScrollTrigger is available, wire up all section reveals
    if (window.ScrollTrigger) {
      // 3. Partners section
      const partners = $(".partners");
      if (partners) {
        gsap.from(".partners__label", {
          scrollTrigger: { trigger: partners, start: "top 85%", once: true },
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out"
        });
        gsap.from(".partners__logos > *", {
          scrollTrigger: { trigger: partners, start: "top 85%", once: true },
          opacity: 0,
          y: 24,
          stagger: 0.06,
          duration: 0.6,
          delay: 0.1,
          ease: "power2.out"
        });
      }

      // 4. Numbers section cards reveal
      const numbers = $(".numbers");
      if (numbers) {
        gsap.from(".numbers__row .stat", {
          scrollTrigger: { trigger: numbers, start: "top 82%", once: true },
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out"
        });
      }

      // 5. Split Sections (Loans & Investments)
      $$(".split").forEach((split) => {
        const copyItems = [
          $(".eyebrow", split),
          $(".split__title", split),
          $(".split__copy .lead", split),
          $(".split__copy .btn", split)
        ].filter(Boolean);

        gsap.from(copyItems, {
          scrollTrigger: { trigger: split, start: "top 78%", once: true },
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out"
        });

        const shape = $(".shape", split);
        if (shape) {
          gsap.from(shape, {
            scrollTrigger: { trigger: split, start: "top 78%", once: true },
            opacity: 0,
            scale: 0.95,
            y: 35,
            duration: 0.85,
            ease: "power3.out"
          });

          const photoImg = $(".shape__photo img", shape);
          if (photoImg) {
            gsap.from(photoImg, {
              scrollTrigger: { trigger: split, start: "top 78%", once: true },
              scale: 1.06,
              duration: 1.1,
              ease: "power2.out"
            });
          }
        }
      });

      // 6. Feature Cards Sections (Loans & Investments .more)
      $$(".more").forEach((more) => {
        const head = $(".more__head", more);
        if (head) {
          gsap.from(head, {
            scrollTrigger: { trigger: more, start: "top 78%", once: true },
            opacity: 0,
            y: 25,
            duration: 0.6,
            ease: "power2.out"
          });
        }

        const cards = $$(".cards .card", more);
        if (cards.length) {
          gsap.from(cards, {
            scrollTrigger: { trigger: more, start: "top 78%", once: true },
            opacity: 0,
            y: 35,
            stagger: 0.12,
            duration: 0.7,
            ease: "power3.out"
          });
        }

        const foot = $(".more__foot", more);
        if (foot) {
          gsap.from(foot, {
            scrollTrigger: { trigger: more, start: "top 78%", once: true },
            opacity: 0,
            duration: 0.6,
            delay: 0.25,
            ease: "power2.out"
          });
        }
      });

      // 7. Why Choose Us Section
      const why = $(".why");
      if (why) {
        gsap.from($(".why__copy", why), {
          scrollTrigger: { trigger: why, start: "top 78%", once: true },
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: "power3.out"
        });

        gsap.from($(".why__photo", why), {
          scrollTrigger: { trigger: why, start: "top 78%", once: true },
          opacity: 0,
          scale: 0.96,
          duration: 0.9,
          ease: "power3.out"
        });

        const values = $$(".values .value", why);
        if (values.length) {
          gsap.from(values, {
            scrollTrigger: { trigger: $(".values", why) || why, start: "top 80%", once: true },
            opacity: 0,
            y: 30,
            stagger: 0.09,
            duration: 0.7,
            ease: "power3.out"
          });
        }
      }

      // 8. Testimonials Section
      const testi = $(".testi");
      if (testi) {
        gsap.from($(".testi__head", testi), {
          scrollTrigger: { trigger: testi, start: "top 78%", once: true },
          opacity: 0,
          y: 25,
          duration: 0.6,
          ease: "power2.out"
        });

        const tFeature = $(".t-feature", testi);
        if (tFeature) {
          gsap.from(tFeature, {
            scrollTrigger: { trigger: testi, start: "top 78%", once: true },
            opacity: 0,
            y: 35,
            duration: 0.8,
            delay: 0.1,
            ease: "power3.out"
          });
        }

        const tCards = $$(".t-row .t-card", testi);
        if (tCards.length) {
          gsap.from(tCards, {
            scrollTrigger: { trigger: $(".t-row", testi) || testi, start: "top 80%", once: true },
            opacity: 0,
            y: 30,
            stagger: 0.12,
            duration: 0.7,
            ease: "power3.out"
          });
        }
      }

      // 9. FAQ Section
      const faq = $(".faq");
      if (faq) {
        gsap.from($$(".faq__left > *", faq), {
          scrollTrigger: { trigger: faq, start: "top 78%", once: true },
          opacity: 0,
          y: 25,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out"
        });

        gsap.from($$(".acc__item", faq), {
          scrollTrigger: { trigger: faq, start: "top 78%", once: true },
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out"
        });
      }

      // 10. CTA Section
      const cta = $(".cta");
      if (cta) {
        gsap.from($(".cta__box", cta), {
          scrollTrigger: { trigger: cta, start: "top 78%", once: true },
          opacity: 0,
          scale: 0.96,
          y: 30,
          duration: 0.8,
          ease: "power3.out"
        });

        const ctaPhoto = $(".cta__photo", cta);
        if (ctaPhoto) {
          gsap.from(ctaPhoto, {
            scrollTrigger: { trigger: cta, start: "top 78%", once: true },
            opacity: 0,
            x: 40,
            duration: 1,
            ease: "power3.out"
          });
        }

        gsap.from($$(".cta__copy > *", cta), {
          scrollTrigger: { trigger: cta, start: "top 78%", once: true },
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          delay: 0.15,
          ease: "power3.out"
        });
      }

      // 11. Footer Section
      const footer = $(".footer");
      if (footer) {
        const footerBlocks = [
          $(".footer__top", footer),
          $(".footer__cols", footer),
          $(".footer__base", footer)
        ].filter(Boolean);

        gsap.from(footerBlocks, {
          scrollTrigger: { trigger: footer, start: "top 85%", once: true },
          opacity: 0,
          y: 20,
          stagger: 0.12,
          duration: 0.7,
          ease: "power2.out"
        });
      }
    }
  };

  initAccordion();
  initCarousel();
  initCounters();
  initDropdown();
  initMobileNav();
  initNewsletter();
  initGsapAnimations();
})();
