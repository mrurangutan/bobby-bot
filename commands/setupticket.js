const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    PermissionsBitField
  } = require('discord.js');
  const fs = require('fs');
  const path = require('path');
  
  const ticketsPath = path.join(__dirname, '../data/tickets.json');
  
  module.exports = {
    name: 'setupticket',
    description: 'Configurează un sistem de tichete',
    data: new SlashCommandBuilder()
      .setName('setupticket')
      .setDescription('Trimite embedul pentru deschiderea tichetelor')
      .addChannelOption(opt =>
        opt.setName('canal')
          .setDescription('Canalul în care să trimită embedul')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
    async executeSlash(interaction) {
      const channel = interaction.options.getChannel('canal');
  
      const embed = new EmbedBuilder()
        .setTitle('🎫 Sistem de tichete')
        .setDescription('Apasă pe butonul de mai jos pentru a deschide un tichet de suport.')
        .setColor('Blue');
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket')
          .setLabel('🎟️ Deschide tichet')
          .setStyle(ButtonStyle.Primary)
      );
  
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Embed trimis cu succes!', ephemeral: true });
    },
  
    async handleButton(interaction) {
      if (interaction.customId === 'open_ticket') {
        if (!fs.existsSync(ticketsPath)) fs.writeFileSync(ticketsPath, '{}');
        const tickets = JSON.parse(fs.readFileSync(ticketsPath));
  
        const guildId = interaction.guild.id;
        if (!tickets[guildId]) tickets[guildId] = { lastId: 0 };
  
        tickets[guildId].lastId++;
        const ticketId = tickets[guildId].lastId;
  
        const channelName = `ticket-${ticketId}`;
        const everyone = interaction.guild.roles.everyone;
        const ticheteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'tichete');
  
        const channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
            ...(ticheteRole ? [{
              id: ticheteRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            }] : []),
            {
              id: interaction.guild.members.me.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
            }
          ]
        });
  
        fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2));
  
        const embed = new EmbedBuilder()
          .setTitle('📩 Tichet deschis')
          .setDescription(`<@${interaction.user.id}> a deschis un tichet.`)
          .setColor('Green');
  
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`close_${ticketId}_${interaction.user.id}`)
            .setLabel('🔒 Închide tichet')
            .setStyle(ButtonStyle.Danger)
        );
  
        await channel.send({ content: '@everyone', embeds: [embed], components: [row] });
        await interaction.reply({ content: `✅ Tichet deschis: ${channel}`, ephemeral: true });
      }
  
      // === Închidere ===
      if (interaction.customId.startsWith('close_')) {
        const [_, ticketId, ownerId] = interaction.customId.split('_');
  
        const isStaff = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
          interaction.member.roles.cache.some(r => r.name.toLowerCase() === 'tichete');
  
        if (!isStaff && interaction.user.id !== ownerId) {
          return interaction.reply({ content: '⛔ Nu ai permisiunea să închizi acest tichet.', flags: 64 });
        }
  
        await interaction.channel.delete().catch(() => {});
      }
    }
  };
  