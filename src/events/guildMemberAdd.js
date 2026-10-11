const { EmbedBuilder } = require('discord.js');
const { getSettings, sendLog } = require('../utils/helpers');
module.exports={name:'guildMemberAdd',async execute(member){
 try{const s=await getSettings(member.guild.id);
  if(s.autoRoleId){const role=member.guild.roles.cache.get(s.autoRoleId);if(role&&role.position<member.guild.members.me.roles.highest.position)await member.roles.add(role,'FALCON autorole').catch(e=>console.error('Autorole failed:',e.message));}
  const channelId=s.welcomeChannelId||process.env.WELCOME_CHANNEL_ID;if(channelId){const ch=await member.guild.channels.fetch(channelId).catch(()=>null);if(ch?.isTextBased()){const e=new EmbedBuilder().setColor(0x57F287).setTitle('👋 أهلاً وسهلاً! | Welcome').setDescription(`نورت السيرفر يا ${member}!\nأنت العضو رقم **${member.guild.memberCount}**.\n\nWelcome to **${member.guild.name}**!`).setThumbnail(member.user.displayAvatarURL({size:256})).setFooter({text:`User ID: ${member.id}`}).setTimestamp();await ch.send({embeds:[e]});}}
 }catch(e){console.error('guildMemberAdd error:',e);}
}};
