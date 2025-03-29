const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Afișează toate comenzile disponibile',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Listă cu toate comenzile disponibile'),

  async execute(message) {
    return generatePaginatedHelp({
      type: 'prefix',
      ctx: message,
      userId: message.author.id,
      commands: message.client.commands,
      nameFormatter: cmd => `!${cmd.name}`
    });
  },

  async executeSlash(interaction) {
    return generatePaginatedHelp({
      type: 'slash',
      ctx: interaction,
      userId: interaction.user.id,
      commands: interaction.client.commands,
      nameFormatter: cmd => `/${cmd.name}`
    });
  }
};

async function generatePaginatedHelp({ type, ctx, userId, commands, nameFormatter }) {
  const perPage = 10;
  let currentPage = 0;

  const commandList = commands.map(cmd => ({
    name: nameFormatter(cmd),
    value: cmd.description || 'Fără descriere'
  }));

  const totalPages = Math.ceil(commandList.length / perPage);

  const generateEmbed = (page) => {
    const sliced = commandList.slice(page * perPage, (page + 1) * perPage);
    return new EmbedBuilder()
      .setTitle('📘 Lista comenzilor')
      .addFields(sliced)
      .setFooter({ text: `Pagina ${page + 1} din ${totalPages}` })
      .setColor('Blue');
  };

  const row = (page) => new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('prev_help')
      .setLabel('⬅️ Înapoi')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('next_help')
      .setLabel('➡️ Înainte')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages - 1)
  );

  // 🧠 Trimite mesajul inițial
  const msg = await ctx.reply({
    embeds: [generateEmbed(currentPage)],
    components: [row(currentPage)],
    allowedMentions: { repliedUser: false }
  });

  const targetMsg = type === 'slash' ? await ctx.fetchReply() : msg;

  const collector = targetMsg.createMessageComponentCollector({
    filter: i => i.user.id === userId,
    time: 60000
  });

  collector.on('collect', async btn => {
    if (btn.customId === 'prev_help') currentPage--;
    if (btn.customId === 'next_help') currentPage++;

    try {
      await btn.update({
        embeds: [generateEmbed(currentPage)],
        components: [row(currentPage)]
      });
    } catch (err) {
      console.warn('❌ Update error:', err.code);
    }
  });

  collector.on('end', async () => {
    try {
      await targetMsg.edit({ components: [] });
    } catch (err) {
      if (err.code !== 10008) console.warn('Collector end error:', err.code);
    }
  });
}
