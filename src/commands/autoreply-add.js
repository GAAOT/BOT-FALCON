const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AutoReply = require('../models/AutoReply');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoreply-add')
    .setDescription('إضافة رد تلقائي لكلمة أو عبارة في هذا السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('trigger').setDescription('الكلمة أو العبارة التي تشغّل الرد').setRequired(true).setMinLength(1).setMaxLength(100))
    .addStringOption(o => o.setName('response').setDescription('الرد الذي سيرسله البوت').setRequired(true).setMinLength(1).setMaxLength(1800))
    .addStringOption(o => o.setName('match').setDescription('طريقة مطابقة الكلمة').setRequired(true)
      .addChoices({ name: 'contains — إذا احتوت الرسالة على الكلمة', value: 'contains' }, { name: 'exact — إذا كانت الرسالة هي الكلمة فقط', value: 'exact' })),
  async execute(i) {
    const trigger = i.options.getString('trigger').trim();
    const response = i.options.getString('response').trim();
    const matchType = i.options.getString('match');
    try {
      await AutoReply.create({ guildId: i.guildId, trigger, response, matchType, createdBy: i.user.id });
      return i.reply({ content: `✅ تم حفظ الرد التلقائي في هذا السيرفر.\n**الكلمة:** \`${trigger}\`\n**طريقة المطابقة:** ${matchType === 'exact' ? 'تطابق كامل' : 'تحتوي الرسالة على الكلمة'}\n**الرد:** ${response}`, ephemeral: true, allowedMentions: { parse: [] } });
    } catch (err) {
      if (err?.code === 11000) return i.reply({ content: 'عندك رد تلقائي بنفس الكلمة بالفعل. احذف القديم أولاً أو استخدم كلمة مختلفة.', ephemeral: true });
      throw err;
    }
  }
};
