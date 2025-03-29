const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'uptime',
  description: 'Afișează de cât timp e botul online',
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Afișează de cât timp rulează botul'),

  async execute(message) {
    const embed = buildEmbed(message.client.uptime);
    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const embed = buildEmbed(interaction.client.uptime);
    await interaction.reply({ embeds: [embed], flags: 0 });//ephemeral: false });
  }
};

function buildEmbed(uptimeMs) {
  const seconds = Math.floor(uptimeMs / 1000) % 60;
  const minutes = Math.floor(uptimeMs / (1000 * 60)) % 60;
  const hours = Math.floor(uptimeMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

  const formatted = `🕒 ${days}z ${hours}h ${minutes}m ${seconds}s`;

  return new EmbedBuilder()
    .setTitle('⏱️ Uptime Bot')
    .setColor('Green')
    .setDescription(formatted);
}
