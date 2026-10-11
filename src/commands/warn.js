const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const Warning=require('../models/Warning');const {sendLog,embed}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('warn').setDescription('إرسال تحذير لعضو وحفظه في السجلات').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('user').setDescription('العضو').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('سبب التحذير').setRequired(false)),async execute(i){
 const u=i.options.getUser('user'),reason=i.options.getString('reason')||'لم يتم تحديد سبب';if(u.bot)return i.reply({content:'لا يمكن تحذير بوت.',ephemeral:true});
 await Warning.create({guildId:i.guildId,userId:u.id,moderatorId:i.user.id,reason});
 await u.send({embeds:[embed('⚠️ تحذير إداري',`تم تحذيرك في **${i.guild.name}**.\nالسبب: ${reason}`)]}).catch(()=>{});
 await sendLog(i.guild,`تحذير ${u.tag} بواسطة ${i.user.tag}. السبب: ${reason}`);
 await i.reply({embeds:[embed('تم التحذير ⚠️',`تم تحذير ${u}.\nالسبب: ${reason}`)],ephemeral:true});
}};
