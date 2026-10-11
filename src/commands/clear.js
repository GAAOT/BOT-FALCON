const { SlashCommandBuilder, PermissionFlagsBits }=require('discord.js');const {sendLog}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('clear').setDescription('حذف عدد من الرسائل في القناة الحالية').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o=>o.setName('amount').setDescription('عدد الرسائل (1 إلى 100)').setRequired(true).setMinValue(1).setMaxValue(100)),async execute(i){
 const n=i.options.getInteger('amount');await i.deferReply({ephemeral:true});const deleted=await i.channel.bulkDelete(n,true);await sendLog(i.guild,`${i.user.tag} حذف ${deleted.size} رسالة في ${i.channel}.`);await i.editReply(`تم حذف ${deleted.size} رسالة. ملاحظة: ديسكورد لا يسمح بالحذف الجماعي للرسائل الأقدم من 14 يوماً.`);
}};
