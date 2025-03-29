const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { addCoins } = require('./data/coinManager');

const gamesPath = path.join(__dirname, './data/blackjack2_games.json');

function drawCard() {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return values[Math.floor(Math.random() * values.length)];
}

function calculateTotal(hand) {
  let total = 0, aces = 0;
  for (const card of hand) {
    if (['J', 'Q', 'K'].includes(card)) total += 10;
    else if (card === 'A') { total += 11; aces++; }
    else total += parseInt(card);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

module.exports = async function handleBlackjackButtons(interaction) {
  if (!interaction.customId.startsWith('hit_') && !interaction.customId.startsWith('stand_')) return;

  const games = JSON.parse(fs.readFileSync(gamesPath));
  const gameId = interaction.customId.split('_').slice(1).join('_');
  const userId = interaction.user.id;

  const game = games[gameId];
  if (!game) {
    return interaction.reply({ content: '❌ Jocul nu mai este activ.', ephemeral: true });
  }

  const currentTurn = game.turn;
  if (userId !== currentTurn) {
    return interaction.reply({ content: '⏳ Nu este tura ta. Așteaptă rândul adversarului.', ephemeral: true });
  }

  const other = userId === game.player1 ? game.player2 : game.player1;

  if (interaction.customId.startsWith('hit_')) {
    game.hands[userId].push(drawCard());
    const total = calculateTotal(game.hands[userId]);

    if (total > 21) {
      const embed = new EmbedBuilder()
        .setTitle('💥 Ai pierdut!')
        .setDescription(`🎮 <@${userId}> a dat bust (Total: ${total}) și <@${other}> a câștigat!`)
        .setColor('Red');

      // Dă banii câștigătorului
      const sumaTotala = game.bets[game.player1] + game.bets[game.player2];
      addCoins(game.guildId, other, sumaTotala);

      delete games[gameId];
      fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
      return interaction.update({ embeds: [embed], components: [] });
    }

    fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack 1v1')
      .setDescription(`🎮 <@${game.player1}> vs <@${game.player2}>
🎯 Este rândul lui <@${userId}>
🃐 Cărțile tale: ${game.hands[userId].join(', ')} (Total: ${total})`)
      .setColor('Blue');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`hit_${gameId}`).setLabel('🃏 Hit').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`stand_${gameId}`).setLabel('🔴 Stand').setStyle(ButtonStyle.Danger)
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }

  if (interaction.customId.startsWith('stand_')) {
    if (game.turn === game.player1) game.turn = game.player2;
    else {
      // Finalizare joc
      const total1 = calculateTotal(game.hands[game.player1]);
      const total2 = calculateTotal(game.hands[game.player2]);

      let winner = null;
      let result = '';

      if (total1 > total2) {
        winner = game.player1;
        result = `<@${game.player1}> a câștigat cu ${total1} vs ${total2}!`;
      } else if (total2 > total1) {
        winner = game.player2;
        result = `<@${game.player2}> a câștigat cu ${total2} vs ${total1}!`;
      } else {
        result = `⚖️ Egalitate! (${total1} vs ${total2})`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🏁 Rezultat final')
        .setDescription(result)
        .addFields(
          { name: 'Cărțile lui ' + interaction.guild.members.cache.get(game.player1).user.username, value: game.hands[game.player1].join(', '), inline: true },
          { name: 'Cărțile lui ' + interaction.guild.members.cache.get(game.player2).user.username, value: game.hands[game.player2].join(', '), inline: true }
        )
        .setColor('Green');

      if (winner) {
        const sumaTotala = game.bets[game.player1] + game.bets[game.player2];
        addCoins(game.guildId, winner, sumaTotala);
      }

      delete games[gameId];
      fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));
      return interaction.update({ embeds: [embed], components: [] });
    }

    fs.writeFileSync(gamesPath, JSON.stringify(games, null, 2));

    const total = calculateTotal(game.hands[other]);
    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack 1v1')
      .setDescription(`🎮 <@${game.player1}> vs <@${game.player2}>
🎯 Este rândul lui <@${other}>
🃐 Cărțile tale: ${game.hands[other].join(', ')} (Total: ${total})`)
      .setColor('Blue');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`hit_${gameId}`).setLabel('🃏 Hit').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`stand_${gameId}`).setLabel('🔴 Stand').setStyle(ButtonStyle.Danger)
    );

    return interaction.update({ embeds: [embed], components: [row] });
  }
};
