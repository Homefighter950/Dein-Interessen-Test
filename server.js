const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./quiz.db");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // index.html in /public

// Tabelle erstellen falls nicht existiert
db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vorname TEXT NOT NULL,
    nachname TEXT,
    klasse TEXT NOT NULL,
    ergebnis TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post("/submit", (req, res) => {
  const { vorname, nachname, klasse, ergebnis } = req.body;
  if (!vorname || !klasse || !ergebnis) {
    return res.status(400).send("Pflichtfelder fehlen");
  }
  db.run(
    "INSERT INTO results (vorname, nachname, klasse, ergebnis) VALUES (?, ?, ?, ?)",
    [vorname, nachname, klasse, ergebnis],
    (err) => {
      if (err) return res.status(500).send("Fehler beim Speichern");
      res.send("Gespeichert");
    }
  );
});

app.listen(3000, () => console.log("Server läuft auf http://localhost:3000"));
