const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const StaffAction = require('../models/StaffAction');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-demote').setDescription('تخفيض إداري بإزالة رتبته الحالية واختيار رتبة أدنى اختيارية')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(o=>o.setName('user').setDescription('الإداري المراد تخفيضه').setRequired(true))
  .addRoleOption(o=>o.setName('remove_role').setDescription('الرتبة التي ستزال').setRequired(true))
  .addRoleOption(o=>o.setName('add_role').setDescription('رتبة أدنى اختيارية لإضافتها'))
  .addStringOption(o=>o.setName('reason').setDescription('سبب التخفيض').setMaxLength(300)),
 async execute(i) {
  const s=await GuildSettings.findOne({guildId:i.guildId});
  if(!s?.seniorStaffRoleId) return i.reply({content:'لازم تضبط النظام أولًا باستخدام `/setup-staff`.',ephemeral:true});
  if(!i.member.roles.cache.has(s.seniorStaffRoleId)&&!i.memberPermissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'هذا الأمر للإدارة العليا المحددة فقط.',ephemeral:true});
  const user=i.options.getUser('user'),removeRole=i.options.getRole('remove_role'),addRole=i.options.getRole('add_role');
  const target=await i.guild.members.fetch(user.id).catch(()=>null);
  if(!target||!target.roles.cache.has(removeRole.id)) return i.reply({content:'العضو غير موجود أو لا يحمل الرتبة المحددة للإزالة.',ephemeral:true});
  if(user.id===i.user.id) return i.reply({content:'ما تقدرش تفصل نفسك بهذا الأمر.',ephemeral:true});
  if(!i.memberPermissions.has(PermissionFlagsBits.Administrator)&&target.roles.highest.position>=i.member.roles.highest.position) return i.reply({content:'ما تقدرش تفصل عضوًا أعلى منك أو مساويًا لك.',ephemeral:true});
  if(!removeRole.editable||removeRole.position>=i.guild.members.me.roles.highest.position) return i.reply({content:'لا أستطيع إزالة هذه الرتبة بسبب ترتيب الرتب.',ephemeral:true});
  if(addRole&&(addRole.id===i.guild.id||!addRole.editable||addRole.position>=i.guild.members.me.roles.highest.position)) return i.reply({content:'لا أستطيع إضافة الرتبة الأدنى المحددة.',ephemeral:true});
  await target.roles.remove(removeRole,`Demoted by ${i.user.tag}`);
  if(addRole) await target.roles.add(addRole,`Lower rank assigned by ${i.user.tag}`);
  const reason=i.options.getString('reason')||'';
  await StaffAction.create({guildId:i.guildId,targetId:user.id,actorId:i.user.id,action:'demote',reason,roleId:removeRole.id});
  return i.reply({content:`⬇️ تم تخفيض رتبة ${user}: أزيلت ${removeRole}${addRole?` وأضيفت ${addRole}`:''}.`,ephemeral:false});
 }
};
