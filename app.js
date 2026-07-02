// Pete Daily Paper — Live AI Edition

const API_URL = "https://pete-daily-paper-worker.pete-daily-paper.workers.dev";
// Not a real secret — visible to anyone who views this file. It only filters out
// casual/opportunistic hits; the Worker's rate limiter is the real protection.
const APP_TOKEN = "zXFd_LRFg-vT5M7UEoTEYHXk5BPzME8M";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function safeUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch (err) {
    return null;
  }
}

function activateTab(slug, { tabsNav, content }) {
  tabsNav.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("tab--active", tab.dataset.slug === slug);
  });
  content.querySelectorAll(".section").forEach((section) => {
    section.classList.toggle("section--active", section.dataset.slug === slug);
  });
}

function renderEdition(edition, { frontTitle, frontLead, content, tabsNav }) {
  if (edition.front_page?.title) {
    frontTitle.textContent = edition.front_page.title;
  }
  if (edition.front_page?.deck) {
    frontLead.textContent = edition.front_page.deck;
  }

  const sections = Array.isArray(edition.sections) ? edition.sections : [];

  if (sections.length === 0) {
    tabsNav.innerHTML = "";
    content.innerHTML = "<p class='muted'>No sections came back. Try Regenerate.</p>";
    return;
  }

  tabsNav.innerHTML = sections
    .map(
      (section, i) => `
        <button class="tab${i === 0 ? " tab--active" : ""}" data-slug="${escapeHtml(section.slug)}" type="button">
          ${escapeHtml(section.title)}
        </button>
      `
    )
    .join("");

  content.innerHTML = sections
    .map((section, i) => {
      const items = Array.isArray(section.items) ? section.items : [];
      const itemsHtml = items
        .map((item) => {
          const url = safeUrl(item.source_url);
          const sourceHtml = url
            ? `<p class="item__source"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Read more${item.source_name ? ` — ${escapeHtml(item.source_name)}` : ""} →</a></p>`
            : "";

          return `
            <div class="item">
              <p class="item__headline">${escapeHtml(item.headline)}</p>
              <p class="item__body">${escapeHtml(item.body)}</p>
              ${sourceHtml}
            </div>
          `;
        })
        .join("");

      return `
        <div class="section${i === 0 ? " section--active" : ""}" data-slug="${escapeHtml(section.slug)}">
          <h2 class="section__title">${escapeHtml(section.title)}</h2>
          ${itemsHtml}
        </div>
      `;
    })
    .join("");

  tabsNav.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.slug, { tabsNav, content }));
  });
}

async function loadEdition({ frontTitle, frontLead, content, tabsNav }, { force } = {}) {
  tabsNav.innerHTML = "";
  content.innerHTML = force
    ? "<p class='muted'>Generating a fresh edition…</p>"
    : "<p class='muted'>Loading today’s edition…</p>";

  try {
    const forceParam = force ? "&force=1" : "";
    const res = await fetch(`${API_URL}?token=${encodeURIComponent(APP_TOKEN)}${forceParam}`);
    const data = await res.json();

    if (data.error) {
      content.innerHTML = "<p class='muted'>Something went wrong generating today's edition. Try again.</p>";
      console.error(data.detail);
      return;
    }

    renderEdition(data.edition, { frontTitle, frontLead, content, tabsNav });
  } catch (err) {
    content.innerHTML = "<p class='muted'>Something went wrong. Try again.</p>";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("btnRefresh");
  const content = document.getElementById("content");
  const dateEl = document.getElementById("editionDate");
  const frontTitle = document.getElementById("frontTitle");
  const frontLead = document.getElementById("frontLead");
  const tabsNav = document.getElementById("sectionTabs");

  if (dateEl) {
    const d = new Date();
    dateEl.textContent = d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (frontLead) {
    frontLead.textContent = "Your personalized daily paper, generated fresh.";
  }

  const refs = { frontTitle, frontLead, content, tabsNav };

  // Auto-load today's (cached) edition as soon as the page opens.
  loadEdition(refs, { force: false });

  button.addEventListener("click", () => loadEdition(refs, { force: true }));
});
