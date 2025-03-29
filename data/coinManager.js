const fs = require('fs');
const path = require('path');

const coinsPath = path.join(__dirname, 'coins.json');

function loadCoins() {
  if (!fs.existsSync(coinsPath)) fs.writeFileSync(coinsPath, '{}');
  return JSON.parse(fs.readFileSync(coinsPath));
}

function saveCoins(data) {
  fs.writeFileSync(coinsPath, JSON.stringify(data, null, 2));
}

function getCoins(guildId, userId) {
  const db = loadCoins();
  return db[guildId]?.[userId] || 0;
}

function setCoins(guildId, userId, amount) {
  const db = loadCoins();
  if (!db[guildId]) db[guildId] = {};
  db[guildId][userId] = amount;
  saveCoins(db);
}

function addCoins(guildId, userId, amount) {
  const current = getCoins(guildId, userId);
  setCoins(guildId, userId, current + amount);
}

function removeCoins(guildId, userId, amount) {
  const current = getCoins(guildId, userId);
  setCoins(guildId, userId, Math.max(0, current - amount));
}

module.exports = { getCoins, setCoins, addCoins, removeCoins };