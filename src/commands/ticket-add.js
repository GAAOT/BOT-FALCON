const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const Ticket=require('../models/Ticket');const {getSettings}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('ticket-add').setDescription('إضافة عضو إلى التكت الحالي').addUserOption(o=>o.setName('user').setDescription('العضو المراد إضافته').setRequired(true)),async execute(i){
 const t=await Ticket.findOne({guildId:i.guildId,channelId:i.channelId,status:'open'});if(!t)return i.reply({content:'هذا الأمر يعمل داخل تكت مفتوح فقط.',ephemeral:true});
 const s=await getSettings(i.guildId);if(i.user.id!==t.openerId&&!i.memberPermissions.has(PermissionFlagsBits.ManageChannels)&&!(s.ticketSupportRoleId&&i.member.roles.cache.has(s.ticketSupportRoleId)))return i.reply({content:'ما عندكش صلاحية.',ephemeral:true});
 const u=i.options.getUser('user');await i.channel.permissionOverwrites.edit(u.id,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true});await i.reply({content:`تمت إضافة ${u} إلى التكت.`,ephemeral:false});
}};
