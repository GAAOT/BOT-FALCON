const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const {embed,sendLog}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('role').setDescription('إعطاء رتبة لعضو أو سحبها منه').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).addStringOption(o=>o.setName('action').setDescription('اختر العملية').setRequired(true).addChoices({name:'إعطاء رتبة / Promote',value:'add'},{name:'سحب رتبة / Demote',value:'remove'})).addUserOption(o=>o.setName('user').setDescription('العضو المستهدف').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('الرتبة').setRequired(true)),async execute(i){
 const action=i.options.getString('action'),u=i.options.getUser('user'),r=i.options.getRole('role'),m=await i.guild.members.fetch(u.id).catch(()=>null);
 if(!m)return i.reply({content:'لم أجد العضو.',ephemeral:true});if(r.managed||r.position>=i.guild.members.me.roles.highest.position)return i.reply({content:'لا أستطيع إدارة هذه الرتبة بسبب ترتيب الرتب أو لأنها مُدارة من تكامل.',ephemeral:true});
 if(action==='add')await m.roles.add(r);else await m.roles.remove(r);
 await sendLog(i.guild,`${i.user.tag} ${action==='add'?'أعطى':'سحب'} الرتبة ${r.name} من ${u.tag}.`);
 await i.reply({embeds:[embed('تم تحديث الرتبة ✅',`${action==='add'?'أُعطيت':'سُحبت'} الرتبة ${r} ${action==='add'?'إلى':'من'} ${u}.`)],ephemeral:true});
}};
