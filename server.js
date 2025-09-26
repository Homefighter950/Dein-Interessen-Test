require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Verbindung
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tabelle erstellen, falls sie noch nicht existiert
const createTableQuery = `
CREATE TABLE IF NOT EXISTS ergebnisse (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vorname VARCHAR(100) NOT NULL,
  nachname VARCHAR(100),
  klasse VARCHAR(10) NOT NULL,
  ergebnis VARCHAR(255) NOT NULL,
  zeit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error("Fehler beim Erstellen der Tabelle:", err);
  } else {
    console.log("Tabelle 'ergebnisse' ist bereit.");
  }
});

// POST /submit
app.post('/submit', (req, res) => {
  const { vorname, nachname, klasse, ergebnis } = req.body;
  console.log("Empfangene Daten:", req.body); // Debug

  if (!vorname || !klasse || !ergebnis) {
    return res.status(400).send("Fehlende Pflichtdaten");
  }

  db.query(
    'INSERT INTO ergebnisse (vorname, nachname, klasse, ergebnis) VALUES (?, ?, ?, ?)',
    [vorname, nachname || null, klasse, ergebnis],
    (err, results) => {
      if (err) {
        console.error("DB Insert Fehler:", err);
        return res.status(500).send('DB Error');
      }
      console.log("Daten erfolgreich eingefügt:", results.insertId);
      res.send('OK');
    }
  );
});

const PORT = process.env.WEBPORT;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
