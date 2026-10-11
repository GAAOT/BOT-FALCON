const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getSettings } = require('../utils/helpers');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Change the bot language for this server / تغيير لغة البوت في هذا السيرفر')
    .addStringOption(o => o.setName('language').setDescription('Language / اللغة').setRequired(true)
      .addChoices({ name: 'العربية', value: 'ar' }, { name: 'English', value: 'en' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(i) {
    const language = i.options.getString('language');
    const settings = await getSettings(i.guildId);
    settings.language = language;
    await settings.save();
    return i.reply({ content: language === 'ar' ? '✅ تم ضبط لغة البوت على العربية لهذا السيرفر.' : '✅ The bot language for this server is now English.', ephemeral: true });
  }
};
