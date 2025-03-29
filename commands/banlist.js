const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'banlist',
  description: 'Afișează lista cu utilizatorii banați de pe server',
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('Vezi cine e banat'),

  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('⛔ N-ai permisiunea să vezi banlist.');
    }

    const bans = await message.guild.bans.fetch();
    if (bans.size === 0) return message.reply('✅ Nimeni nu este banat pe acest server.');

    const embed = new EmbedBuilder()
      .setTitle('🔨 Utilizatori banați')
      .setDescription(bans.map(b => `• ${b.user.tag} (${b.user.id})`).join('\n'))
      .setColor('Red');

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '⛔ N-ai permisiunea să vezi banlist.',  flags: 64 });//ephemeral: true });
    }

    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      return interaction.reply({ content: '✅ Nimeni nu este banat.',  flags: 64 });//ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔨 Utilizatori banați')
      .setDescription(bans.map(b => `• ${b.user.tag} (${b.user.id})`).join('\n'))
      .setColor('Red');

    await interaction.reply({ embeds: [embed],  flags: 64 });//ephemeral: true });
  }
};
