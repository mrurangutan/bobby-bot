
require('dotenv').config({ path: './tokenn.env' });

const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { prefix } = require('./config.json');
const handleBlackjackButtons = require('./buttonhandler_blackjack.js');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

client.queue = new Collection();

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Prefix commands
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('Eroare la executarea comenzii!');
  }
});

// Slash commands & buttons
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.executeSlash(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Eroare la executarea comenzii!', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith('hit_') || interaction.customId.startsWith('stand_')) {
      handleBlackjackButtons(interaction);
    }

    const ticketCommand = client.commands.get('setupticket');
    if (ticketCommand && typeof ticketCommand.handleButton === 'function') {
      ticketCommand.handleButton(interaction);
    }
  }
});

client.on('guildMemberAdd', async member => {
  const welcomeConfigPath = path.join(__dirname, './data/welcomeConfig.json');
  const rolintraPath = path.join(__dirname, './data/rolintra.json');
  const coinsPath = path.join(__dirname, './data/coins.json');

  // ============================
  // Rol automat
  // ============================
  if (fs.existsSync(rolintraPath)) {
    const config = JSON.parse(fs.readFileSync(rolintraPath, 'utf8'));
    const guildConfig = config[member.guild.id];
    if (guildConfig?.enabled && guildConfig.role) {
      try {
        await member.roles.add(guildConfig.role);
      } catch (err) {
        console.error(`❌ Eroare la atribuirea rolului automat: ${err.message}`);
      }
    }
  }

  // ============================
  // Mesaj de welcome
  // ============================
  if (fs.existsSync(welcomeConfigPath)) {
    const config = JSON.parse(fs.readFileSync(welcomeConfigPath, 'utf8'));
    const conf = config[member.guild.id];

    if (conf?.enabled && conf.channel) {
      const saluturi = [
        'A intrat un nou sclav',
        'Bine ai venit rau ai nimerit',
        'Ia uite l si p-asta'
      ];
      const random = saluturi[Math.floor(Math.random() * saluturi.length)];
      const channel = member.guild.channels.cache.get(conf.channel);
      if (channel) {
        channel.send(`${random}, ${member} ! 🔥`);
      }
    }
  }

  // ============================
  // Coins la intrare
  // ============================
  let coins = {};
  if (fs.existsSync(coinsPath)) {
    coins = JSON.parse(fs.readFileSync(coinsPath, 'utf8'));
  }

  const guildId = member.guild.id;
  const userId = member.id;
  if (!coins[guildId]) coins[guildId] = {};
  if (!coins[guildId][userId]) coins[guildId][userId] = 2000;

  fs.writeFileSync(coinsPath, JSON.stringify(coins, null, 2));
});


client.once('ready', () => {
  console.log(`✅ Logat ca ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
