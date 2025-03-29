const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const { getCoins, addCoins, removeCoins } = require('../data/coinManager');

function getCard() {
  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return cards[Math.floor(Math.random() * cards.length)];
}

function calculateHand(hand) {
  let total = 0, aces = 0;
  for (let card of hand) {
    if (card === 'A') {
      total += 11;
      aces++;
    } else if (['J', 'Q', 'K'].includes(card)) {
      total += 10;
    } else {
      total += parseInt(card);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

module.exports = {
  name: 'blackjack',
  description: 'Joacă Blackjack cu pariere de coins',
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Joacă Blackjack și pariază coins')
    .addIntegerOption(option =>
      option.setName('coins')
        .setDescription('Suma de coins pariată')
        .setRequired(true)
    ),

  async execute(message, args) {
    const coins = parseInt(args[0]) || 0;
    if (coins <= 0) return message.reply('❌ Introdu o sumă validă de coins!');

    const userId = message.author.id;
    const guildId = message.guild.id;

    const balance = getCoins(guildId, userId);
    if (balance < coins) {
      return message.reply(`💰 Nu ai destui coins! Ai doar ${balance}.`);
    }

    removeCoins(guildId, userId, coins);
    startGame(message.channel, message.author, guildId, userId, coins, false);
  },

  async executeSlash(interaction) {
    const coins = interaction.options.getInteger('coins');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const balance = getCoins(guildId, userId);
    if (balance < coins) {
      return interaction.reply({ content: `💰 Nu ai destui coins! Ai doar ${balance}.`, ephemeral: true });
    }

    if (coins == 0) return message.reply('❌ Introdu o sumă validă de coins!');

    removeCoins(guildId, userId, coins);
    await interaction.deferReply();
    startGame(interaction.channel, interaction.user, guildId, userId, coins, interaction);
  }
};

function startGame(channel, user, guildId, userId, coins, interaction) {
  const playerHand = [getCard(), getCard()];
  const botHand = [getCard(), getCard()];

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('hit').setLabel('🃏 Hit').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('stand').setLabel('🛑 Stand').setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setTitle(`🎲 Blackjack - ${user.username}`)
    .setDescription(`💰 Pariu: **${coins} coins**\n🤖 Bot: ❓, ${botHand[1]}\n👤 Tu: ${playerHand.join(', ')} (Total: ${calculateHand(playerHand)})`)
    .setColor('Blue');

  const send = interaction ? interaction.editReply : channel.send;
  send.call(interaction ?? channel, { embeds: [embed], components: [row] }).then(sentMsg => {
    const filter = i => i.user.id === user.id;
    const collector = sentMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'hit') {
        playerHand.push(getCard());
        const total = calculateHand(playerHand);

        if (total > 21) {
          const bustEmbed = new EmbedBuilder()
            .setTitle('💥 Ai pierdut!')
            .setDescription(`👤 Cărțile tale: ${playerHand.join(', ')} (Total: ${total})\n💸 Ai pierdut **${coins} coins**!`)
            .setColor('Red');

          return i.update({ embeds: [bustEmbed], components: [] });
        }

        const newEmbed = new EmbedBuilder()
          .setTitle(`🎲 Blackjack - ${user.username}`)
          .setDescription(`💰 Pariu: **${coins} coins**\n🤖 Bot: ❓, ${botHand[1]}\n👤 Tu: ${playerHand.join(', ')} (Total: ${total})`)
          .setColor('Blue');

        await i.update({ embeds: [newEmbed], components: [row] });

      } else if (i.customId === 'stand') {
        collector.stop();

        let botTotal = calculateHand(botHand);
        while (botTotal < 17) {
          botHand.push(getCard());
          botTotal = calculateHand(botHand);
        }

        const playerTotal = calculateHand(playerHand);
        const result = getResult(playerTotal, botTotal);

        let resultText = result;
        let color = 'Grey';

        if (result.includes('✅')) {
          addCoins(guildId, userId, coins * 2);
          resultText += `\n🏆 Ai câștigat **${coins * 2} coins!**`;
          color = 'Green';
        } else if (result.includes('❌')) {
          resultText += `\n💸 Ai pierdut **${coins} coins.**`;
          color = 'Red';
        } else {
          addCoins(guildId, userId, coins); // returnează miza
          resultText += `\n↩️ Miza ți-a fost returnată.`;
          color = 'Blurple';
        }

        const endEmbed = new EmbedBuilder()
          .setTitle('🎮 Rezultat Blackjack')
          .addFields(
            { name: '👤 Tu', value: `${playerHand.join(', ')} (Total: ${playerTotal})`, inline: true },
            { name: '🤖 Bot', value: `${botHand.join(', ')} (Total: ${botTotal})`, inline: true },
            { name: '🏆 Rezultat', value: resultText, inline: false }
          )
          .setColor(color);

        await i.update({ embeds: [endEmbed], components: [] });
      }
    });

    collector.on('end', collected => {
      if (!collected.size) {
        sentMsg.edit({ content: '⌛ Timpul a expirat!', components: [] });
      }
    });
  });
}

function getResult(player, bot) {
  if (player > 21) return '💥 Ai pierdut (ai trecut de 21)!';
  if (bot > 21) return '✅ Ai câștigat! Botul a trecut de 21.';
  if (player > bot) return '✅ Ai câștigat!';
  if (player < bot) return '❌ Ai pierdut!';
  return '🤝 Egal!';
}
