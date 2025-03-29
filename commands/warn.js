
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '../data/warns.json');
if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, '{}');

module.exports = {
  name: 'warn',
  description: 'Avertizează un membru',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertizează un membru')
    .addUserOption(option =>
      option.setName('membru')
        .setDescription('Membrul de avertizat')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('motiv')
        .setDescription('Motivul avertismentului')
        .setRequired(true)),

  async executeSlash(interaction) {
    const target = interaction.options.getUser('membru');
    const motiv = interaction.options.getString('motiv');
    const guild = interaction.guild;

    if (!guild || !guild.members) {
      return interaction.reply({ content: '❌ Nu pot accesa membrii serverului.', flags: 64 });//ephemeral: true });
    }

    const member = guild.members.cache.get(target.id);
    if (!member) {
      return interaction.reply({ content: '❌ Nu am găsit acel membru.', flags: 64 });//ephemeral: true });
    }

    const warns = JSON.parse(fs.readFileSync(warnsPath));
    const guildId = interaction.guild.id;
    if (!warns[guildId]) warns[guildId] = {};
    if (!warns[guildId][target.id]) warns[guildId][target.id] = [];

    warns[guildId][target.id].push({ mod: interaction.user.id, reason: motiv, date: new Date().toISOString() });
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Avertisment')
      .setDescription(`👤 ${target} a fost avertizat.`)
      .addFields(
        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Motiv', value: motiv, inline: true }
      )
      .setColor('Yellow');

    await interaction.reply({ embeds: [embed] });

    try {
      await target.send(`⚠️ Ai fost avertizat pe serverul **${guild.name}**!
Motiv: ${motiv}`);
    } catch (err) {
      console.log('Nu am putut trimite DM utilizatorului.');
    }

    // Kick dacă are 3+
    if (warns[guildId][target.id].length >= 3) {
      try {
        await member.kick('3 avertismente acumulate');
        await interaction.followUp({ content: `👢 ${target} a fost dat afară pentru 3 avertismente.` });
      } catch (err) {
        await interaction.followUp({ content: '❌ Nu am putut da kick membrului.', flags: 64 });//ephemeral: true });
      }
    }
  }
};
