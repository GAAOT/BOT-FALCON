const { SlashCommandBuilder }=require('discord.js');const User=require('../models/User');const {admins}=require('../config');const {embed}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('add-credits').setDescription('إضافة رصيد لعضو أو خصمه (للمسؤولين المحددين فقط)').addUserOption(o=>o.setName('user').setDescription('العضو المستهدف').setRequired(true)).addIntegerOption(o=>o.setName('amount').setDescription('الكمية: موجبة للإضافة وسالبة للخصم').setRequired(true).setMinValue(-1000000).setMaxValue(1000000)),async execute(i){
 if(!admins.includes(i.user.id))return i.reply({content:'هذا الأمر للمسؤولين المحددين فقط.',ephemeral:true});
 const u=i.options.getUser('user'),n=i.options.getInteger('amount');if(n===0)return i.reply({content:'أدخل كمية غير صفرية.',ephemeral:true});
 const doc=await User.findOneAndUpdate({userId:u.id},{$setOnInsert:{userId:u.id}},{upsert:true,new:true});
 if(n<0&&doc.credits<Math.abs(n))return i.reply({content:'لا يمكن جعل الرصيد سالباً.',ephemeral:true});
 await User.updateOne({userId:u.id},{$inc:{credits:n}});
 await i.reply({embeds:[embed('تم تحديث الرصيد ✅',`${u}: ${n>0?'إضافة':'خصم'} **${Math.abs(n)}** نقطة.`)],ephemeral:true});
}};
