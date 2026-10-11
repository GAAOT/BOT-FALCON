const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const groups = [
  { name: 'general', label: '🌐 عام ومعلومات', commands: ['help', 'ping', 'userinfo', 'serverinfo'] },
  { name: 'moderation', label: '🛡️ الإشراف والإدارة', commands: ['warn', 'kick', 'ban', 'timeout', 'clear', 'role', 'setup-logs'] },
  { name: 'tickets', label: '🎫 التذاكر', commands: ['setup-ticket', 'ticket-close', 'ticket-reopen', 'ticket-rename', 'ticket-add', 'ticket-remove'] },
  { name: 'welcome', label: '👋 الترحيب والمغادرة', commands: ['setup-welcome'] },
  { name: 'levels', label: '📈 الخبرة والمستويات', commands: ['level', 'leaderboard'] },
  { name: 'economy', label: '💰 الرصيد والمسابقات', commands: ['credits', 'add-credits', 'giveaway'] },
  { name: 'automation', label: '💬 الردود التلقائية', commands: ['autoreply-add', 'autoreply-remove', 'autoreply-list'] },
  { name: 'games', label: '🎮 الألعاب والرصيد', commands: ['setup-games', 'clover', 'bank-game'] },
  { name: 'staff', label: '👑 طاقم الإدارة', commands: ['setup-staff', 'staff-accept', 'staff-reject', 'staff-promote', 'staff-demote', 'staff-fire', 'staff-list', 'staff-history'] }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض قائمة أوامر FALCON SYSTEM وشرحها بالعربي')
    .addStringOption(o => o.setName('category').setDescription('اختر قسم الأوامر أو اعرضها كلها').setRequired(false)
      .addChoices(
        { name: 'الكل', value: 'all' },
        { name: 'عام ومعلومات', value: 'general' },
        { name: 'الإشراف والإدارة', value: 'moderation' },
        { name: 'التذاكر', value: 'tickets' },
        { name: 'الترحيب والمغادرة', value: 'welcome' },
        { name: 'المستويات', value: 'levels' },
        { name: 'الرصيد والمسابقات', value: 'economy' },
        { name: 'الردود التلقائية', value: 'automation' },
        { name: 'طاقم الإدارة', value: 'staff' },
        { name: 'الألعاب والرصيد', value: 'games' }
      )),
  async execute(i, client) {
    const chosen = i.options.getString('category') || 'all';
    const selected = chosen === 'all' ? groups : groups.filter(g => g.name === chosen);
    const fields = [];
    for (const group of selected) {
      const lines = group.commands.map(name => {
        const command = client.commands.get(name);
        if (!command) return null;
        return `\`/${name}\` — ${command.data.description}`;
      }).filter(Boolean);
      if (lines.length) fields.push({ name: group.label, value: lines.join('\n').slice(0, 1024), inline: false });
    }
    const e = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🦅 FALCON SYSTEM PRO | مركز الأوامر')
      .setDescription('اختر قسمًا من خيار **category** لعرض أوامره فقط. أسماء الأوامر بالإنجليزية ووصفها بالعربية.\n\n**ملاحظة:** أوامر إعداد السيرفر والردود التلقائية تحتاج صلاحية إدارة السيرفر أو الصلاحية الموضحة عند الأمر.')
      .addFields(fields.slice(0, 25))
      .setFooter({ text: `FALCON SYSTEM PRO • ${client.commands.size} أمر مسجل` });
    await i.reply({ embeds: [e], ephemeral: true });
  }
};
