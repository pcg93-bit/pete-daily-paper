// Pete Daily Paper — Live AI Edition

const API_URL = "https://pete-daily-paper-worker.pete-daily-paper.workers.dev";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderEdition(edition, { frontTitle, frontLead, content }) {
  if (edition.front_page?.title) {
    frontTitle.textContent = edition.front_page.title;
  }
  if (edition.front_page?.deck) {
    frontLead.textContent = edition.front_page.deck;
  }

  const sections = Array.isArray(edition.sections) ? edition.sections : [];

  if (sections.length === 0) {
    content.innerHTML = "<p class='muted'>No sections came back. Try Regenerate.</p>";
    return;
  }

  content.innerHTML = sections
    .map((section) => {
      const items = Array.isArray(section.items) ? section.items : [];
      const itemsHtml = items
        .map(
          (item) => `
            <div class="item">
              <p class="item__headline">${escapeHtml(item.headline)}</p>
              <p class="item__body">${escapeHtml(item.body)}</p>
            </div>
          `
        )
        .join("");

      return `
        <div class="section">
          <h2 class="section__title">${escapeHtml(section.title)}</h2>
          ${itemsHtml}
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("btnRefresh");
  const content = document.getElementById("content");
  const dateEl = document.getElementById("editionDate");
  const frontTitle = document.getElementById("frontTitle");
  const frontLead = document.getElementById("frontLead");

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

  button.addEventListener("click", async () => {
    content.innerHTML = "<p class='muted'>Generating today’s edition…</p>";

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data.error) {
        content.innerHTML = "<p class='muted'>Something went wrong generating today's edition. Try again.</p>";
        console.error(data.detail);
        return;
      }

      renderEdition(data.edition, { frontTitle, frontLead, content });
    } catch (err) {
      content.innerHTML =
        "<p class='muted'>Something went wrong. Try again.</p>";
      console.error(err);
    }
  });
});
