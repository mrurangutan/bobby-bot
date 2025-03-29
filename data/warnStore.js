const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'warns.json');

let warns = new Map();

function loadWarns() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
  const raw = JSON.parse(fs.readFileSync(filePath));
  warns = new Map(Object.entries(raw));
}

function saveWarns() {
  const raw = Object.fromEntries(warns);
  fs.writeFileSync(filePath, JSON.stringify(raw, null, 2));
}

loadWarns();

module.exports = {
  get: () => warns,
  set: (key, value) => { warns.set(key, value); saveWarns(); },
  delete: (key) => { warns.delete(key); saveWarns(); },
  entries: () => warns.entries(),
  has: (key) => warns.has(key),
  getValue: (key) => warns.get(key),
};
