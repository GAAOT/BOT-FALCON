const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const {sendLog,embed}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('ban').setDescription('حظر عضو من السيرفر').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o=>o.setName('user').setDescription('العضو المراد حظره').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('سبب الحظر').setRequired(false)),async execute(i){
 const u=i.options.getUser('user'),reason=i.options.getString('reason')||'لم يتم تحديد سبب';const m=await i.guild.members.fetch(u.id).catch(()=>null);
 if(m&&!m.bannable)return i.reply({content:'لا أستطيع حظر هذا العضو؛ تحقق من ترتيب الرتب.',ephemeral:true});
 await i.guild.members.ban(u.id,{reason:`${i.user.tag}: ${reason}`});await sendLog(i.guild,`حظر ${u.tag} بواسطة ${i.user.tag}. السبب: ${reason}`);await i.reply({embeds:[embed('تم الحظر 🔨',`تم حظر ${u.tag}.\nالسبب: ${reason}`)],ephemeral:true});
}};
