const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Șterge un număr de mesaje din canal',
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Șterge un număr de mesaje (maxim 100)')
    .addIntegerOption(option =>
      option.setName('numar')
        .setDescription('Numărul de mesaje de șters (1-100)')
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('⛔ Nu ai permisiunea să ștergi mesaje.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❗ Scrie un număr între 1 și 100.');
    }

    await message.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setDescription(`🧹 ${amount} mesaje au fost șterse.`)
      .setColor('Green');

    message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 3000));
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: '⛔ Nu ai permisiunea să ștergi mesaje.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('numar');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❗ Numărul trebuie să fie între 1 și 100.', ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setDescription(`🧹 ${amount} mesaje au fost șterse.`)
      .setColor('Green');

    await interaction.reply({ embeds: [embed], ephemeral: false });
    setTimeout(() => interaction.deleteReply(), 3000);
  }
};
