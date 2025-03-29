const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Afișează informații despre un utilizator',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Vezi detalii despre un utilizator')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul vizat')
        .setRequired(false)
    ),

  async execute(message) {
    const member = message.mentions.members.first() || message.member;

    const embed = new EmbedBuilder()
      .setTitle(`ℹ️ Informații despre ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor('Blue')
      .addFields(
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '🗓️ Cont creat', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Alăturat serverului', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      );

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const member = interaction.options.getMember('user') || interaction.member;

    const embed = new EmbedBuilder()
      .setTitle(`ℹ️ Informații despre ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor('Blue')
      .addFields(
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '🗓️ Cont creat', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Alăturat serverului', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
      );

    await interaction.reply({ embeds: [embed], flags: 0 });//ephemeral: false });
  }
};
