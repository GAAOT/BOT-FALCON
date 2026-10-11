const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AutoReply = require('../models/AutoReply');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoreply-remove')
    .setDescription('حذف رد تلقائي من هذا السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('trigger').setDescription('الكلمة المحفوظة التي تريد حذفها').setRequired(true).setMaxLength(100)),
  async execute(i) {
    const trigger = i.options.getString('trigger').trim();
    const deleted = await AutoReply.findOneAndDelete({ guildId: i.guildId, trigger });
    if (!deleted) return i.reply({ content: `لم أجد ردًا تلقائيًا للكلمة: \`${trigger}\``, ephemeral: true });
    return i.reply({ content: `🗑️ تم حذف الرد التلقائي للكلمة \`${trigger}\`.`, ephemeral: true });
  }
};
