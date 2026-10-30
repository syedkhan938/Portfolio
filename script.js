document.documentElement.classList.add("js-enabled");

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const storedTheme = localStorage.getItem("portfolio-theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#111318" : "#f7f8fa");
}

setTheme(storedTheme || (systemPrefersDark ? "dark" : "light"));
themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]:not(.nav-contact)')];
const navigationSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
let pendingNavigationTarget = null;
let pendingNavigationTimer;
let scrollUpdateScheduled = false;

function setActiveSection(sectionId) {
  sectionLinks.forEach((link) => {
    if (link.hash === `#${sectionId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveSection() {
  scrollUpdateScheduled = false;
  const header = document.querySelector(".site-header");
  const activationLine = header.getBoundingClientRect().bottom + window.innerHeight * 0.28;
  const passedSections = navigationSections
    .filter((section) => section.getBoundingClientRect().top <= activationLine);
  const currentSection = passedSections[passedSections.length - 1];

  if (pendingNavigationTarget) {
    const targetReached = pendingNavigationTarget.getBoundingClientRect().top <= activationLine;
    if (!targetReached) return;
    pendingNavigationTarget = null;
    window.clearTimeout(pendingNavigationTimer);
  }

  if (currentSection) setActiveSection(currentSection.id);
  else setActiveSection("");
}

function scheduleActiveSectionUpdate() {
  if (scrollUpdateScheduled) return;
  scrollUpdateScheduled = true;
  window.requestAnimationFrame(updateActiveSection);
}

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    setActiveSection(target.id);
    pendingNavigationTarget = target;
    window.clearTimeout(pendingNavigationTimer);
    pendingNavigationTimer = window.setTimeout(() => {
      pendingNavigationTarget = null;
      scheduleActiveSectionUpdate();
    }, 2500);
  });
});
window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveSectionUpdate);
window.addEventListener("load", scheduleActiveSectionUpdate);
scheduleActiveSectionUpdate();

function closeNavigation() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navigation.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  navigation.classList.toggle("is-open", !isOpen);
});
navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

const words = ["web developer", "Java programmer", "Python programmer", "future software engineer"];
const typingTarget = document.querySelector(".typing-text");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let wordIndex = 0;
let characterIndex = words[0].length;
let deleting = true;

function typeNext() {
  if (reducedMotion.matches) return;
  const currentWord = words[wordIndex];
  characterIndex += deleting ? -1 : 1;
  typingTarget.textContent = currentWord.slice(0, characterIndex);
  let delay = deleting ? 48 : 78;

  if (characterIndex === 0) {
    deleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    delay = 260;
  } else if (characterIndex === words[wordIndex].length) {
    deleting = true;
    delay = 1500;
  }
  window.setTimeout(typeNext, delay);
}

if (!reducedMotion.matches) window.setTimeout(typeNext, 1600);
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) typingTarget.textContent = "web developer";
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const resumeIsAvailable = true;

document.querySelectorAll(".resume-button").forEach((button) => {
  button.addEventListener("click", () => {
    const status = button.closest(".resume-band-action")?.querySelector(".resume-band-status")
      || document.querySelector("#resume-status");
    const path = button.dataset.resumePath;
    if (!resumeIsAvailable) {
      status.textContent = `Resume not available yet. Add your PDF at ${path}, then set resumeIsAvailable to true in script.js.`;
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = path;
    downloadLink.download = path.split("/").pop();
    downloadLink.hidden = true;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    status.textContent = "Your resume download has started.";
  });
});

const contactForm = document.querySelector("#contact-form");
const contactSubmit = contactForm.querySelector('button[type="submit"]');
const contactFormStatus = document.querySelector("#contact-form-status");
const setContactStatus = (message, state) => {
  contactFormStatus.textContent = message;
  contactFormStatus.dataset.state = state;
};

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = contactForm.dataset;
  if (
    !emailjsServiceId ||
    !emailjsTemplateId ||
    !emailjsPublicKey ||
    [emailjsServiceId, emailjsTemplateId, emailjsPublicKey].some((value) => value.startsWith("YOUR_"))
  ) {
    setContactStatus("EmailJS is not configured yet. Follow EMAILJS_SETUP.md to connect the form.", "error");
    return;
  }

  if (typeof emailjs === "undefined") {
    setContactStatus("EmailJS could not be loaded. Check your connection and try again.", "error");
    return;
  }

  const formData = new FormData(contactForm);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    reply_to: String(formData.get("email") || "").trim()
  };

  contactSubmit.disabled = true;
  setContactStatus("Sending your message…", "pending");

  try {
    await emailjs.send(emailjsServiceId, emailjsTemplateId, payload, { publicKey: emailjsPublicKey });
    contactForm.reset();
    setContactStatus("Message sent successfully. Thank you for reaching out!", "success");
  } catch (error) {
    setContactStatus("Your message could not be sent. Please try again or email patansyed938@gmail.com.", "error");
    console.error("EmailJS contact submission failed.", error);
  } finally {
    contactSubmit.disabled = false;
  }
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
