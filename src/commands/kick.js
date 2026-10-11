const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const {sendLog,embed}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('kick').setDescription('طرد عضو من السيرفر').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o=>o.setName('user').setDescription('العضو المراد طرده').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('سبب الطرد').setRequired(false)),async execute(i){
 const u=i.options.getUser('user'),reason=i.options.getString('reason')||'لم يتم تحديد سبب';const m=await i.guild.members.fetch(u.id).catch(()=>null);
 if(!m)return i.reply({content:'لم أجد العضو في السيرفر.',ephemeral:true});if(!m.kickable)return i.reply({content:'لا أستطيع طرد هذا العضو؛ تحقق من ترتيب الرتب وصلاحيات البوت.',ephemeral:true});
 await m.kick(`${i.user.tag}: ${reason}`);await sendLog(i.guild,`طرد ${u.tag} بواسطة ${i.user.tag}. السبب: ${reason}`);await i.reply({embeds:[embed('تم الطرد ✅',`تم طرد ${u}.\nالسبب: ${reason}`)],ephemeral:true});
}};
