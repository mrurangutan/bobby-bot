const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Banează un membru din server',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banează un membru')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul de banat')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motiv')
        .setDescription('Motivul pentru ban')
        .setRequired(false)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('⛔ Nu ai permisiunea să dai ban.');
    }

    const member = message.mentions.members.first();
    if (!member || !member.bannable) return message.reply('🚫 Nu pot da ban acest membru.');

    const motiv = args.slice(1).join(' ') || 'Fără motiv';

    try {
      await member.send(`🔨 Ai fost banat de pe **${message.guild.name}**.\n📝 Motiv: ${motiv}`);
    } catch {}

    await member.ban({ reason: motiv });

    const embed = new EmbedBuilder()
      .setTitle('🔨 Membru banat')
      .setDescription(`**${member.user.tag}** a fost banat.\n📝 Motiv: ${motiv}`)
      .setColor('Red');

    message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '⛔ Nu ai permisiunea să dai ban.', flags: 64 });//ephemeral: true });
    }

    const member = interaction.options.getMember('user');
    const motiv = interaction.options.getString('motiv') || 'Fără motiv';

    if (!member || !member.bannable) {
      return interaction.reply({ content: '🚫 Nu pot da ban acest membru.',  flags: 64 });//ephemeral: true });
    }

    try {
      await member.send(`🔨 Ai fost banat de pe **${interaction.guild.name}**.\n📝 Motiv: ${motiv}`);
    } catch {}

    await member.ban({ reason: motiv });

    const embed = new EmbedBuilder()
      .setTitle('🔨 Membru banat')
      .setDescription(`**${member.user.tag}** a fost banat.\n📝 Motiv: ${motiv}`)
      .setColor('Red');

    await interaction.reply({ embeds: [embed] });
  }
};
