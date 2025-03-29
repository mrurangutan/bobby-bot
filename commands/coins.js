const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoins } = require('../data/coinManager');

module.exports = {
  name: 'coins',
  description: 'Afișează câți coins ai tu sau alt utilizator',
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Vezi câți coins are cineva')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul (opțional)')
        .setRequired(false)
    ),

  async execute(message) {
    const target = message.mentions.users.first() || message.author;
    const balance = getCoins(message.guild.id, target.id);

    const embed = new EmbedBuilder()
      .setTitle(`💰 Coins`)
      .setDescription(`${target} are **${balance} coins**.`)
      .setColor('Gold');

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const balance = getCoins(interaction.guild.id, target.id);

    const embed = new EmbedBuilder()
      .setTitle(`💰 Coins`)
      .setDescription(`${target} are **${balance} coins**.`)
      .setColor('Gold');

    await interaction.reply({ embeds: [embed] });
  }
};
