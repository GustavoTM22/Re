/* ============================================================
   GUSTAVO & EVELIN · REVELACIÓN DE GÉNERO
   Interacciones, música y pequeños milagros.
   ============================================================ */
(() => {
  "use strict";

  const CONFIG = window.SITE_CONFIG || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const app = {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  let toastTimer = null;
  let audio = null;

  function getPath(path, fallback = "") {
    return path.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), CONFIG) ?? fallback;
  }

  function storeGet(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function storeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* modo privado */ }
  }

  function waLink(message) {
    const phone = String(getPath("rsvp.whatsapp", "51904852996")).replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function showToast(message, duration = 3800) {
    const toast = $("#toast");
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;top:-1000px;left:-1000px;opacity:0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      } catch (fallbackError) {
        return false;
      }
    }
  }

  function isPast(dateValue) {
    const date = new Date(dateValue);
    return !Number.isNaN(date.getTime()) && Date.now() > date.getTime();
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function focusable(container) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
      .filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
  }

  function trapTab(container) {
    return (event) => {
      if (event.key !== "Tab") return;
      const items = focusable(container);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
  }

  /* ---------- HIDRATAR DATOS REALES ---------- */
  function hydrate() {
    $$("[data-bind]").forEach((el) => {
      const value = getPath(el.dataset.bind, "");
      if (value !== "" && value !== undefined && value !== null) el.textContent = value;
    });

    const methods = $("#giftMethods");
    if (methods) {
      methods.textContent = "";
      const list = getPath("gifts.methods", ["Yape", "Plin", "Transferencia"]);
      (Array.isArray(list) ? list : []).forEach((method) => {
        const chip = document.createElement("span");
        chip.textContent = method;
        methods.appendChild(chip);
      });
    }

    const hashtags = $("#hashtags");
    if (hashtags) {
      hashtags.textContent = "";
      const list = getPath("parents.hashtags", []);
      (Array.isArray(list) ? list : []).forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hashtag";
        button.textContent = tag;
        button.setAttribute("aria-label", `Copiar ${tag}`);
        button.addEventListener("click", async () => {
          const copied = await copyText(tag);
          showToast(copied ? `Hashtag copiado: ${tag}` : `Comparte este momento con ${tag}`);
        });
        hashtags.appendChild(button);
      });
    }

    const locationMessage = "Hola Gustavo y Evelin ✨ Quisiera saber la ubicación exacta de la revelación del 14 de noviembre. ¡Gracias!";
    const ask = $("#askLocation");
    if (ask) {
      ask.href = waLink(locationMessage);
      ask.target = "_blank";
      ask.rel = "noopener";
    }
    const giftWa = $("#giftWhatsapp");
    if (giftWa) giftWa.href = waLink("Hola Gustavo y Evelin ✨ Me gustaría acompañarlos con un detalle para el bebé. ¿Me comparten los datos?");
    const closingWa = $("#closingWhatsapp");
    if (closingWa) closingWa.href = waLink("Hola Gustavo y Evelin ✨ Ya vi la invitación y quería mandarles un abrazo enorme.");
    const map = $("#mapLink");
    if (map && getPath("event.mapUrl", "")) {
      map.href = getPath("event.mapUrl");
      map.target = "_blank";
      map.rel = "noopener";
    }

    const deadline = getPath("event.rsvpDeadline", "");
    if (deadline && isPast(deadline)) {
      const note = $(".rsvp-deadline");
      if (note) note.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-clock"></use></svg> La fecha de confirmación pasó, pero aún puedes escribirnos por WhatsApp.';
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `Un nuevo amor viene en camino. Acompáñanos a revelar el secreto mejor guardado de ${getPath("parents.display")}. ${getPath("event.dateLabel")}.`);
    }
  }

  /* ---------- PORTADA ---------- */
  function unlockSite(animate = true) {
    const opening = $("#opening");
    const site = $("#site");
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-unlocked");
    if (site) site.setAttribute("aria-hidden", "false");
    if (!animate && opening) opening.remove();
    setTimeout(() => {
      $$(".hero .reveal").forEach((el) => el.classList.add("is-inview"));
    }, animate ? 320 : 80);
    updateSoundUI(audio ? audio.isPlaying() : false);
  }

  function initIntro() {
    const opening = $("#opening");
    const skip = new URLSearchParams(window.location.search).has("skipIntro") || sessionStorage.getItem("ge-entered") === "1";
    if (!opening || skip) {
      unlockSite(false);
      return;
    }

    setTimeout(() => {
      const first = $("[data-enter]", opening);
      if (first) first.focus({ preventScroll: true });
    }, 650);

    opening.addEventListener("keydown", trapTab(opening));

    $$("[data-enter]", opening).forEach((button) => {
      button.addEventListener("click", () => {
        try { sessionStorage.setItem("ge-entered", "1"); } catch (error) { /* sin almacenamiento */ }
        if (button.dataset.enter === "music" && audio) audio.start();
        opening.classList.add("is-leaving");
        unlockSite(true);
        showToast("Bienvenido a un momento que recordaremos siempre.");
        setTimeout(() => {
          opening.setAttribute("aria-hidden", "true");
          opening.style.display = "none";
            const main = $("#contenido");
          if (main) main.focus({ preventScroll: true });
        }, 950);
      });
    });
  }

  /* ---------- ESTRELLAS ---------- */
  function initStarfield() {
    const canvas = $("#starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let shooting = [];
    let frame = null;
    let lastShoot = 0;
    let nextShoot = 6000;
    let pointerX = 0;
    let pointerY = 0;
    let active = true;

    function build() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(55, Math.min(170, Math.floor((width * height) / 11000)));
      stars = Array.from({ length: count }, () => {
        const palette = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.35 + 0.35,
          alpha: Math.random() * 0.55 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 1.3 + 0.35,
          depth: Math.random() * 0.7 + 0.3,
          color: palette > 0.88 ? "231, 211, 164" : palette > 0.78 ? "157, 183, 212" : palette > 0.7 ? "217, 163, 166" : "247, 241, 231"
        };
      });
      if (reduceMotion) drawStatic();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${star.color}, ${star.alpha})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function draw(now) {
      if (!active) return;
      ctx.clearRect(0, 0, width, height);
      const time = now * 0.001;
      stars.forEach((star) => {
        const twinkle = 0.45 + (Math.sin(time * star.speed + star.phase) + 1) * 0.28;
        const offsetX = pointerX * star.depth * 7;
        const offsetY = pointerY * star.depth * 5;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${star.color}, ${Math.min(0.9, star.alpha * twinkle)})`;
        ctx.arc(star.x + offsetX, star.y + offsetY, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reduceMotion && now > lastShoot + nextShoot) {
        lastShoot = now;
        nextShoot = 7000 + Math.random() * 9000;
        shooting.push({
          x: Math.random() * width * 0.75 + width * 0.1,
          y: Math.random() * height * 0.3 + height * 0.05,
          vx: 5 + Math.random() * 3,
          vy: 1.6 + Math.random() * 1.4,
          life: 1
        });
      }

      shooting = shooting.filter((shoot) => {
        shoot.x += shoot.vx;
        shoot.y += shoot.vy;
        shoot.life -= 0.011;
        if (shoot.x > width + 120 || shoot.y > height + 80 || shoot.life <= 0) return false;
        const gradient = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - 100, shoot.y - 34);
        gradient.addColorStop(0, `rgba(247, 241, 231, ${Math.max(0, shoot.life) * 0.9})`);
        gradient.addColorStop(1, "rgba(247, 241, 231, 0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(shoot.x, shoot.y);
        ctx.lineTo(shoot.x - 100, shoot.y - 34);
        ctx.stroke();
        return true;
      });

      frame = requestAnimationFrame(draw);
    }

    function start() {
      if (frame) cancelAnimationFrame(frame);
      active = true;
      if (reduceMotion) { drawStatic(); return; }
      frame = requestAnimationFrame(draw);
    }

    function stop() {
      active = false;
      if (frame) cancelAnimationFrame(frame);
      frame = null;
    }

    build();
    start();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { build(); if (reduceMotion) drawStatic(); }, 180);
    }, { passive: true });

    if (finePointer && !reduceMotion) {
      document.addEventListener("pointermove", (event) => {
        pointerX = event.clientX / width - 0.5;
        pointerY = event.clientY / height - 0.5;
      }, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  }

  /* ---------- HEADER + MENÚ ---------- */
  function initHeader() {
    const header = $("#header");
    const progress = $("#scrollBar");
    const menu = $("#mobileMenu");
    const toggle = $("#menuToggle");
    const close = $("#menuClose");
    const navLinks = $$(".nav a");
    const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    let ticking = false;

    function update() {
      const top = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", top > 34);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${max > 0 ? Math.min(100, (top / max) * 100) : 0}%`;
      }
      let current = null;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 150) current = section.id;
      });
      navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`));
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();

    function openMenu() {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      setTimeout(() => close && close.focus({ preventScroll: true }), 100);
    }

    function closeMenu(returnFocus = true) {
      if (!menu || !toggle) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (returnFocus) toggle.focus({ preventScroll: true });
    }

    if (toggle) toggle.addEventListener("click", () => {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    if (close) close.addEventListener("click", () => closeMenu());
    if (menu) {
      menu.addEventListener("keydown", trapTab(menu));
      $$("a", menu).forEach((link) => link.addEventListener("click", () => closeMenu(false)));
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu && menu.classList.contains("is-open")) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1000 && menu && menu.classList.contains("is-open")) closeMenu(false);
    }, { passive: true });
  }

  /* ---------- REVEALS ---------- */
  function initReveals() {
    const elements = $$(".reveal");
    if (!elements.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-inview"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -7% 0px" });

    elements.forEach((el, index) => {
      if (el.closest(".hero")) {
        observer.observe(el);
        return;
      }
      const group = el.parentElement ? $$(".reveal", el.parentElement).indexOf(el) : 0;
      if (group > 0) el.style.setProperty("--d", `${Math.min(group * 0.07, 0.35)}s`);
      observer.observe(el);
    });
  }

  /* ---------- CUENTA REGRESIVA ---------- */
  function initCountdown() {
    const target = new Date(getPath("baby.revealDate", "2026-11-14T15:30:00-05:00")).getTime();
    if (Number.isNaN(target)) return;
    const units = {
      days: $('[data-unit="days"]'),
      hours: $('[data-unit="hours"]'),
      minutes: $('[data-unit="minutes"]'),
      seconds: $('[data-unit="seconds"]')
    };
    if (!units.days) return;
    const label = $("#countdownLabel");
    let previousSeconds = null;

    function update() {
      const diff = target - Date.now();
      if (diff <= 0) {
        Object.values(units).forEach((el) => { if (el) el.textContent = "00"; });
        if (label) label.innerHTML = '<span aria-hidden="true"></span> El gran día ha llegado <span aria-hidden="true"></span>';
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      units.days.textContent = String(days).padStart(2, "0");
      units.hours.textContent = String(hours).padStart(2, "0");
      units.minutes.textContent = String(minutes).padStart(2, "0");
      if (previousSeconds !== seconds) {
        units.seconds.textContent = String(seconds).padStart(2, "0");
        if (!reduceMotion) {
          units.seconds.classList.remove("is-tick");
          void units.seconds.offsetWidth;
          units.seconds.classList.add("is-tick");
        }
        previousSeconds = seconds;
      }
    }
    update();
    setInterval(update, 1000);
  }

  /* ---------- VOTACIÓN ---------- */
  function initVotes() {
    const cards = $$(".vote-card");
    if (!cards.length) return;
    const totalEl = $("#voteTotal");
    const totalLabel = $("#voteTotalLabel");
    const boyBar = $("#boyBar");
    const girlBar = $("#girlBar");
    const boyPctEl = $("#boyPct");
    const girlPctEl = $("#girlPct");
    const boyCountEl = $("#boyCount");
    const girlCountEl = $("#girlCount");
    const status = $("#voteStatus");
    const results = $("#voteResults");
    const baseBoy = Math.max(0, Number(getPath("votes.baseBoy", 0)) || 0);
    const baseGirl = Math.max(0, Number(getPath("votes.baseGirl", 0)) || 0);
    const endpoint = getPath("votes.endpoint", "");
    let previousTotal = baseBoy + baseGirl;
    const saved = storeGet("ge-vote-v1", "");
    let vote = saved === "boy" || saved === "girl" ? saved : "";

    function animateNumber(el, to) {
      if (!el) return;
      if (reduceMotion) { el.textContent = String(to); return; }
      const from = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
      const start = performance.now();
      const duration = 700;
      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(from + (to - from) * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function render(withAnimation = false) {
      const boy = baseBoy + (vote === "boy" ? 1 : 0);
      const girl = baseGirl + (vote === "girl" ? 1 : 0);
      const total = boy + girl;
      const boyPct = total ? Math.round((boy / total) * 100) : 50;
      const girlPct = total ? 100 - boyPct : 50;

      cards.forEach((card) => {
        const selected = card.dataset.team === vote;
        card.setAttribute("aria-pressed", String(selected));
      });

      if (boyCountEl) boyCountEl.textContent = String(boy);
      if (girlCountEl) girlCountEl.textContent = String(girl);
      if (boyPctEl) boyPctEl.textContent = `${boyPct}%`;
      if (girlPctEl) girlPctEl.textContent = `${girlPct}%`;
      if (boyBar) boyBar.style.width = `${boyPct}%`;
      if (girlBar) girlBar.style.width = `${girlPct}%`;
      $$(".bar").forEach((bar, index) => bar.setAttribute("aria-valuenow", String(index === 0 ? boyPct : girlPct)));
      if (totalEl) {
        if (withAnimation) animateNumber(totalEl, total);
        else totalEl.textContent = String(total);
      }
      if (totalLabel) {
        totalLabel.textContent = total === 0
          ? "corazones por elegir"
          : total === 1 ? "corazón ya eligió" : "corazones ya eligieron";
      }
      if (status) {
        status.textContent = vote
          ? `Tu intuición ya está del lado del Team ${vote === "boy" ? "Niño" : "Niña"}.`
          : "Tu intuición puede inclinar la balanza.";
      }
      if (results) results.classList.toggle("is-voted", Boolean(vote));
      previousTotal = total;
    }

    app.setVote = function (team, options = {}) {
      if (team !== "boy" && team !== "girl") return;
      vote = team;
      storeSet("ge-vote-v1", team);
      render(true);
      if (!options.quiet) {
        const card = cards.find((item) => item.dataset.team === team);
        if (card && !reduceMotion) {
          const rect = card.getBoundingClientRect();
          burstConfetti(rect.left + rect.width / 2, rect.top + Math.min(rect.height / 2, 240), team === "boy" ? ["#cfe1f1", "#8fadcb", "#f7f1e7", "#d9b979"] : ["#f0d0d1", "#c9858c", "#f7f1e7", "#d9b979"], 34);
        }
        showToast(`Tu voto quedó guardado: Team ${team === "boy" ? "Niño" : "Niña"}. Que el cielo diga lo demás.`);
        if (audio) audio.chime("vote");
      }
      if (endpoint) {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team, votedAt: new Date().toISOString(), source: options.source || "web" })
        }).catch(() => { /* el voto local se conserva */ });
      }
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const team = card.dataset.team;
        if (vote === team) {
          showToast(`Ya estás en el Team ${team === "boy" ? "Niño" : "Niña"}. Puedes cambiar tu voto cuando quieras.`);
          if (audio) audio.chime("soft");
          return;
        }
        app.setVote(team);
      });
    });

    render(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const boy = baseBoy + (vote === "boy" ? 1 : 0);
        const girl = baseGirl + (vote === "girl" ? 1 : 0);
        const total = boy + girl;
        const boyPct = total ? Math.round((boy / total) * 100) : 50;
        if (boyBar) boyBar.style.width = `${boyPct}%`;
        if (girlBar) girlBar.style.width = `${100 - boyPct}%`;
      });
    });
  }

  /* ---------- DETALLES / CALENDARIO ---------- */
  function downloadCalendar() {
    const start = new Date(getPath("baby.revealDate", "2026-11-14T15:30:00-05:00"));
    let end = new Date(getPath("event.endDate", ""));
    if (Number.isNaN(end.getTime())) end = new Date(start.getTime() + 4.5 * 3600000);
    if (Number.isNaN(start.getTime())) {
      showToast("Aún estamos afinando la fecha. Escríbenos y te contamos.");
      return;
    }

    function stamp(date) {
      return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    }
    function escapeIcs(value) {
      return String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
    }

    const description = `Revelación de género de nuestro bebé. ${getPath("parents.display")}. Código de vestimenta: ${getPath("event.dressCode")}. ${getPath("parents.hashtags", []).join(" ")}`;
    const location = [getPath("event.venueName"), getPath("event.venueAddress")].filter(Boolean).join(" — ");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gustavo and Evelin//Revelacion de Genero//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:revelacion-ge-14nov2026@invitacion",
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeIcs(getPath("event.title", "Revelación de género"))}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(location)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Revelacion-Gustavo-Evelin-14-11-2026.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast("Fecha guardada. Nos vemos el 14 de noviembre.");
    if (audio) audio.chime("soft");
  }

  async function shareInvitation() {
    const shareData = {
      title: "Un nuevo amor viene en camino · Gustavo & Evelin",
      text: "¿El secreto mejor guardado? Está a punto de revelarse. Acompáñanos el 14 de noviembre de 2026.",
      url: window.location.href.split("#")[0]
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    const copied = await copyText(shareData.url);
    showToast(copied ? "Enlace copiado. Compártelo con quien amas." : shareData.url, 5000);
  }

  function initDetails() {
    const calendarButton = $("#calendarBtn");
    if (calendarButton) calendarButton.addEventListener("click", downloadCalendar);

    const map = $("#mapLink");
    if (map) {
      const mapUrl = getPath("event.mapUrl", "");
      const mapLabel = $("#mapLabel");
      if (mapUrl) {
        map.href = mapUrl;
      } else {
        if (mapLabel) mapLabel.textContent = "Pedir ubicación por WhatsApp";
        map.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("La ubicación exacta se compartirá pronto. Te la contamos por WhatsApp.");
          window.open(waLink("Hola Gustavo y Evelin ✨ Quisiera saber la ubicación exacta de la revelación del 14 de noviembre. ¡Gracias!"), "_blank", "noopener");
        });
      }
    }

    $$("#shareBtn, #shareFooter").forEach((button) => button.addEventListener("click", shareInvitation));
  }

  /* ---------- RSVP + PASE ---------- */
  function initRsvp() {
    const form = $("#rsvpForm");
    if (!form) return;
    const nameInput = $("#rsvpName");
    const attendanceInputs = $$('input[name="attendance"]', form);
    const predictionInputs = $$('input[name="prediction"]', form);
    const companionsField = $("#companionsField");
    const companionsInput = $("#companions");
    const wishInput = $("#wish");
    const pass = $("#passPreview");
    const passName = $("#passName");
    const passNumber = $("#passNumber");
    const passPrediction = $("#passPrediction");
    const passStatus = $("#passStatus");
    const nameError = $("#nameError");
    const attendanceError = $("#attendanceError");
    const predictionError = $("#predictionError");
    const webhook = getPath("rsvp.webhook", "");
    const state = { lastRsvp: null };

    function codeFor(name) {
      const value = String(name || "invitado").trim().toLowerCase();
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
      const code = Math.abs(hash).toString(36).toUpperCase().padStart(4, "0").slice(0, 4);
      return `GE-14NOV-${code}`;
    }

    function selectedValue(inputs) {
      const selected = inputs.find((input) => input.checked);
      return selected ? selected.value : "";
    }

    function updatePass() {
      if (!pass) return;
      const name = nameInput.value.trim() || "Tu nombre";
      const attendance = selectedValue(attendanceInputs) || "yes";
      const prediction = selectedValue(predictionInputs);
      if (passName) passName.textContent = name;
      if (passPrediction) passPrediction.textContent = prediction ? `Team ${prediction === "boy" ? "Niño" : "Niña"}` : "Por elegir";
      if (passNumber) passNumber.textContent = nameInput.value.trim() ? codeFor(nameInput.value) : "GE-14NOV-000";
      if (passStatus) {
        passStatus.textContent = attendance === "no"
          ? "Te acompañamos en el corazón"
          : state.lastRsvp ? "Asistencia confirmada" : "Asistencia por confirmar";
      }
      pass.dataset.team = attendance === "no" ? "absent" : (prediction || "neutral");
    }

    function updateCompanions() {
      const absent = selectedValue(attendanceInputs) === "no";
      if (companionsField) companionsField.classList.toggle("is-hidden", absent);
      if (absent && companionsInput) companionsInput.value = "0";
      updatePass();
    }

    function clearErrors() {
      if (nameError) nameError.textContent = "";
      if (attendanceError) attendanceError.textContent = "";
      if (predictionError) predictionError.textContent = "";
      nameInput.classList.remove("has-error");
    }

    function validate() {
      clearErrors();
      const name = nameInput.value.trim();
      if (name.length < 2) {
        if (nameError) nameError.textContent = "Escribe tu nombre completo para reservar tu lugar.";
        nameInput.classList.add("has-error");
        nameInput.focus();
        return false;
      }
      if (!selectedValue(attendanceInputs)) {
        if (attendanceError) attendanceError.textContent = "Cuéntanos si podrás acompañarnos.";
        if (attendanceInputs[0]) attendanceInputs[0].focus();
        return false;
      }
      if (!selectedValue(predictionInputs)) {
        if (predictionError) predictionError.textContent = "Elige tu predicción final.";
        if (predictionInputs[0]) predictionInputs[0].focus();
        return false;
      }
      return true;
    }

    function addSummaryRow(container, label, value) {
      const row = document.createElement("div");
      row.className = "thanks-row";
      const small = document.createElement("span");
      small.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      row.append(small, strong);
      container.appendChild(row);
    }

    function openConfirmation(data) {
      const title = $("#thanksTitle");
      const text = $("#thanksText");
      const summary = $("#thanksSummary");
      const whatsapp = $("#whatsappConfirm");
      const download = $("#downloadPass");
      if (title) title.textContent = data.attendance === "yes" ? "Tu lugar está guardado." : "Te vamos a extrañar.";
      if (text) {
        text.textContent = data.attendance === "yes"
          ? `Gracias, ${data.name}. Ya formas parte de este milagro. Nos vemos el ${getPath("event.dateLabel")} para descubrir juntos el secreto.`
          : `Gracias por avisarnos, ${data.name}. Te vamos a extrañar, pero el 14 de noviembre brindaremos por ti y te mandaremos todo nuestro amor.`;
      }
      if (summary) {
        summary.textContent = "";
        addSummaryRow(summary, "Asistencia", data.attendance === "yes" ? "Sí, con todo el corazón" : "No podré asistir");
        if (data.attendance === "yes") addSummaryRow(summary, "Acompañantes", data.companions === 0 ? "Solo yo" : `${data.companions} ${data.companions === 1 ? "persona" : "personas"}`);
        addSummaryRow(summary, "Predicción", `Team ${data.prediction === "boy" ? "Niño" : "Niña"}`);
        addSummaryRow(summary, "Pase", data.code);
        if (data.wish) addSummaryRow(summary, "Tu deseo", `“${data.wish}”`);
      }
      if (whatsapp) whatsapp.href = waLink(buildMessage(data));
      if (download) {
        const icon = '<svg class="icon" aria-hidden="true"><use href="#i-download"></use></svg>';
        download.innerHTML = `${icon} ${data.attendance === "yes" ? "Descargar mi pase" : "Guardar un recuerdo"}`;
      }
      app.openModal();
    }

    function buildMessage(data) {
      const lines = [
        "Hola Gustavo y Evelin ✨",
        `Soy ${data.name}.`,
        data.attendance === "yes"
          ? `¡Confirmo mi asistencia a la revelación del ${getPath("event.dateLabel")}!`
          : "No podré acompañarlos ese día, pero les mando todo mi amor.",
        data.attendance === "yes" && data.companions > 0 ? `Me acompañan ${data.companions} ${data.companions === 1 ? "persona" : "personas"}.` : "",
        `Mi predicción final: Team ${data.prediction === "boy" ? "Niño 💙" : "Niña 💗"}.`,
        data.wish ? `Un deseo para el bebé: “${data.wish}”` : "",
        data.deadlinePassed ? "Sé que la confirmación quedó fuera de fecha; gracias por recibirla." : "",
        `Pase: ${data.code}`
      ];
      return lines.filter(Boolean).join("\n");
    }

    function sendWebhook(data) {
      if (!webhook) return;
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "invitacion-ge" })
      }).catch(() => { /* WhatsApp sigue disponible como respaldo */ });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) return;
      const attendance = selectedValue(attendanceInputs);
      const prediction = selectedValue(predictionInputs);
      const companions = attendance === "no" ? 0 : Math.max(0, Math.min(6, Number(companionsInput.value) || 0));
      const deadlinePassed = isPast(getPath("event.rsvpDeadline", ""));
      const data = {
        name: nameInput.value.trim().replace(/\s+/g, " "),
        attendance,
        companions,
        prediction,
        wish: wishInput.value.trim().replace(/\s+/g, " "),
        code: codeFor(nameInput.value),
        createdAt: new Date().toISOString(),
        deadlinePassed
      };
      state.lastRsvp = data;
      storeSet("ge-rsvp-v1", data);
      updatePass();
      if (app.setVote) app.setVote(prediction, { quiet: true, source: "rsvp" });
      sendWebhook(data);
      openConfirmation(data);
      if (!reduceMotion) {
        const colors = prediction === "boy" ? ["#dce8f2", "#9db7d4", "#f7f1e7", "#c7a869"] : ["#f2dcda", "#d9a3a6", "#f7f1e7", "#c7a869"];
        burstConfetti(window.innerWidth / 2, window.innerHeight * 0.34, colors, 90);
      }
      if (audio) audio.chime("success");
      showToast("Gracias por responder. Tu lugar ya es parte de esta historia.");
    });

    $$("input, textarea", form).forEach((input) => {
      input.addEventListener("input", () => {
        if (input === nameInput) {
          nameInput.classList.remove("has-error");
          if (nameError) nameError.textContent = "";
        }
        updatePass();
      });
      input.addEventListener("change", () => {
        updateCompanions();
        updatePass();
      });
    });

    $$("[data-step]", form).forEach((button) => {
      button.addEventListener("click", () => {
        const step = Number(button.dataset.step) || 0;
        const next = Math.max(0, Math.min(6, (Number(companionsInput.value) || 0) + step));
        companionsInput.value = String(next);
        updatePass();
      });
    });

    const saved = storeGet("ge-rsvp-v1", null);
    if (saved && saved.name) {
      nameInput.value = saved.name;
      attendanceInputs.forEach((input) => { input.checked = input.value === saved.attendance; });
      predictionInputs.forEach((input) => { input.checked = input.value === saved.prediction; });
      companionsInput.value = String(Math.max(0, Math.min(6, Number(saved.companions) || 0)));
      if (wishInput && saved.wish) wishInput.value = saved.wish;
      state.lastRsvp = saved;
    }

    updateCompanions();
    updatePass();

    app.downloadPass = async function () {
      const button = $("#downloadPass");
      if (!button) return;
      const passEl = $("#passPreview");
      const original = button.innerHTML;
      button.disabled = true;
      button.textContent = "Preparando tu pase…";
      try {
        await ensureHtml2Canvas();
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        const name = state.lastRsvp && state.lastRsvp.name ? state.lastRsvp.name : (nameInput.value.trim() || "Invitado");
        const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "Invitado";
        passEl.classList.add("is-capturing");
        const canvas = await window.html2canvas(passEl, {
          scale: 3,
          backgroundColor: "#f7f1e7",
          useCORS: true,
          logging: false,
          windowWidth: document.documentElement.clientWidth
        });
        passEl.classList.remove("is-capturing");
        const link = document.createElement("a");
        link.download = `Pase-${slug}-Gustavo-Evelin.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Tu pase está listo. Guárdalo y llévalo contigo.");
        if (audio) audio.chime("success");
      } catch (error) {
        passEl.classList.remove("is-capturing");
        showToast("No pudimos generar la imagen. Mantén presionado sobre tu pase para guardar una captura.", 6000);
      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    };

    const downloadButton = $("#downloadPass");
    if (downloadButton) downloadButton.addEventListener("click", () => app.downloadPass());
  }

  let html2canvasPromise = null;
  function ensureHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve();
    if (html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "js/vendor/html2canvas.min.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar html2canvas"));
      document.head.appendChild(script);
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), 12000);
    });
    return html2canvasPromise;
  }

  /* ---------- MODAL ---------- */
  function initModal() {
    const modal = $("#thanksModal");
    if (!modal) return;
    let lastFocus = null;
    const trap = trapTab(modal);

    function openModal() {
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      setTimeout(() => {
        const close = $(".modal__close", modal);
        if (close) close.focus({ preventScroll: true });
      }, 120);
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      const target = lastFocus && document.contains(lastFocus) ? lastFocus : $("#rsvpSubmit");
      if (target) target.focus({ preventScroll: true });
    }

    app.openModal = openModal;
    app.closeModal = closeModal;
    $$("[data-close]", modal).forEach((trigger) => trigger.addEventListener("click", closeModal));
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      trap(event);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  /* ---------- SECRETO ---------- */
  function initSecret() {
    const section = $("#secreto");
    const envelope = $("#secretEnvelope");
    const panel = $("#secretPanel");
    const form = $("#secretForm");
    const input = $("#secretInput");
    const message = $("#secretMessage");
    const hint = $("#envelopeHint");
    if (!section || !envelope || !panel || !form) return;

    const result = String(getPath("baby.result", "")).toLowerCase();
    const code = String(getPath("baby.revealCode", "AMOR")).trim().toUpperCase();
    let opened = false;
    let revealed = false;

    function openEnvelope() {
      if (!opened) {
        opened = true;
        envelope.classList.add("is-open");
        envelope.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        if (hint) hint.textContent = "La carta está abierta";
        if (audio) audio.chime("soft");
        setTimeout(() => {
          if (input) input.focus({ preventScroll: true });
          panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
        }, 700);
      } else if (input) {
        input.focus({ preventScroll: true });
      }
    }

    envelope.addEventListener("click", openEnvelope);

    function reveal(kind, auto = false) {
      if (revealed) return;
      revealed = true;
      const card = kind === "boy" ? $("#revealBoy") : $("#revealGirl");
      section.classList.add("is-revealed", `is-${kind}`);
      if (card) {
        card.hidden = false;
        card.setAttribute("tabindex", "-1");
        if (!auto) {
          setTimeout(() => {
            card.focus({ preventScroll: true });
            card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          }, 160);
        }
      }
      if (!reduceMotion) {
        const colors = kind === "boy" ? ["#dce8f2", "#9db7d4", "#f7f1e7", "#c7a869", "#ffffff"] : ["#f2dcda", "#d9a3a6", "#f7f1e7", "#c7a869", "#ffffff"];
        setTimeout(() => {
          burstConfetti(window.innerWidth / 2, window.innerHeight * 0.36, colors, 120);
        }, auto ? 500 : 700);
      }
      if (audio) audio.chime("reveal");
    }

    const autoDate = new Date(getPath("baby.autoRevealAfter", ""));
    if ((result === "boy" || result === "girl") && !Number.isNaN(autoDate.getTime()) && Date.now() >= autoDate.getTime()) {
      setTimeout(() => reveal(result, true), 650);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!input) return;
      const value = input.value.trim().toUpperCase();
      if (!value) {
        message.textContent = "Escribe la palabra secreta. El cielo no se abre con las manos vacías.";
        message.classList.add("is-error");
        input.focus();
        return;
      }
      if (value !== code) {
        message.textContent = "Esa no es la palabra. El secreto sabe esperar…";
        message.classList.add("is-error");
        panel.classList.remove("is-shaking");
        void panel.offsetWidth;
        panel.classList.add("is-shaking");
        setTimeout(() => panel.classList.remove("is-shaking"), 550);
        if (audio) audio.chime("error");
        input.select();
        return;
      }

      message.classList.remove("is-error");
      input.value = "";
      if (result === "boy" || result === "girl") {
        message.textContent = "La carta está abierta. El cielo ha hablado.";
        reveal(result);
      } else {
        message.textContent = "La palabra es correcta. Pero el cielo todavía guarda el final. La respuesta se revelará en la celebración, cuando el sol se despida.";
        if (!reduceMotion) {
          const rect = input.getBoundingClientRect();
          burstConfetti(rect.left + rect.width / 2, rect.top, ["#c7a869", "#e7d3a4", "#f7f1e7"], 26);
        }
        if (audio) audio.chime("soft");
      }
    });
  }

  /* ---------- REGALOS ---------- */
  function initGifts() {
    const button = $("#copyYape");
    if (!button) return;
    const label = button.querySelector("span");
    const raw = String(getPath("gifts.phoneRaw", "51904852996")).replace(/\D/g, "");
    const display = getPath("gifts.phone", "+51 904 852 996");
    button.addEventListener("click", async () => {
      const copied = await copyText(raw);
      if (copied) {
        button.classList.add("is-copied");
        if (label) label.textContent = "Copiado";
        showToast(`Número copiado: ${display}. Gracias por cuidar de nuestro bebé.`);
        if (audio) audio.chime("soft");
        setTimeout(() => {
          button.classList.remove("is-copied");
          if (label) label.textContent = "Copiar";
        }, 2500);
      } else {
        showToast(`Número: ${display}. Copia el número manualmente, por favor.`, 5000);
      }
    });
  }

  /* ---------- MÚSICA AMBIENTAL ---------- */
  function createAudioEngine() {
    let ctx = null;
    let master = null;
    let playing = false;
    let melodyTimer = null;
    let padsBuilt = false;
    let customTrack = null;
    function getCustomTrack() {
      const src = getPath("music.audioUrl", "");
      if (!src) return null;
      if (!customTrack) {
        customTrack = new Audio(src);
        customTrack.loop = true;
        customTrack.preload = "auto";
        customTrack.volume = 0.6;
      }
      return customTrack;
    }
    const melodyNotes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

    function ensure() {
      if (ctx) return ctx;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      const reverb = ctx.createConvolver();
      const wet = ctx.createGain();
      wet.gain.value = 0.26;
      const length = Math.floor(ctx.sampleRate * 2.9);
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i += 1) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
        }
      }
      reverb.buffer = impulse;
      master.connect(ctx.destination);
      master.connect(reverb);
      reverb.connect(wet);
      wet.connect(ctx.destination);
      buildPads();
      return ctx;
    }

    function buildPads() {
      if (!ctx || padsBuilt) return;
      padsBuilt = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 680;
      filter.Q.value = 0.5;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.065;
      padGain.connect(master);

      [130.81, 164.81, 196, 246.94, 293.66].forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index % 2 === 0 ? "sine" : "triangle";
        osc.frequency.value = frequency;
        osc.detune.value = index % 2 === 0 ? -4 : 3;
        gain.gain.value = index === 0 ? 0.8 : 0.42;
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
      });

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.055;
      lfoGain.gain.value = 135;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      filter.connect(padGain);
    }

    function tone(frequency, duration = 2, volume = 0.04, type = "sine", delay = 0) {
      if (!ctx) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.1);
    }

    function scheduleMelody() {
      if (!playing) return;
      const note = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
      tone(note, 2.8 + Math.random() * 1.6, 0.028, "sine");
      if (Math.random() > 0.72) tone(note / 2, 3.4, 0.012, "triangle", 0.22);
      melodyTimer = setTimeout(scheduleMelody, 3200 + Math.random() * 4200);
    }

    function start() {
      if (!getPath("music.enabled", true)) return;
      const track = getCustomTrack();
      if (track) {
        if (playing) return;
        playing = true;
        track.play().catch(() => { playing = false; updateSoundUI(false); });
        updateSoundUI(true);
        return;
      }
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
      if (playing) return;
      playing = true;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.55, now + 2.4);
      clearTimeout(melodyTimer);
      melodyTimer = setTimeout(scheduleMelody, 1300);
      updateSoundUI(true);
    }

    function stop() {
      const track = getCustomTrack();
      if (track) {
        track.pause();
        playing = false;
        updateSoundUI(false);
        return;
      }
      if (!ctx) return;
      playing = false;
      clearTimeout(melodyTimer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      updateSoundUI(false);
    }

    function chime(kind = "soft") {
      if (!playing) return;
      if (getCustomTrack()) return; // Evitar mezclar melodías con pista propia.
      if (!ensure()) return;
      if (ctx.state === "suspended") ctx.resume();
      const sequences = {
        vote: [659.25, 880],
        success: [523.25, 659.25, 783.99, 1046.5],
        reveal: [523.25, 659.25, 783.99, 1046.5, 1318.5],
        error: [311.13, 293.66],
        soft: [783.99]
      };
      const notes = sequences[kind] || sequences.soft;
      notes.forEach((note, index) => tone(note, kind === "reveal" ? 2.8 : 1.8, 0.032, "sine", index * 0.13));
    }

    return { start, stop, chime, isPlaying: () => playing };
  }

  function updateSoundUI(active) {
    const button = $("#soundToggle");
    if (!button) return;
    button.classList.toggle("is-on", Boolean(active));
    button.setAttribute("aria-pressed", String(Boolean(active)));
    button.setAttribute("aria-label", active ? "Silenciar música ambiental" : "Activar música ambiental");
  }

  function initAudio() {
    audio = createAudioEngine();
    updateSoundUI(false);
    const button = $("#soundToggle");
    if (!button) return;
    button.addEventListener("click", () => {
      if (audio.isPlaying()) {
        audio.stop();
        showToast("Música en pausa. El silencio también es parte de la magia.");
      } else {
        audio.start();
        showToast("Música ambiental activada. Respira y disfruta.");
      }
    });
  }

  /* ---------- CONFETTI / PARTÍCULAS ---------- */
  let confettiCtx = null;
  let confettiCanvas = null;
  let confettiParticles = [];
  let confettiFrame = null;
  let confettiDpr = 1;
  let confettiWidth = 0;
  let confettiHeight = 0;

  function initConfetti() {
    confettiCanvas = $("#confetti");
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext("2d");
    if (!confettiCtx) return;
    resizeConfetti();
    window.addEventListener("resize", resizeConfetti, { passive: true });
  }

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiWidth = window.innerWidth;
    confettiHeight = window.innerHeight;
    confettiDpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = Math.floor(confettiWidth * confettiDpr);
    confettiCanvas.height = Math.floor(confettiHeight * confettiDpr);
    confettiCanvas.style.width = `${confettiWidth}px`;
    confettiCanvas.style.height = `${confettiHeight}px`;
    if (confettiCtx) confettiCtx.setTransform(confettiDpr, 0, 0, confettiDpr, 0, 0);
  }

  function burstConfetti(x, y, colors, count = 60) {
    if (reduceMotion || !confettiCtx) return;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7;
      confettiParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        gravity: 0.09 + Math.random() * 0.05,
        drag: 0.988,
        size: 3 + Math.random() * 6,
        height: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.25,
        life: 1,
        decay: 0.008 + Math.random() * 0.007,
        shape: Math.random() > 0.82 ? "circle" : "rect"
      });
    }
    if (!confettiFrame) confettiFrame = requestAnimationFrame(updateConfetti);
  }

  function updateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);
    confettiParticles = confettiParticles.filter((particle) => {
      particle.vy += particle.gravity;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;
      particle.life -= particle.decay;
      if (particle.life <= 0 || particle.y > confettiHeight + 40) return false;
      confettiCtx.save();
      confettiCtx.globalAlpha = Math.min(1, particle.life * 1.4);
      confettiCtx.fillStyle = particle.color;
      confettiCtx.translate(particle.x, particle.y);
      confettiCtx.rotate(particle.rotation);
      if (particle.shape === "circle") {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, particle.size / 2.4, 0, Math.PI * 2);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-particle.size / 2, -particle.height / 2, particle.size, particle.height);
      }
      confettiCtx.restore();
      return true;
    });
    if (confettiParticles.length) {
      confettiFrame = requestAnimationFrame(updateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);
      confettiFrame = null;
    }
  }

  /* ---------- CURSOR ---------- */
  function initCursorGlow() {
    const glow = $("#cursorGlow");
    if (!glow || !finePointer || reduceMotion) return;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    document.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      document.body.classList.add("has-pointer");
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("has-pointer"));
    function follow() {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    }
    requestAnimationFrame(follow);
  }

  /* ---------- DETALLES FINALES ---------- */
  function initMisc() {
    const originalTitle = document.title;
    document.addEventListener("visibilitychange", () => {
      document.title = document.hidden ? "El secreto te espera…" : originalTitle;
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => document.documentElement.classList.add("fonts-ready")).catch(() => {});
    }
  }

  /* ---------- INICIO ---------- */
  function init() {
    hydrate();
    initConfetti();
    initStarfield();
    initAudio();
    initIntro();
    initHeader();
    initReveals();
    initCountdown();
    initVotes();
    initDetails();
    initModal();
    initRsvp();
    initSecret();
    initGifts();
    initCursorGlow();
    initMisc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }




})();
