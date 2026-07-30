const EMAIL = "venkatashashankg@gmail.com";
const GITHUB_USER = "Shashi552";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function setupHeader() {
  const header = qs("[data-header]");
  const toggle = qs("[data-nav-toggle]");
  const menu = qs("[data-nav-menu]");

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu?.classList.toggle("is-open", !open);
    document.body.classList.toggle("nav-open", !open);
  });

  qsa("a", menu).forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      menu?.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

function setupRevealAnimations() {
  const revealItems = qsa(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupActiveNavigation() {
  const links = qsa(".nav-links a[href^='#']");
  const sections = links
    .map((link) => qs(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-34% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function animateCounters() {
  const counters = qsa("[data-count]");

  const runCounter = (counter) => {
    const target = Number(counter.dataset.count || 0);
    const duration = 1100;
    const started = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased).toString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupTypewriter() {
  const line = qs("[data-typewriter]");
  if (!line) return;

  const text = line.dataset.text || "";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    line.textContent = text;
    return;
  }

  let index = 0;
  const type = () => {
    line.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) setTimeout(type, 52);
  };

  setTimeout(type, 520);
}

async function hydrateGitHubMetadata() {
  const cards = qsa("[data-repo]");
  if (!cards.length || !("fetch" in window)) return;

  await Promise.allSettled(
    cards.map(async (card) => {
      const repo = card.dataset.repo;
      const meta = qs(".repo-meta", card);
      if (!repo || !meta) return;

      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
        });

        if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);

        const data = await response.json();
        const updated = new Intl.DateTimeFormat("en", {
          month: "short",
          year: "numeric",
        }).format(new Date(data.updated_at));

        meta.textContent = `★ ${data.stargazers_count} · Forks ${data.forks_count} · Updated ${updated}`;
      } catch (error) {
        meta.textContent = "Open on GitHub";
      }
    })
  );
}

function setupContactForm() {
  const form = qs("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const senderEmail = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`Portfolio inquiry from ${name || "website visitor"}`);
    const body = encodeURIComponent(
      `Hi Shashank,\n\n${message}\n\nRegards,\n${name}\n${senderEmail}`
    );

    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  });
}

function setupUtilityActions() {
  qs("[data-year]").textContent = new Date().getFullYear().toString();

  qs("[data-print]")?.addEventListener("click", () => window.print());

  qs("[data-copy-email]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(EMAIL);
      button.textContent = "Email copied";
    } catch (error) {
      window.location.href = `mailto:${EMAIL}`;
      button.textContent = "Opening email";
    }

    setTimeout(() => {
      button.textContent = original;
    }, 1800);
  });
}

setupHeader();
setupRevealAnimations();
setupActiveNavigation();
animateCounters();
setupTypewriter();
hydrateGitHubMetadata();
setupContactForm();
setupUtilityActions();
