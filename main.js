(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.querySelector("[data-nav-drawer]");
  var drawerLinks = document.querySelectorAll("[data-drawer-link]");
  var form = document.getElementById("formulaire-contact");

  function setDrawerOpen(open) {
    if (!header || !navToggle || !drawer) return;
    header.setAttribute("data-drawer-open", open ? "true" : "false");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && drawer) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      setDrawerOpen(!open);
    });

    drawerLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setDrawerOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawerOpen(false);
    });
  }

  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function scrollToHashTarget() {
    var hash = window.location.hash;
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(scrollToHashTarget);
    });
  } else {
    requestAnimationFrame(scrollToHashTarget);
  }

  /* Smooth in-page navigation: offset for sticky header */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: "smooth" });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  /* Subtle reveal */
  var revealables = document.querySelectorAll(
    ".section, .hero__grid, .cabinet__body, .expertise-list, .highlight-band, .two-col, .narrow-block, .contact-grid, .page-hero, .page-expertise__body, .related-expertises, .page-expertise__cta"
  );

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealables.forEach(function (el) {
      el.setAttribute("data-reveal", "");
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.setAttribute("data-reveal", "visible");
    });
  }

  /* Form validation (front-end only — brancher à un backend au déploiement) */
  function setFieldError(name, message) {
    var hint = document.querySelector('[data-error-for="' + name + '"]');
    if (hint) hint.textContent = message || "";
  }

  function clearErrors() {
    ["nom", "prenom", "email", "objet", "message", "rgpd"].forEach(function (n) {
      setFieldError(n, "");
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      var nom = form.nom.value.trim();
      var prenom = form.prenom.value.trim();
      var email = form.email.value.trim();
      var objet = form.objet.value;
      var message = form.message.value.trim();
      var rgpd = form.rgpd.checked;
      var ok = true;

      if (!nom) {
        setFieldError("nom", "Indiquez votre nom.");
        ok = false;
      }
      if (!prenom) {
        setFieldError("prenom", "Indiquez votre prénom.");
        ok = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email", "Indiquez une adresse courriel valide.");
        ok = false;
      }
      if (!objet) {
        setFieldError("objet", "Sélectionnez un objet.");
        ok = false;
      }
      if (message.length < 20) {
        setFieldError("message", "Votre message est trop court (20 caractères minimum).");
        ok = false;
      }
      if (!rgpd) {
        setFieldError("rgpd", "Vous devez accepter le traitement des données pour envoyer le message.");
        ok = false;
      }

      var feedback = document.querySelector("[data-form-feedback]");
      if (!ok) {
        if (feedback) {
          feedback.textContent = "Veuillez corriger les champs indiqués.";
          feedback.removeAttribute("data-state");
        }
        return;
      }

      if (feedback) {
        feedback.textContent =
          "Merci. Votre message est prêt à être envoyé : branchez ce formulaire à votre service " +
          "courriel (Formspree, Netlify Forms ou serveur) pour la réception effective.";
        feedback.setAttribute("data-state", "ok");
      }
      form.reset();
    });
  }
})();
