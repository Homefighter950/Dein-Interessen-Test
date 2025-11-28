const form = document.getElementById("quizForm");
const resultDiv = document.getElementById("result");
const themeToggle = document.getElementById("theme-toggle");

// Funktion zum Setzen des Themes
const setTheme = (isBlue) => {
  document.body.classList.toggle("blue-theme", isBlue);
  themeToggle.checked = isBlue;
  localStorage.setItem("theme", isBlue ? "blue" : "default");
};

// Event-Listener für den Schalter
themeToggle.addEventListener("change", () => {
  setTheme(themeToggle.checked);
});

// Theme beim Laden der Seite wiederherstellen
const savedTheme = localStorage.getItem("theme");
setTheme(savedTheme === "blue");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // Antworten zählen
  const counts = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0 };
  for (let i = 1; i <= 9; i++) {
    const val = data.get("q" + i);
    if (val) counts[val]++;
  }

  // Gewinner bestimmen
  let winner = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b));

  // Berufszuordnung
  const berufe = {
    a: "Kaufleute für Büromanagement",
    b: "Industriekaufmann / Industriekauffrau",
    c: "Kaufleute für Spedition und Logistikdienstleistung",
    d: "Staatlich geprüfte/r Sportassistent/in",
    e: "Kauffrau/Kaufmann im Einzelhandel",
    f: "Bankkauffrau/-mann",
    g: "Veranstaltungskauffrau/-mann"
  };
  const beruf = berufe[winner];

  // Icons
  const icons = { a: "🗂️", b: "🏭", c: "🚚", d: "🏋️‍♀️", e: "🛍️", f: "🏦", g: "🎉" };

  // Zusammenfassung HTML
  const summary = `
    <ul class="result-list">
      ${Object.keys(counts)
      .map((key) => {
        let highlight = key === winner ? " style='font-weight:bold; color:#2e7d32;'" : "";
        let star = key === winner ? " ⭐" : "";
        return `<li${highlight}><span class="icon">${icons[key]}</span> ${counts[key]} Punkte (${key.toUpperCase()})${star}</li>`;
      })
      .join("")}
    </ul>
  `;

  // Ergebnis sofort anzeigen
  resultDiv.classList.remove("hidden");
  resultDiv.classList.add("visible"); // für Animation
  resultDiv.innerHTML = `
    <h2>📊 Dein Ergebnis</h2>
    <p>Am besten passt zu dir: <strong>${beruf}</strong> ${icons[winner]} ⭐</p>
    ${summary}
  `;

  // Payload für Server
  const payload = {
    vorname: data.get("vorname"),
    nachname: data.get("nachname"),
    klasse: data.get("klasse"),
    ergebnis: beruf
  };

  // POST an Server (optional)
  fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        console.error("Fehler beim Speichern:", text);
      } else {
        console.log("Daten erfolgreich gespeichert!");
      }
    })
    .catch(err => console.warn("Fetch-Error (lokal ignorierbar):", err));
});
