const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const Ticket=require('../models/Ticket');const {getSettings}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('ticket-rename').setDescription('تغيير اسم التكت الحالي').addStringOption(o=>o.setName('name').setDescription('الاسم الجديد للتكت').setRequired(true).setMaxLength(90)),async execute(i){
 const t=await Ticket.findOne({guildId:i.guildId,channelId:i.channelId});if(!t)return i.reply({content:'هذا الأمر يعمل داخل التكت فقط.',ephemeral:true});
 const s=await getSettings(i.guildId);if(i.user.id!==t.openerId&&!i.memberPermissions.has(PermissionFlagsBits.ManageChannels)&&!(s.ticketSupportRoleId&&i.member.roles.cache.has(s.ticketSupportRoleId)))return i.reply({content:'ما عندكش صلاحية.',ephemeral:true});
 const name=i.options.getString('name').toLowerCase().replace(/[^a-z0-9\-ء-ي]/g,'-').replace(/-+/g,'-').slice(0,90);await i.channel.setName(name);await i.reply({content:`تم تغيير اسم التكت إلى **${name}**`,ephemeral:true});
}};
