const { SlashCommandBuilder, EmbedBuilder }=require('discord.js');
module.exports={data:new SlashCommandBuilder().setName('serverinfo').setDescription('عرض معلومات السيرفر الحالي'),async execute(i){
 const g=i.guild;const e=new EmbedBuilder().setColor(0x5865F2).setTitle(`معلومات ${g.name}`).setThumbnail(g.iconURL({size:256})).addFields(
 {name:'معرف السيرفر',value:g.id,inline:true},{name:'الأعضاء',value:String(g.memberCount),inline:true},
 {name:'القنوات',value:String(g.channels.cache.size),inline:true},{name:'الرتب',value:String(g.roles.cache.size),inline:true},
 {name:'تاريخ الإنشاء',value:`<t:${Math.floor(g.createdTimestamp/1000)}:D>`,inline:true}
 );await i.reply({embeds:[e]});
}};
