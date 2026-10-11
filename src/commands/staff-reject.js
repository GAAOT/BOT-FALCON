const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const StaffAction = require('../models/StaffAction');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-reject').setDescription('رفض طلب الانضمام للإدارة مع حفظ السبب')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(o=>o.setName('user').setDescription('العضو الذي سيتم رفضه').setRequired(true))
  .addStringOption(o=>o.setName('reason').setDescription('سبب الرفض').setRequired(true).setMaxLength(500)),
 async execute(i) {
  const s=await GuildSettings.findOne({guildId:i.guildId});
  if(!s?.seniorStaffRoleId) return i.reply({content:'لازم تضبط النظام أولًا باستخدام `/setup-staff`.',ephemeral:true});
  if(!i.member.roles.cache.has(s.seniorStaffRoleId)&&!i.memberPermissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'هذا الأمر للإدارة العليا المحددة في إعدادات السيرفر فقط.',ephemeral:true});
  const user=i.options.getUser('user'),reason=i.options.getString('reason');
  await StaffAction.create({guildId:i.guildId,targetId:user.id,actorId:i.user.id,action:'reject',reason});
  await user.send(`تم رفض طلب انضمامك للإدارة في **${i.guild.name}**.\nالسبب: ${reason}`).catch(()=>{});
  return i.reply({content:`تم تسجيل رفض طلب ${user}. السبب: ${reason}`,ephemeral:true});
 }
};
