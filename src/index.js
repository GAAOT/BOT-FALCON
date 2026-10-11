require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { connectDB } = require('./db');
const commands = require('./commands');
if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN missing: configure .env or host environment variables.');
const client = new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers]});
const commandMap = new Map(commands.map(c=>[c.data.name,c]));
client.once(Events.ClientReady, c=>console.log(`Logged in as ${c.user.tag}`));
client.on(Events.InteractionCreate, async i=>{
  if(!i.isChatInputCommand()) return;
  const command=commandMap.get(i.commandName);
  if(!command) return;
  try { await command.execute(i); }
  catch(err) { console.error(`/${i.commandName}`,err); const msg='صار خطأ أثناء تنفيذ الأمر. راجع سجلات Termux أو الاستضافة.'; if(i.replied||i.deferred) await i.followUp({content:msg,ephemeral:true}).catch(()=>{}); else await i.reply({content:msg,ephemeral:true}).catch(()=>{}); }
});
(async()=>{try{await connectDB(); await client.login(process.env.DISCORD_TOKEN);}catch(e){console.error(e);process.exit(1);}})();
