require('dotenv').config();
const fs=require('node:fs');
const path=require('node:path');
const {Client,Collection,GatewayIntentBits,Partials,EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle}=require('discord.js');
const mongoose=require('mongoose');
const Giveaway=require('./models/Giveaway');

if(!process.env.DISCORD_TOKEN||!process.env.MONGODB_URI){
 console.error('❌ تأكد من DISCORD_TOKEN و MONGODB_URI في متغيرات البيئة.');
 process.exit(1);
}

const client=new Client({
 intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent],
 partials:[Partials.Channel]
});
client.commands=new Collection();

const commandsPath=path.join(__dirname,'commands');
for(const file of fs.readdirSync(commandsPath).filter(f=>f.endsWith('.js'))){
 const command=require(path.join(commandsPath,file));
 client.commands.set(command.data.name,command);
}
for(const file of fs.readdirSync(path.join(__dirname,'events')).filter(f=>f.endsWith('.js'))){
 const event=require(path.join(__dirname,'events',file));
 client[event.once?'once':'on'](event.name,(...args)=>event.execute(...args,client));
}

async function endGiveaways(){
 const due=await Giveaway.find({ended:false,endsAt:{$lte:new Date()}});
 for(const g of due){
  const claim=await Giveaway.updateOne({_id:g._id,ended:false},{$set:{ended:true}});
  if(claim.modifiedCount!==1)continue;
  const guild=await client.guilds.fetch(g.guildId).catch(()=>null);
  const ch=guild?await guild.channels.fetch(g.channelId).catch(()=>null):null;
  const msg=ch?.isTextBased()?await ch.messages.fetch(g.messageId).catch(()=>null):null;
  if(!msg)continue;
  const winner=g.entrants.length?g.entrants[Math.floor(Math.random()*g.entrants.length)]:null;
  const e=msg.embeds[0]?EmbedBuilder.from(msg.embeds[0]):new EmbedBuilder().setTitle('انتهت المسابقة');
  e.setDescription(`${e.data.description||`الجائزة: ${g.prize}`}\n\n${winner?`🏆 الفائز: <@${winner}>`:'لم يشارك أحد، لا يوجد فائز.'}`);
  const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('giveaway:ended').setLabel('انتهت المسابقة').setStyle(ButtonStyle.Secondary).setDisabled(true));
  await msg.edit({embeds:[e],components:[row]}).catch(console.error);
  if(winner)await ch.send(`🎉 مبروك <@${winner}>! فزت بـ **${g.prize}**.`).catch(console.error);
 }
}

client.once('ready',()=>{
 console.log(`🦅 FALCON SYSTEM online as ${client.user.tag}`);
 client.user.setActivity('/help | FALCON SYSTEM');
});

(async()=>{
 try{
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  await client.login(process.env.DISCORD_TOKEN);
  setInterval(()=>endGiveaways().catch(console.error),30000);
 }catch(e){console.error('Startup error:',e);process.exit(1);}
})();
