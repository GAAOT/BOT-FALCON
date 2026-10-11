const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket=require('../models/Ticket'); const { embed, getSettings, sendLog }=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('ticket-close').setDescription('إغلاق التكت الحالي وحفظ نسخة من المحادثة'),async execute(i){
 const t=await Ticket.findOne({guildId:i.guildId,channelId:i.channelId,status:'open'}); if(!t) return i.reply({content:'هذا الأمر يعمل داخل تكت مفتوح فقط.',ephemeral:true});
 const s=await getSettings(i.guildId); const allowed=i.user.id===t.openerId||i.memberPermissions.has(PermissionFlagsBits.ManageChannels)||(s.ticketSupportRoleId&&i.member.roles.cache.has(s.ticketSupportRoleId));
 if(!allowed) return i.reply({content:'ما عندكش صلاحية لإغلاق هذا التكت.',ephemeral:true});
 await i.deferReply({ephemeral:true}); const ch=i.channel; const msgs=await ch.messages.fetch({limit:100}).catch(()=>null);
 let transcript=''; if(msgs) transcript=[...msgs.values()].reverse().map(m=>`[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`).join('\n');
 const files=transcript?[{attachment:Buffer.from(transcript,'utf8'),name:`transcript-${ch.id}.txt`}]:[];
 t.status='closed';t.closedAt=new Date();await t.save();
 await ch.permissionOverwrites.edit(t.openerId,{ViewChannel:true,SendMessages:false}).catch(()=>{});
 await ch.send({embeds:[embed('تم إغلاق التكت 🔒','يمكن لفريق الدعم إعادة فتحه باستخدام `/ticket-reopen`.')]});
 if(files.length) await ch.send({content:'📄 نسخة المحادثة:',files});
 await sendLog(i.guild,`تم إغلاق التكت ${ch} بواسطة ${i.user.tag}`);
 await i.editReply('تم إغلاق التكت وحفظ نسخة المحادثة.');
}};
