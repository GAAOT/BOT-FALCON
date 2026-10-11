const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const StaffAction = require('../models/StaffAction');
module.exports = {
 data: new SlashCommandBuilder().setName('staff-history').setDescription('عرض سجل القبول والرفض والترقيات والتخفيضات والفصل').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption(o=>o.setName('user').setDescription('فلترة السجل حسب عضو اختياري')),
 async execute(i) {
  const settings=await GuildSettings.findOne({guildId:i.guildId});
  if(!settings?.seniorStaffRoleId) return i.reply({content:'لازم تضبط النظام أولًا باستخدام `/setup-staff`.',ephemeral:true});
  if(!i.member.roles.cache.has(settings.seniorStaffRoleId)&&!i.memberPermissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'سجل الإدارة متاح للإدارة العليا فقط.',ephemeral:true});
  const user=i.options.getUser('user');
  const filter={guildId:i.guildId};if(user)filter.targetId=user.id;
  const rows=await StaffAction.find(filter).sort({createdAt:-1}).limit(15);
  const names={accept:'قبول إدارة',reject:'رفض طلب',promote:'ترقية',demote:'تخفيض',fire:'فصل'};
  const lines=rows.map(r=>`**${names[r.action]||r.action}** — <@${r.targetId}>\nالمنفّذ: <@${r.actorId}> • <t:${Math.floor(r.createdAt.getTime()/1000)}:R>${r.reason?`\nالسبب: ${r.reason}`:''}`);
  const e=new EmbedBuilder().setColor(0x5865F2).setTitle('📋 سجل الإدارة').setDescription(lines.join('\n\n')||'لا توجد سجلات بعد.');
  return i.reply({embeds:[e],ephemeral:true});
 }
};
