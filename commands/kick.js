const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Dă afară un membru din server',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Dă afară un membru')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul de dat afară')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motiv')
        .setDescription('Motivul pentru kick')
        .setRequired(false)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('⛔ Nu ai permisiunea să dai kick.');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('❗ Menționează un membru valid.');
    if (!member.kickable) return message.reply('🚫 Nu pot da kick acel membru.');

    const motiv = args.slice(1).join(' ') || 'Fără motiv';

    try {
      await member.send(`👢 Ai fost dat afară de pe **${message.guild.name}**.\n📝 Motiv: ${motiv}`);
    } catch {}

    await member.kick(motiv);

    const embed = new EmbedBuilder()
      .setTitle('👢 Membru dat afară')
      .setDescription(`**${member.user.tag}** a fost dat afară.\n📝 Motiv: ${motiv}`)
      .setColor('Orange');

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: '⛔ Nu ai permisiunea să dai kick.', flags: 64});        //ephemeral: true });
    }

    const member = interaction.options.getMember('user');
    const motiv = interaction.options.getString('motiv') || 'Fără motiv';

    if (!member || !member.kickable) {
      return interaction.reply({ content: '🚫 Nu pot da kick acest membru.', flags: 64});// ephemeral: true });
    }

    try {
      await member.send(`👢 Ai fost dat afară de pe **${interaction.guild.name}**.\n📝 Motiv: ${motiv}`);
    } catch {}

    await member.kick(motiv);

    const embed = new EmbedBuilder()
      .setTitle('👢 Membru dat afară')
      .setDescription(`**${member.user.tag}** a fost dat afară.\n📝 Motiv: ${motiv}`)
      .setColor('Orange');

    await interaction.reply({ embeds: [embed] });
  }
};
