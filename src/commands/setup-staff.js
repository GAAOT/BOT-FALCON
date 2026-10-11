const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
module.exports = {
  data: new SlashCommandBuilder().setName('setup-staff').setDescription('تحديد رتبة الإدارة ورتبة الإدارة العليا لهذا السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(o => o.setName('staff_role').setDescription('الرتبة الأساسية التي يحصل عليها المقبول').setRequired(true))
    .addRoleOption(o => o.setName('senior_role').setDescription('رتبة الإدارة العليا المسموح لها بإدارة الطاقم').setRequired(true)),
  async execute(i) {
    const staffRole = i.options.getRole('staff_role');
    const seniorRole = i.options.getRole('senior_role');
    if (staffRole.id === i.guild.id || seniorRole.id === i.guild.id) return i.reply({ content: 'اختر رتبًا عادية، وليس رتبة @everyone.', ephemeral: true });
    const settings = await GuildSettings.findOneAndUpdate({ guildId: i.guildId }, { $set: { staffRoleId: staffRole.id, seniorStaffRoleId: seniorRole.id }, $setOnInsert: { guildId: i.guildId } }, { upsert: true, new: true });
    return i.reply({ content: `✅ تم إعداد نظام الإدارة.\nرتبة القبول: ${staffRole}\nرتبة الإدارة العليا: ${seniorRole}\n\nتأكد أن رتبة البوت أعلى من الرتب التي سيضيفها أو يزيلها.`, ephemeral: true });
  }
};
