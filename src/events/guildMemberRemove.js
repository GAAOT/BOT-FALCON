const { EmbedBuilder }=require('discord.js');const {getSettings}=require('../utils/helpers');
module.exports={name:'guildMemberRemove',async execute(member){
 try{const s=await getSettings(member.guild.id);if(!s.leaveChannelId)return;const ch=await member.guild.channels.fetch(s.leaveChannelId).catch(()=>null);if(!ch?.isTextBased())return;
 await ch.send({embeds:[new EmbedBuilder().setColor(0xED4245).setTitle('👋 غادرنا عضو | Member left').setDescription(`غادر **${member.user.tag}** السيرفر.\nعدد الأعضاء الآن: **${member.guild.memberCount}**`).setThumbnail(member.user.displayAvatarURL({size:256})).setTimestamp()]});
 }catch(e){console.error('Leave message error:',e);}
}};
