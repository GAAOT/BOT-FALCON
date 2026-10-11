const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType }=require('discord.js');const Giveaway=require('../models/Giveaway');
module.exports={data:new SlashCommandBuilder().setName('giveaway').setDescription('إنشاء مسابقة مع زر مشاركة').setDefaultMemberPermissions(1n<<5n)
 .addStringOption(o=>o.setName('prize').setDescription('الجائزة').setRequired(true).setMaxLength(200))
 .addIntegerOption(o=>o.setName('minutes').setDescription('مدة المسابقة بالدقائق').setRequired(true).setMinValue(1).setMaxValue(10080))
 .addChannelOption(o=>o.setName('channel').setDescription('قناة المسابقة (اختياري)').addChannelTypes(ChannelType.GuildText)),
 async execute(i){
 const prize=i.options.getString('prize'),minutes=i.options.getInteger('minutes'),ch=i.options.getChannel('channel')||i.channel,endsAt=new Date(Date.now()+minutes*60000);
 const g=await Giveaway.create({guildId:i.guildId,channelId:ch.id,hostId:i.user.id,prize,endsAt,entrants:[],ended:false});
 const e=new EmbedBuilder().setColor(0xFEE75C).setTitle('🎉 مسابقة جديدة!').setDescription(`**الجائزة:** ${prize}\n**المضيف:** ${i.user}\n**تنتهي:** <t:${Math.floor(endsAt.getTime()/1000)}:R>\n**المشاركون:** 0`);
 const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`giveaway:join:${g.id}`).setLabel('شارك الآن').setEmoji('🎉').setStyle(ButtonStyle.Success));
 const msg=await ch.send({embeds:[e],components:[row]});g.messageId=msg.id;await g.save();await i.reply({content:`تم إنشاء المسابقة في ${ch}.`,ephemeral:true});
 }};
