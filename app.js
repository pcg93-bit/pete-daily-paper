// Pete Daily Paper - Step 3 test
console.log("Pete Daily Paper: app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const lead = document.getElementById("frontLead");
  if (lead) {
    lead.textContent = "✅ App is loading correctly. Next step: add the manifest + deploy online.";
  }

  const dateEl = document.getElementById("editionDate");
  if (dateEl) {
    const d = new Date();
    dateEl.textContent = d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
});
