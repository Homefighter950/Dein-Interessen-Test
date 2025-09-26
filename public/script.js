const form = document.getElementById("quizForm");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // --- Auswertung ---
  const counts = { a: 0, b: 0, c: 0, d: 0, e: 0 };
  for (let i = 1; i <= 10; i++) {
    const val = data.get("q" + i);
    if (val) counts[val]++;
  }

  let winner = Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b);

  const berufe = {
    a: "Kaufleute für Büromanagement",
    b: "Kaufleute im Gesundheitswesen",
    c: "Kaufleute für Spedition und Logistikdienstleistung",
    d: "Sport- und Fitnesskaufleute",
    e: "Verwaltungskaufleute"
  };
  const beruf = berufe[winner];

  const icons = { a: "🗂", b: "❤️", c: "🌍", d: "💪", e: "🏛" };

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

  resultDiv.classList.remove("hidden");
  resultDiv.innerHTML = `
    <h2>📊 Dein Ergebnis</h2>
    <p>Am besten passt zu dir: <strong>${beruf}</strong> ${icons[winner]} ⭐</p>
    ${summary}
  `;

  // --- Payload an Server ---
  const payload = {
    vorname: data.get("vorname"),
    nachname: data.get("nachname"),
    klasse: data.get("klasse"),
    ergebnis: beruf
  };

  console.log("Sende Payload:", payload); // DEBUG Browser

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("Server-Antwort:", text);

    if (!res.ok) {
      console.error("Fehler beim Speichern:", text);
    } else {
      console.log("Daten erfolgreich gespeichert!");
    }
  } catch (err) {
    console.error("Fetch-Fehler:", err);
  }
});