// Greenbond Finance — homepage interactions.
// No dependencies; every module is a no-op when its markup is absent.

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- FAQ accordion ---------- */
  // Each .acc__item holds a trigger button and a panel. The trigger owns
  // aria-expanded; the panel is hidden when collapsed.
  const initAccordion = () => {
    $$(".acc__item").forEach((item) => {
      const btn = $(".acc__btn", item);
      const panel = $(".acc__panel", item);
      if (!btn || !panel) return;

      const setOpen = (open) => {
        item.dataset.open = String(open);
        btn.setAttribute("aria-expanded", String(open));
        panel.hidden = !open;
      };

      // Normalise the markup so CSS and ARIA agree on the initial state.
      setOpen(item.dataset.open === "true");

      btn.addEventListener("click", () => {
        setOpen(item.dataset.open !== "true");
      });
    });
  };

  /* ---------- Hero carousel ---------- */
  // The dots are a tablist: each tab owns one .hero__slide tabpanel.
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
        // Roving tabindex: only the selected tab is in the tab order.
        dot.tabIndex = active ? 0 : -1;
        if (active && focus) dot.focus();
      });

      slides.forEach((slide, i) => {
        slide.hidden = i !== index;
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
  // Disclosure pattern: the trigger owns aria-expanded, the panel is a
  // plain list of links.
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

    // Pointer users get hover-to-open; keyboard and touch use the click.
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

    // Follow focus into the panel keeps it open for keyboard users.
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

    // Any navigation closes the panel.
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Leaving the mobile breakpoint should not strand the menu open.
    window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  };

  /* ---------- Newsletter form ---------- */
  // There is no backend wired up yet, so the form validates and reports
  // back locally instead of navigating.
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

  initAccordion();
  initCarousel();
  initDropdown();
  initMobileNav();
  initNewsletter();
})();
