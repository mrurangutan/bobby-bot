const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Debanează un utilizator folosind ID sau username#tag',
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Debanează un utilizator')
    .addStringOption(option =>
      option.setName('utilizator')
        .setDescription('ID sau username#tag al utilizatorului')
        .setRequired(true)
    ),

  // !unban 123456789012345678 sau !unban user#0001
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('⛔ Nu ai permisiunea să dai unban.');
    }

    const input = args[0];
    if (!input) return message.reply('❗ Scrie ID-ul sau username-ul complet (ex: user#1234).');

    try {
      const banList = await message.guild.bans.fetch();
      const targetBan = banList.find(ban =>
        ban.user.id === input ||
        `${ban.user.username}#${ban.user.discriminator}`.toLowerCase() === input.toLowerCase()
      );

      if (!targetBan) return message.reply('❌ Nu am găsit un utilizator banat cu acel ID sau username.');

      await message.guild.members.unban(targetBan.user.id);
      message.reply(`✅ L-am debanat pe **${targetBan.user.tag}**.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Eroare la debanare.');
    }
  },

  // /unban utilizator: ID sau username
  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '⛔ Nu ai permisiunea să dai unban.', flags: 64 });//ephemeral: true });
    }

    const input = interaction.options.getString('utilizator');

    try {
      const banList = await interaction.guild.bans.fetch();
      const targetBan = banList.find(ban =>
        ban.user.id === input ||
        `${ban.user.username}#${ban.user.discriminator}`.toLowerCase() === input.toLowerCase()
      );

      if (!targetBan) {
        return interaction.reply({ content: '❌ Nu am găsit un utilizator banat cu acel ID sau username.', flags: 64 });//ephemeral: true });
      }

      await interaction.guild.members.unban(targetBan.user.id);
      await interaction.reply(`✅ L-am debanat pe **${targetBan.user.tag}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Eroare la debanare.', flags: 64 });//ephemeral: true });
    }
  }
};
