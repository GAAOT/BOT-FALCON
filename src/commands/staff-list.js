const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-list').setDescription('عرض أعضاء طاقم الإدارة في هذا السيرفر'),
 async execute(i) {
  const s=await GuildSettings.findOne({guildId:i.guildId});
  if(!s?.staffRoleId) return i.reply({content:'لازم تضبط رتبة الإدارة باستخدام `/setup-staff`.',ephemeral:true});
  const role=await i.guild.roles.fetch(s.staffRoleId).catch(()=>null);
  if(!role) return i.reply({content:'رتبة الإدارة المحفوظة غير موجودة. أعد الإعداد باستخدام `/setup-staff`.',ephemeral:true});
  const members=role.members.map(m=>`• ${m} — ${m.user.tag}`).slice(0,40);
  const e=new EmbedBuilder().setColor(0x5865F2).setTitle(`👑 طاقم الإدارة — ${i.guild.name}`).setDescription(members.join('\n')||'لا يوجد أعضاء يحملون رتبة الإدارة حاليًا.').setFooter({text:`عدد الأعضاء: ${role.members.size}`});
  return i.reply({embeds:[e],ephemeral:true});
 }
};
