// FAQ accordion — only items that have an answer in the design are expandable.
document.querySelectorAll(".acc__item--live").forEach((item) => {
  const btn = item.querySelector(".acc__btn");
  const panel = item.querySelector(".acc__panel");
  btn.addEventListener("click", () => {
    const open = item.dataset.open !== "true";
    item.dataset.open = String(open);
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  });
});

// Hero slide indicator. The Figma file contains a single hero slide, so the
// controls only move the active dot; plug real slide content in where noted.
(() => {
  const dots = [...document.querySelectorAll("#hero-dots .dot")];
  let i = 0;
  const go = (n) => {
    i = (n + dots.length) % dots.length;
    dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
    // TODO: swap hero content for slide `i` once slide designs exist.
  };
  document.getElementById("hero-prev").addEventListener("click", () => go(i - 1));
  document.getElementById("hero-next").addEventListener("click", () => go(i + 1));
})();
