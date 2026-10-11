const { SlashCommandBuilder, EmbedBuilder }=require('discord.js');
module.exports={data:new SlashCommandBuilder().setName('userinfo').setDescription('عرض معلومات عضو في السيرفر').addUserOption(o=>o.setName('user').setDescription('العضو المطلوب')),async execute(i){
 const u=i.options.getUser('user')||i.user,m=await i.guild.members.fetch(u.id).catch(()=>null);
 const e=new EmbedBuilder().setColor(0x5865F2).setTitle(`معلومات ${u.username}`).setThumbnail(u.displayAvatarURL({size:256})).addFields(
 {name:'المعرف',value:u.id,inline:true},{name:'أنشئ الحساب',value:`<t:${Math.floor(u.createdTimestamp/1000)}:R>`,inline:true},
 {name:'انضم للسيرفر',value:m?`<t:${Math.floor(m.joinedTimestamp/1000)}:R>`:'غير موجود',inline:true},
 {name:'الرتب',value:m?(m.roles.cache.filter(r=>r.id!==i.guild.id).map(r=>r.toString()).slice(0,15).join(' ')||'لا توجد'):'—'}
 );
 await i.reply({embeds:[e]});
}};
