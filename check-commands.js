const { REST } = require('discord.js');
require('dotenv').config({ path: './tokenn.env' });

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('📦 Comenzi globale înregistrate:\n');

    const commands = await rest.get(
      // 🔁 Schimbă cu applicationGuildCommands dacă vrei pe un server anume
      `/applications/${process.env.CLIENT_ID}/commands`
    );

    for (const cmd of commands) {
      console.log(`- /${cmd.name}: ${cmd.description}`);
    }
  } catch (err) {
    console.error('❌ Eroare la citirea comenzilor:', err);
  }
})();
