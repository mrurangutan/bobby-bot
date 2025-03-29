const { SlashCommandBuilder } = require('discord.js');

const raspunsuri = [
  '🎱 Da!',
  '🎱 Nu.',
  '🎱 Poate...',
  '🎱 Cu siguranță!',
  '🎱 Niciodată.',
  '🎱 Hmmm, întreabă mai târziu ca m am plictisit.',
  '🎱 Nu cred boss.',
  '🎱 Pare promițător da nush csz omoara-te!',
  '🎱 Muie la cai',
  '🎱 Du-te ba cu caii',
  '🎱 Iti lipsesc 2 3 boi daca intrebi asa ceva',
  '🎱 Nu vreau sa raspund. E jenant.',
  '🎱 M ai plictisit... Cred ca nu ne potrivim'
];

module.exports = {
  name: '8ball',
  description: 'Pune o întrebare magică 🎱',
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pune o întrebare magică')
    .addStringOption(option =>
      option.setName('intrebare')
        .setDescription('Ce vrei să întrebi?')
        .setRequired(true)
    ),

  async execute(message, args) {
    const intrebare = args.join(' ');
    if (!intrebare) return message.reply('❓ Ce întrebare vrei să pui?');

    const raspuns = raspunsuri[Math.floor(Math.random() * raspunsuri.length)];
    message.reply(`❓ **${intrebare}**\n${raspuns}`);
  },

  async executeSlash(interaction) {
    const intrebare = interaction.options.getString('intrebare');
    const raspuns = raspunsuri[Math.floor(Math.random() * raspunsuri.length)];
    await interaction.reply(`❓ **${intrebare}**\n${raspuns}`);
  }
};
