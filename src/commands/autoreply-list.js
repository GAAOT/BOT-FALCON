const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const AutoReply = require('../models/AutoReply');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoreply-list')
    .setDescription('عرض الردود التلقائية المسجلة لهذا السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(i) {
    const rules = await AutoReply.find({ guildId: i.guildId }).sort({ trigger: 1 }).limit(25);
    if (!rules.length) return i.reply({ content: 'ما فيش ردود تلقائية حاليًا. استعمل `/autoreply-add` لإضافة واحد.', ephemeral: true });
    const lines = rules.map((r, idx) => `**${idx + 1}.** \`${r.trigger}\` — ${r.matchType === 'exact' ? 'تطابق كامل' : 'احتواء'}\n↳ ${r.response.slice(0, 160)}${r.response.length > 160 ? '…' : ''}`).join('\n\n');
    const e = new EmbedBuilder().setColor(0x5865F2).setTitle(`💬 الردود التلقائية — ${i.guild.name}`).setDescription(lines).setFooter({ text: `يعرض حتى 25 ردًا • ${rules.length} رد` });
    return i.reply({ embeds: [e], ephemeral: true, allowedMentions: { parse: [] } });
  }
};
