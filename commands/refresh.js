const { SlashCommandBuilder } = require('discord.js');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

module.exports = {
  name: 'refresh',
  description: 'Reînregistrează o comandă global (sau toate)',
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Reînregistrează una sau toate comenzile slash (global)')
    .addStringOption(option =>
      option.setName('nume')
        .setDescription('Numele comenzii (sau "all" pentru toate)')
        .setRequired(true)
    ),

  async executeSlash(interaction) {
    const nume = interaction.options.getString('nume').toLowerCase();
    const clientId = process.env.CLIENT_ID;
    const token = process.env.DISCORD_TOKEN;

    await interaction.deferReply({ flags: 64 });//ephemeral: true });

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      let commandsToRegister = [];

      const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const command = require(`./${file}`);
        if (!command.data) continue;

        if (nume === 'all' || command.name === nume) {
          commandsToRegister.push(command.data.toJSON());
        }
      }

      if (commandsToRegister.length === 0) {
        return await interaction.editReply(`❌ N-am găsit comanda \`${nume}\`.`);
      }

      // Dacă e "all", suprascrie tot
      if (nume === 'all') {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commandsToRegister }
        );
        return await interaction.editReply(`✅ Toate comenzile au fost reînregistrate global.`);
      } else {
        // Înlocuiește doar o singură comandă (upsert)
        const existing = await rest.get(Routes.applicationCommands(clientId));
        const existingCmd = existing.find(c => c.name === nume);

        if (existingCmd) {
          await rest.patch(
            Routes.applicationCommand(clientId, existingCmd.id),
            { body: commandsToRegister[0] }
          );
        } else {
          await rest.post(
            Routes.applicationCommands(clientId),
            { body: commandsToRegister[0] }
          );
        }

        await interaction.editReply(`✅ Comanda \`${nume}\` a fost reînregistrată global.`);
      }

    } catch (err) {
      console.error(err);
      await interaction.editReply(`❌ Eroare la reînregistrare.`);
    }
  }
};
