const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const StaffAction = require('../models/StaffAction');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-accept').setDescription('قبول عضو في الإدارة وإعطاؤه رتبة الإدارة المحددة')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(o=>o.setName('user').setDescription('العضو المقبول').setRequired(true))
  .addStringOption(o=>o.setName('reason').setDescription('سبب القبول (اختياري)').setMaxLength(300)),
 async execute(i) {
  const s=await GuildSettings.findOne({guildId:i.guildId});
  if(!s?.staffRoleId||!s?.seniorStaffRoleId) return i.reply({content:'لازم تضبط النظام أولًا باستخدام `/setup-staff`.',ephemeral:true});
  if(!i.member.roles.cache.has(s.seniorStaffRoleId)&&!i.memberPermissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'هذا الأمر للإدارة العليا المحددة في إعدادات السيرفر فقط.',ephemeral:true});
  const user=i.options.getUser('user');
  if(user.bot) return i.reply({content:'ما تقدر تقبل بوت في طاقم الإدارة.',ephemeral:true});
  const target=await i.guild.members.fetch(user.id).catch(()=>null);
  const role=await i.guild.roles.fetch(s.staffRoleId).catch(()=>null);
  if(!target||!role) return i.reply({content:'لم أجد العضو أو رتبة الإدارة. راجع `/setup-staff`.',ephemeral:true});
  if(!role.editable||role.position>=i.guild.members.me.roles.highest.position) return i.reply({content:'رتبة البوت لازم تكون أعلى من رتبة الإدارة المحددة.',ephemeral:true});
  await target.roles.add(role,`Staff accepted by ${i.user.tag}`);
  const reason=i.options.getString('reason')||'';
  await StaffAction.create({guildId:i.guildId,targetId:user.id,actorId:i.user.id,action:'accept',reason,roleId:role.id});
  await user.send(`🎉 تم قبولك في طاقم الإدارة في **${i.guild.name}** وإعطاؤك رتبة **${role.name}**.`).catch(()=>{});
  return i.reply({content:`✅ تم قبول ${user} وإعطاؤه رتبة ${role}.`,ephemeral:false});
 }
};
