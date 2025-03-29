const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Afișează avatarul unui utilizator',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Vezi avatarul unui utilizator')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul vizat')
        .setRequired(false)
    ),

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar - ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('Blue');

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar - ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('Blue');

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
