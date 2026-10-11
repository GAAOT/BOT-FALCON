const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildLevel = require('../models/GuildLevel');
module.exports = {
 data: new SlashCommandBuilder().setName('leaderboard').setDescription('عرض أفضل عشرة أعضاء في هذا السيرفر حسب الخبرة'),
 async execute(i) {
  const users=await GuildLevel.find({guildId:i.guildId}).sort({xp:-1,level:-1}).limit(10);
  const lines=users.length?users.map((u,n)=>`**${n+1}.** <@${u.userId}> — المستوى ${u.level} (${u.xp} XP)`).join('\n'):'لا توجد بيانات مستويات بعد.';
  await i.reply({embeds:[new EmbedBuilder().setColor(0x5865F2).setTitle(`🏆 ترتيب الخبرة — ${i.guild.name}`).setDescription(lines)]});
 }
};
