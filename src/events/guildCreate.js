const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { getSettings } = require('../utils/helpers');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      const settings = await getSettings(guild.id);
      if (settings.language) return;
      const me = guild.members.me;
      const channel = guild.systemChannel || guild.channels.cache
        .filter(c => c.isTextBased() && c.permissionsFor(me)?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999)).first();
      if (!channel) return;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🦅 FALCON SYSTEM PRO')
        .setDescription('مرحبًا! قبل أن أبدأ، اختر لغة البوت لهذا السيرفر.\nWelcome! Before I get started, choose the language for this server.\n\n🇸🇦 **العربية** — أو — 🇬🇧 **English**')
        .setFooter({ text: 'يمكن تغيير اللغة لاحقًا من /language | You can change it later with /language' });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('falcon:language:ar').setLabel('العربية').setEmoji('🇸🇦').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('falcon:language:en').setLabel('English').setEmoji('🇬🇧').setStyle(ButtonStyle.Secondary)
      );
      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) { console.error('guildCreate language setup error:', err); }
  }
};
