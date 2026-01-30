// Pete Daily Paper — Live AI Edition

const API_URL = "https://pete-daily-paper-worker.pete-daily-paper.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("btnRefresh");
  const content = document.getElementById("content");
  const dateEl = document.getElementById("editionDate");
  const lead = document.getElementById("frontLead");

  if (dateEl) {
    const d = new Date();
    dateEl.textContent = d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (lead) {
    lead.textContent = "Your personalized daily paper, generated fresh.";
  }

  button.addEventListener("click", async () => {
    content.innerHTML = "<p class='muted'>Generating today’s edition…</p>";

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      content.innerHTML = data.html;
    } catch (err) {
      content.innerHTML =
        "<p class='muted'>Something went wrong. Try again.</p>";
      console.error(err);
    }
  });
});
