// 📁 commands/scoatecoins.js
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { removeCoins } = require('../data/coinManager');

module.exports = {
  name: 'scoatecoins',
  description: 'Scade coins unui utilizator (admin only)',
  data: new SlashCommandBuilder()
    .setName('scoatecoins')
    .setDescription('Scade coins unui utilizator')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('suma')
        .setDescription('Câți coins să scadă')
        .setRequired(true)
    ),

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '⛔ Doar administratorii pot folosi această comandă.', flags: 64 });//ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const suma = interaction.options.getInteger('suma');
    removeCoins(interaction.guild.id, user.id, suma);
    await interaction.reply(`❌ Am scăzut **${suma}** coins de la <@${user.id}>.`);
  }
};