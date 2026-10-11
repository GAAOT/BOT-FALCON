const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const StaffAction = require('../models/StaffAction');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-fire').setDescription('فصل إداري بإزالة رتبة الإدارة الأساسية المحددة')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(o=>o.setName('user').setDescription('الإداري المراد فصله').setRequired(true))
  .addStringOption(o=>o.setName('reason').setDescription('سبب الفصل').setRequired(true).setMaxLength(500)),
 async execute(i) {
  const s=await GuildSettings.findOne({guildId:i.guildId});
  if(!s?.staffRoleId||!s?.seniorStaffRoleId) return i.reply({content:'لازم تضبط النظام أولًا باستخدام `/setup-staff`.',ephemeral:true});
  if(!i.member.roles.cache.has(s.seniorStaffRoleId)&&!i.memberPermissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'هذا الأمر للإدارة العليا المحددة فقط.',ephemeral:true});
  const user=i.options.getUser('user'),reason=i.options.getString('reason'),target=await i.guild.members.fetch(user.id).catch(()=>null),role=await i.guild.roles.fetch(s.staffRoleId).catch(()=>null);
  if(!target||!role||!target.roles.cache.has(role.id)) return i.reply({content:'العضو لا يحمل رتبة الإدارة الأساسية أو أنه غير موجود.',ephemeral:true});
  if(user.id===i.user.id) return i.reply({content:'ما تقدرش تفصل نفسك بهذا الأمر.',ephemeral:true});
  if(!i.memberPermissions.has(PermissionFlagsBits.Administrator)&&target.roles.highest.position>=i.member.roles.highest.position) return i.reply({content:'ما تقدرش تفصل عضوًا أعلى منك أو مساويًا لك.',ephemeral:true});
  if(!role.editable||role.position>=i.guild.members.me.roles.highest.position) return i.reply({content:'لا أستطيع إزالة رتبة الإدارة؛ تحقق من ترتيب رتب البوت.',ephemeral:true});
  await target.roles.remove(role,`Staff fired by ${i.user.tag}: ${reason}`);
  await StaffAction.create({guildId:i.guildId,targetId:user.id,actorId:i.user.id,action:'fire',reason,roleId:role.id});
  await user.send(`تم فصلك من طاقم الإدارة في **${i.guild.name}**.\nالسبب: ${reason}`).catch(()=>{});
  return i.reply({content:`تم فصل ${user} من رتبة الإدارة ${role}. السبب: ${reason}`,ephemeral:false});
 }
};
