const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const StaffAction = require('../models/StaffAction');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-promote').setDescription('ترقية إداري بإضافة رتبة موجودة في السيرفر')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(o=>o.setName('user').setDescription('الإداري المراد ترقيته').setRequired(true))
  .addRoleOption(o=>o.setName('role').setDescription('الرتبة الأعلى التي ستضاف').setRequired(true))
  .addRoleOption(o=>o.setName('remove_role').setDescription('رتبة قديمة اختيارية لإزالتها'))
  .addStringOption(o=>o.setName('reason').setDescription('سبب الترقية').setMaxLength(300)),
 async execute(i) {
  const s=await GuildSettings.findOne({guildId:i.guildId});
  if(!s?.seniorStaffRoleId) return i.reply({content:'لازم تضبط النظام أولًا باستخدام `/setup-staff`.',ephemeral:true});
  if(!i.member.roles.cache.has(s.seniorStaffRoleId)&&!i.memberPermissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'هذا الأمر للإدارة العليا المحددة فقط.',ephemeral:true});
  const user=i.options.getUser('user'),newRole=i.options.getRole('role'),oldRole=i.options.getRole('remove_role');
  const target=await i.guild.members.fetch(user.id).catch(()=>null);
  if(!target||user.bot) return i.reply({content:'العضو غير موجود أو أنه بوت.',ephemeral:true});
  if(user.id===i.user.id) return i.reply({content:'ما تقدرش تفصل نفسك بهذا الأمر.',ephemeral:true});
  if(!i.memberPermissions.has(PermissionFlagsBits.Administrator)&&target.roles.highest.position>=i.member.roles.highest.position) return i.reply({content:'ما تقدرش تفصل عضوًا أعلى منك أو مساويًا لك.',ephemeral:true});
  if(newRole.id===i.guild.id||!newRole.editable||newRole.position>=i.guild.members.me.roles.highest.position) return i.reply({content:'لا أستطيع إضافة هذه الرتبة؛ تحقق من ترتيب رتب البوت.',ephemeral:true});
  if(oldRole&&(!oldRole.editable||oldRole.position>=i.guild.members.me.roles.highest.position)) return i.reply({content:'لا أستطيع إزالة الرتبة القديمة بسبب ترتيب الرتب.',ephemeral:true});
  await target.roles.add(newRole,`Promoted by ${i.user.tag}`);
  if(oldRole) await target.roles.remove(oldRole,`Previous rank removed by ${i.user.tag}`);
  const reason=i.options.getString('reason')||'';
  await StaffAction.create({guildId:i.guildId,targetId:user.id,actorId:i.user.id,action:'promote',reason,roleId:newRole.id});
  return i.reply({content:`⬆️ تمت ترقية ${user} إلى ${newRole}${oldRole?` وإزالة ${oldRole}`:''}.`,ephemeral:false});
 }
};
