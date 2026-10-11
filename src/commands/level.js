const { SlashCommandBuilder } = require('discord.js');
const GuildLevel = require('../models/GuildLevel');
const { embed } = require('../utils/helpers');
module.exports = {
 data: new SlashCommandBuilder().setName('level').setDescription('عرض مستوى وخبرة عضو في هذا السيرفر').addUserOption(o=>o.setName('user').setDescription('عضو اختياري')),
 async execute(i) {
  const u=i.options.getUser('user')||i.user;
  const d=await GuildLevel.findOneAndUpdate({guildId:i.guildId,userId:u.id},{$setOnInsert:{guildId:i.guildId,userId:u.id}},{upsert:true,new:true});
  const next=(d.level+1)*100;
  await i.reply({embeds:[embed(`📈 مستوى ${u.username} في هذا السيرفر`,`المستوى: **${d.level}**\nالخبرة: **${d.xp} XP**\nالخبرة التقريبية للمستوى التالي: **${next} XP**`)]});
 }
};
