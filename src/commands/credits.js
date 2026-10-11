const { SlashCommandBuilder }=require('discord.js');const User=require('../models/User');const {embed}=require('../utils/helpers');
module.exports={data:new SlashCommandBuilder().setName('credits').setDescription('عرض رصيدك أو تحويل رصيد إلى عضو').addUserOption(o=>o.setName('user').setDescription('عضو اختياري لعرض رصيده أو التحويل إليه')).addIntegerOption(o=>o.setName('amount').setDescription('عدد النقاط للتحويل').setMinValue(1)),async execute(i){
 const target=i.options.getUser('user');const amount=i.options.getInteger('amount');
 if(amount&&!target)return i.reply({content:'حدد العضو الذي تريد تحويل الرصيد إليه.',ephemeral:true});
 if(target&&target.id===i.user.id&&amount)return i.reply({content:'لا يمكنك تحويل الرصيد لنفسك.',ephemeral:true});
 const owner=await User.findOneAndUpdate({userId:i.user.id},{$setOnInsert:{userId:i.user.id}},{upsert:true,new:true});
 if(!amount){const u=target?await User.findOneAndUpdate({userId:target.id},{$setOnInsert:{userId:target.id}},{upsert:true,new:true}):owner;return i.reply({embeds:[embed('💰 الرصيد',`${target||i.user} لديه **${u.credits}** نقطة.`)],ephemeral:true});}
 await i.reply({content:'لتأكيد التحويل، اكتب في هذه القناة: `CONFIRM` خلال 15 ثانية. لا تكتب معلومات سرية.',ephemeral:true});
 const collected=await i.channel.awaitMessages({filter:m=>m.author.id===i.user.id&&m.content.trim().toUpperCase()==='CONFIRM',max:1,time:15000}).catch(()=>null);
 if(!collected?.size)return;
 const fresh=await User.findOne({userId:i.user.id});if(!fresh||fresh.credits<amount){await i.followUp({content:'رصيدك غير كافٍ.',ephemeral:true});return;}
 await User.updateOne({userId:i.user.id,credits:{$gte:amount}},{$inc:{credits:-amount}});
 await User.findOneAndUpdate({userId:target.id},{$inc:{credits:amount},$setOnInsert:{userId:target.id}},{upsert:true});
 await i.followUp({embeds:[embed('تم التحويل ✅',`حوّلت **${amount}** نقطة إلى ${target}.`)],ephemeral:true});
}};
