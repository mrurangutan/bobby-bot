const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/welcomeConfig.json');
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
  name: 'bineaivenit',
  description: 'Setează canalul de bun venit sau dezactivează salutul',
  data: new SlashCommandBuilder()
    .setName('bineaivenit')
    .setDescription('Configurează sistemul de salut')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canalul în care să trimită mesajele de salut')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option.setName('activat')
        .setDescription('Activează sau dezactivează sistemul de salut')
        .setRequired(true)
    ),

    async execute(message, args) {
        // codul pentru !prefix

        const guildId = interaction.guild.id;
    const activat = interaction.options.getBoolean('activat');
    const canal = interaction.options.getChannel('canal');

    if (!config[guildId]) config[guildId] = {};
    config[guildId].enabled = activat;
    config[guildId].channel = activat && canal ? canal.id : null;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    if (activat && canal) {
      await interaction.reply(`✅ Salutul a fost activat bai sclav basit ce esti. Mesajele vor fi trimise în <#${canal.id}>. TINE MINTE BA PULA`);
    } else if (!activat) {
      await interaction.reply(`❌ Salutul a fost dezactivat.`);
    } else {
      await interaction.reply(`⚠️ Pula mea, ai activat salutul, dar nu ai ales niciun canal.`);
    }

    
      },
  async executeSlash(interaction) {
    const guildId = interaction.guild.id;
    const activat = interaction.options.getBoolean('activat');
    const canal = interaction.options.getChannel('canal');

    if (!config[guildId]) config[guildId] = {};
    config[guildId].enabled = activat;
    config[guildId].channel = activat && canal ? canal.id : null;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    if (activat && canal) {
      await interaction.reply(`✅ Salutul a fost activat bai sclav basit ce esti. Mesajele vor fi trimise în <#${canal.id}>. TINE MINTE BA PULA`);
    } else if (!activat) {
      await interaction.reply(`❌ Salutul a fost dezactivat.`);
    } else {
      await interaction.reply(`⚠️ Pula mea, ai activat salutul, dar nu ai ales niciun canal.`);
    }
  }
};
