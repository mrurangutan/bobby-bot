
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '../data/warns.json');
if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, '{}');

module.exports = {
  name: 'removewarn',
  description: 'Șterge un avertisment al unui membru',
  data: new SlashCommandBuilder()
    .setName('removewarn')
    .setDescription('Șterge un avertisment după index')
    .addUserOption(option =>
      option.setName('membru')
        .setDescription('Membrul căruia îi ștergi avertismentul')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('index')
        .setDescription('Numărul avertismentului (1, 2, 3...)')
        .setRequired(true)),

  async executeSlash(interaction) {
    const member = interaction.options.getUser('membru');
    const index = interaction.options.getInteger('index');
    const guildId = interaction.guild.id;

    const warnsData = JSON.parse(fs.readFileSync(warnsPath));
    if (!warnsData[guildId] || !warnsData[guildId][member.id]) {
      return interaction.reply({ content: `❌ ${member} nu are avertismente.`, flags: 64 });//ephemeral: true });
    }

    const warns = warnsData[guildId][member.id];
    if (index < 1 || index > warns.length) {
      return interaction.reply({ content: `❌ Index invalid. ${member} are doar ${warns.length} avertisment(e).`,flags: 64 });// ephemeral: true });
    }

    warns.splice(index - 1, 1);
    if (warns.length === 0) delete warnsData[guildId][member.id];
    fs.writeFileSync(warnsPath, JSON.stringify(warnsData, null, 2));

    return interaction.reply({ content: `✅ Avertismentul #${index} a fost șters de la ${member}.`,flags: 64 });// ephemeral: true });
  }
};
