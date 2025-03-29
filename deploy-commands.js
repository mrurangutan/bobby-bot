const fs = require('fs');
const { REST, Routes } = require('discord.js');
require('dotenv').config({ path: './tokenn.env' });

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}



const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🚀 Înregistrăm comenzi...');
    if (process.env.GUILD_ID) {
      console.log('🔄 Pe un server local (GUILD)');
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID),
        { body: commands }
      );
    } else {
      console.log('🌐 Global');
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
    }
    console.log('✅ Gata!');
  } catch (err) {
    console.error('❌ Eroare la înregistrare:', err);
  }
})();
