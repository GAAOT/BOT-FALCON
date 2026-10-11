const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
module.exports = {
 data: new SlashCommandBuilder()
  .setName('setup-games')
  .setDescription('تحديد الروم المسموح فيه تشغيل ألعاب الرصيد')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o => o.setName('channel').setDescription('اختر روم الألعاب').addChannelTypes(ChannelType.GuildText).setRequired(true)),
 async execute(i) {
  const channel = i.options.getChannel('channel');
  await GuildSettings.findOneAndUpdate({guildId:i.guildId}, {$set:{gamesChannelId:channel.id}}, {upsert:true,new:true});
  const e = new EmbedBuilder().setColor(0x2ECC71).setTitle('🎮 تم إعداد روم الألعاب').setDescription(`تم تفعيل ألعاب الرصيد في ${channel} فقط.\n\nالألعاب المتاحة: /clover و /bank-game.\nلتغيير الروم، أعد استخدام /setup-games.`);
  return i.reply({embeds:[e],ephemeral:true});
 }
};
