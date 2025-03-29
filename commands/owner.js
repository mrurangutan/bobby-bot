const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'owner',
  description: 'Afișează informații despre creatorul botului',
  data: new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Vezi detalii despre dezvoltatorul botului'),

  async executeSlash(interaction) {
    const ownerId = '800072529120460800';

    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: '⛔ Doar creatorul botului poate folosi această comandă.',
        ephemeral: true
      });
    }

    const user = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle('👑 Owner-ul acestui bot')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Nume', value: `@${user.username}`, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Cont creat', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '🌐 Servere active', value: `${interaction.client.guilds.cache.size}`, inline: true }
      )
      .setColor('Gold')
      .setFooter({ text: 'Respectă-l pe creator 💻', iconURL: user.displayAvatarURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('📬 Profil Owner')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/users/${user.id}`)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 0 //ephemeral: false
    });
  }
};
