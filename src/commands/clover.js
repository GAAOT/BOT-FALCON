const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const GuildSettings = require('../models/GuildSettings');
module.exports = {
 data: new SlashCommandBuilder().setName('clover').setDescription('العب لعبة البرسيم واربح أو اخسر من رصيدك العام')
  .addIntegerOption(o=>o.setName('bet').setDescription('مقدار الرهان').setMinValue(1).setMaxValue(1000000).setRequired(true)),
 async execute(i) {
  const settings = await GuildSettings.findOne({guildId:i.guildId});
  if (!settings?.gamesChannelId) return i.reply({content:'الألعاب غير مفعّلة بعد. على الإدارة استخدام `/setup-games` واختيار روم الألعاب.',ephemeral:true});
  if (i.channelId !== settings.gamesChannelId) return i.reply({content:`تقدر تلعب في ${`< #${settings.gamesChannelId} >`.replace(' ','').replace(' ','') } فقط.`,ephemeral:true});
  const bet=i.options.getInteger('bet');
  const user=await User.findOneAndUpdate({userId:i.user.id},{$setOnInsert:{userId:i.user.id,credits:0}},{upsert:true,new:true});
  if(user.credits<bet) return i.reply({content:`رصيدك غير كافٍ. رصيدك الحالي: **${user.credits}** نقطة.`,ephemeral:true});
  const debit=await User.updateOne({userId:i.user.id,credits:{$gte:bet}},{$inc:{credits:-bet}});
  if(!debit.modifiedCount) return i.reply({content:'رصيدك تغيّر قبل بدء اللعبة. جرّب مرة ثانية.',ephemeral:true});
  const win=Math.random()<0.42;
  const payout=win?bet*2:0;
  if(payout) await User.updateOne({userId:i.user.id},{$inc:{credits:payout}});
  const fresh=await User.findOne({userId:i.user.id});
  const e=new EmbedBuilder().setColor(win?0x2ECC71:0xE74C3C).setTitle(win?'🍀 لقيت البرسيم المحظوظ!':'☘️ حظ أوفر المرة الجاية').setDescription(win?`رهانك: **${bet}**\nربحت **${payout}** نقطة إجماليًا، وصافي ربحك **${bet}** نقطة!`:`رهانك **${bet}** نقطة وخسرتها هذه المرة.`).addFields({name:'رصيدك الآن',value:`**${fresh?.credits||0}** نقطة`}).setFooter({text:'الرصيد عام بين سيرفرات البوت • العب بمسؤولية'});
  return i.reply({embeds:[e]});
 }
};
