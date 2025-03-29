const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Afișează informații despre acest server',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Afișează informații despre acest server'),

  async execute(message) {
    const embed = buildEmbed(message.guild);
    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const embed = buildEmbed(interaction.guild);
    await interaction.reply({ embeds: [embed], flags: 0 });//ephemeral: false });
  }
};

function buildEmbed(guild) {
  return new EmbedBuilder()
    .setTitle('📊 Informații despre server')
    .setColor('Blurple')
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      { name: '📛 Nume', value: guild.name, inline: true },
      { name: '🆔 ID', value: guild.id, inline: true },
      { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: '📅 Creat la', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
      { name: '👥 Membri', value: `${guild.memberCount}`, inline: true },
      { name: '💬 Canale', value: `${guild.channels.cache.size}`, inline: true }
    );
}
