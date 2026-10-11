const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getSettings, embed } = require('../utils/helpers');
module.exports = {
 data: new SlashCommandBuilder().setName('setup-logs').setDescription('تحديد قناة سجلات الإدارة والتكتات')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o=>o.setName('channel').setDescription('قناة السجلات').addChannelTypes(ChannelType.GuildText).setRequired(true)),
 async execute(i) { const s=await getSettings(i.guildId); s.logsChannelId=i.options.getChannel('channel').id; await s.save(); await i.reply({embeds:[embed('تم الإعداد ✅',`قناة السجلات: <#${s.logsChannelId}>`)],ephemeral:true}); }
};
