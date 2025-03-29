
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/rolintra.json');
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');

module.exports = {
  name: 'rolintra',
  description: 'Setează un rol automat pentru noii membri',
  data: new SlashCommandBuilder()
    .setName('rolintra')
    .setDescription('Configurează rolul automat pentru noii membri')
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Rolul de acordat automat (sau scrie off pentru dezactivare)')
        .setRequired(true)
    ),

  async executeSlash(interaction) {
    const guildId = interaction.guild.id;
    const selectedRole = interaction.options.getRole('rol');

    const config = JSON.parse(fs.readFileSync(configPath));

    if (!config[guildId]) config[guildId] = {};

    if (selectedRole.name.toLowerCase() === 'off') {
      delete config[guildId];
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return interaction.reply({ content: '✅ Sistemul de roluri automate a fost dezactivat.', flags: 64 });//ephemeral: true });
    }

    config[guildId] = {
      enabled: true,
      role: selectedRole.id
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({ content: `✅ Rolul <@&${selectedRole.id}> va fi acordat automat noilor membri.`, ephemeral: true });
  }
};
