const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getSettings, embed } = require('../utils/helpers');
module.exports = {
 data: new SlashCommandBuilder().setName('setup-welcome').setDescription('تحديد قنوات الترحيب ومغادرة الأعضاء')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o=>o.setName('welcome').setDescription('القناة التي تظهر فيها رسائل الترحيب').addChannelTypes(ChannelType.GuildText).setRequired(true))
  .addChannelOption(o=>o.setName('leave').setDescription('اختياري: قناة رسائل المغادرة').addChannelTypes(ChannelType.GuildText).setRequired(false)),
 async execute(i) {
  const s=await getSettings(i.guildId); s.welcomeChannelId=i.options.getChannel('welcome').id;
  const leave=i.options.getChannel('leave'); if(leave) s.leaveChannelId=leave.id; await s.save();
  await i.reply({embeds:[embed('تم الإعداد ✅',`قناة الترحيب: <#${s.welcomeChannelId}>\nقناة المغادرة: ${s.leaveChannelId?`<#${s.leaveChannelId}>`:'لم يتم تغييرها'}`)],ephemeral:true});
 }
};
