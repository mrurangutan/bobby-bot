
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '../data/warns.json');
if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, '{}');

module.exports = {
  name: 'warnlist',
  description: 'Afișează avertismentele unui membru',
  data: new SlashCommandBuilder()
    .setName('warnlist')
    .setDescription('Vezi toate avertismentele unui membru')
    .addUserOption(option =>
      option.setName('membru')
        .setDescription('Membrul pentru care vrei să vezi avertismentele')
        .setRequired(true)),

  async executeSlash(interaction) {
    const member = interaction.options.getUser('membru');
    const guildId = interaction.guild.id;

    const warnsData = JSON.parse(fs.readFileSync(warnsPath));

    if (!warnsData[guildId] || !warnsData[guildId][member.id]) {
      return interaction.reply({ content: `✅ ${member} nu are niciun avertisment.`,flags: 64 });// ephemeral: true });
    }

    const warns = warnsData[guildId][member.id];

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Avertismente pentru ${member.tag}`)
      .setColor('Orange');

    warns.forEach((warn, index) => {
      const modMention = `<@${warn.mod}>`;
      const reason = warn.reason || 'Fără motiv';
      const date = new Date(warn.date).toLocaleString('ro-RO');
      embed.addFields({ name: `#${index + 1}`, value: `👮‍♂️ ${modMention}
📅 ${date}
📝 ${reason}` });
    });

    await interaction.reply({ embeds: [embed],flags: 64 });// ephemeral: true });
  }
};
