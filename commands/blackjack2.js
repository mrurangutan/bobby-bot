const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getCoins, removeCoins } = require('../data/coinManager');

const invitesPath = path.join(__dirname, '../data/bj2_invites.json');
const gamesPath = path.join(__dirname, '../data/blackjack2_games.json');

module.exports = {
  name: 'blackjack2',
  description: 'Începe un meci de Blackjack 1v1',
  data: new SlashCommandBuilder()
    .setName('blackjack2')
    .setDescription('Începe un meci de Blackjack 1v1')
    .addUserOption(opt =>
      opt.setName('utilizator')
        .setDescription('Utilizatorul invitat')
        .setRequired(true)
    ),

  async executeSlash(interaction) {
    const player1 = interaction.user;
    const player2 = interaction.options.getUser('utilizator');

    if (player1.id === player2.id) {
      return interaction.reply({ content: '❌ Nu te poți invita singur.', ephemeral: true });
    }

    if (player2.bot) {
      return interaction.reply({ content: '❌ Nu poți invita un bot.', ephemeral: true });
    }

    if (!fs.existsSync(invitesPath)) fs.writeFileSync(invitesPath, '{}');
    const invites = JSON.parse(fs.readFileSync(invitesPath));

    const gameId = [player1.id, player2.id].sort().join('_');
    invites[gameId] = {
      player1: player1.id,
      player2: player2.id,
      status: 'pending',
      timestamp: Date.now()
    };
    fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`accept_${gameId}`).setLabel('✅ Acceptă').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`reject_${gameId}`).setLabel('❌ Refuză').setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setTitle('🎮 Invitație la Blackjack 1v1')
      .setDescription(`${player1} l-a invitat pe ${player2} la un meci de Blackjack!\nDoar ${player2} poate accepta sau refuza.`)
      .setColor('Blue');

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== player2.id) {
        return i.reply({ content: '⛔ Doar utilizatorul invitat poate răspunde.', ephemeral: true });
      }

      if (i.customId === `reject_${gameId}`) {
        delete invites[gameId];
        fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
        collector.stop();
        return i.update({ content: `❌ ${player2} a refuzat invitația.`, embeds: [], components: [] });
      }

      if (i.customId === `accept_${gameId}`) {
        invites[gameId].status = 'accepted';
        fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));

        await i.update({ content: `✅ Invitația a fost acceptată! Amândoi jucătorii trebuie să scrie suma pariului (ex: \`100\`)`, embeds: [], components: [] });

        const filter = msg => [player1.id, player2.id].includes(msg.author.id);
        const channel = i.channel;
        const textCollector = channel.createMessageCollector({ filter, time: 60000 });

        const bets = {};

        textCollector.on('collect', async msg => {
          const value = parseInt(msg.content.trim());

          if (isNaN(value) || value <= 0) {
            textCollector.stop('invalid');
            return channel.send('⚠️ Meci anulat: unul dintre jucători nu a scris o sumă validă.');
          }

          const userCoins = getCoins(interaction.guild.id, msg.author.id);
          if (userCoins < value) {
            textCollector.stop('not-enough');
            return channel.send(`💸 Meci anulat: ${msg.author} nu are suficienți coins.`);
          }

          bets[msg.author.id] = value;

          if (bets[player1.id] && bets[player2.id]) {
            textCollector.stop('ok');
            // Scădem coins
            removeCoins(interaction.guild.id, player1.id, bets[player1.id]);
            removeCoins(interaction.guild.id, player2.id, bets[player2.id]);

            // Inițializare joc
            const hands = {
              [player1.id]: [drawCard(), drawCard()],
              [player2.id]: [drawCard(), drawCard()]
            };

            const game = {
              player1: player1.id,
              player2: player2.id,
              turn: player1.id,
              hands,
              bets,
              guildId: interaction.guild.id
            };

            if (!fs.existsSync(gamesPath)) fs.writeFileSync(gamesPath, '{}');
            const games = JSON.parse(fs.readFileSync(gamesPath));
            games[gameId] = game;
            fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));

            const total = getHandTotal(hands[player1.id]);
            const embed = new EmbedBuilder()
              .setTitle('🃏 Blackjack 1v1')
              .setDescription(`👤 <@${player1.id}> vs <@${player2.id}>\n🎯 Este rândul lui <@${player1.id}>\n🃐 Cărțile tale: ${hands[player1.id].join(', ')} (Total: ${total})`)
              .setColor('Blue');

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`hit_${gameId}`).setLabel('🃏 Hit').setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId(`stand_${gameId}`).setLabel('🔴 Stand').setStyle(ButtonStyle.Danger)
            );

            await channel.send({ embeds: [embed], components: [row] });

            delete invites[gameId];
            fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
          }
        });

        textCollector.on('end', (_, reason) => {
          if (reason === 'time') {
            channel.send('⏱️ Timpul a expirat. Meciul a fost anulat.');
            delete invites[gameId];
            fs.writeFileSync(invitesPath, JSON.stringify(invites, null, 2));
          }
        });
      }
    });
  }
};

function drawCard() {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return values[Math.floor(Math.random() * values.length)];
}

function getHandTotal(hand) {
  let total = 0, aces = 0;
  for (const card of hand) {
    if (['J', 'Q', 'K'].includes(card)) total += 10;
    else if (card === 'A') { total += 11; aces++; }
    else total += parseInt(card);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
