const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Răspunde cu pong și arată ping-ul botului',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifică pingu botului'),

  // !ping
  async execute(message) {
    const sent = await message.reply('🏓 Calculăm pingu mortii tai...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiPing = message.client.ws.ping;

    sent.edit(`🏓 Pong! Latency: **${latency}ms**, API Ping: **${apiPing}ms**. Sper ca esti fericit in mortii tai...`);
  },

  // /ping
  //async executeSlash(interaction) {
    //const sent = await interaction.reply({ content: '🏓 Calculăm pingu mortii tai...', fetchReply: true });
  //  const latency = sent.createdTimestamp - interaction.createdTimestamp;
//    const apiPing = interaction.client.ws.ping;

   // await interaction.editReply(`🏓 Pong! Latency: **${latency}ms**, API Ping: **${apiPing}ms** Sper ca esti fericit in mortii tai...`);
 // }

 async executeSlash(interaction) {
  await interaction.reply({ content: '📍 Calculăm pingu mortii tai...' });
  
  const sent = await interaction.fetchReply();
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiPing = interaction.client.ws.ping;

  await interaction.editReply(`📍 Pong! Latency: **${latency}ms**, API Ping: **${apiPing}ms** Sper ca esti fericit in mortii tai...`);
}


};
