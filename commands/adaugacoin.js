// 📁 commands/adaugacoins.js
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { addCoins } = require('../data/coinManager');

module.exports = {
  name: 'adaugacoins',
  description: 'Adaugă coins unui utilizator (admin only)',
  data: new SlashCommandBuilder()
    .setName('adaugacoins')
    .setDescription('Adaugă coins unui utilizator')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('suma')
        .setDescription('Câți coins să adauge')
        .setRequired(true)
    ),

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '⛔ Doar administratorii pot folosi această comandă.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const suma = interaction.options.getInteger('suma');
    addCoins(interaction.guild.id, user.id, suma);
    await interaction.reply(`✅ Am adăugat **${suma}** coins lui <@${user.id}>.`);
  }
};