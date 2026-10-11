const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket=require('../models/Ticket'); const { embed, getSettings }=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('ticket-reopen').setDescription('إعادة فتح التكت الحالي'),async execute(i){
 const t=await Ticket.findOne({guildId:i.guildId,channelId:i.channelId,status:'closed'});if(!t)return i.reply({content:'هذا ليس تكتاً مغلقاً.',ephemeral:true});
 const s=await getSettings(i.guildId); const allowed=i.memberPermissions.has(PermissionFlagsBits.ManageChannels)||(s.ticketSupportRoleId&&i.member.roles.cache.has(s.ticketSupportRoleId));
 if(!allowed)return i.reply({content:'إعادة الفتح لفريق الدعم أو الإدارة فقط.',ephemeral:true});
 await i.channel.permissionOverwrites.edit(t.openerId,{ViewChannel:true,SendMessages:true}).catch(()=>{});
 t.status='open';t.closedAt=null;await t.save();await i.reply({embeds:[embed('تم فتح التكت 🔓',`أعيد فتح التكت بواسطة ${i.user}.`)]});
}};
