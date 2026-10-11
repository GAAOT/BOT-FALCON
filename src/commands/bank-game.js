const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const GuildSettings = require('../models/GuildSettings');
module.exports = {
 data: new SlashCommandBuilder().setName('bank-game').setDescription('جرّب حظك في خزنة البنك: ربح مضاعف أو خسارة الرهان')
  .addIntegerOption(o=>o.setName('bet').setDescription('مقدار الرهان').setMinValue(1).setMaxValue(1000000).setRequired(true)),
 async execute(i) {
  const settings=await GuildSettings.findOne({guildId:i.guildId});
  if(!settings?.gamesChannelId) return i.reply({content:'الألعاب غير مفعّلة بعد. على الإدارة استخدام `/setup-games` واختيار روم الألعاب.',ephemeral:true});
  if(i.channelId!==settings.gamesChannelId) return i.reply({content:`تقدر تلعب في <#${settings.gamesChannelId}> فقط.`,ephemeral:true});
  const bet=i.options.getInteger('bet');
  const user=await User.findOneAndUpdate({userId:i.user.id},{$setOnInsert:{userId:i.user.id,credits:0}},{upsert:true,new:true});
  if(user.credits<bet) return i.reply({content:`رصيدك غير كافٍ. رصيدك الحالي: **${user.credits}** نقطة.`,ephemeral:true});
  const debit=await User.updateOne({userId:i.user.id,credits:{$gte:bet}},{$inc:{credits:-bet}});
  if(!debit.modifiedCount) return i.reply({content:'رصيدك تغيّر قبل بدء اللعبة. جرّب مرة ثانية.',ephemeral:true});
  const win=Math.random()<0.48;
  const payout=win?Math.floor(bet*1.8):0;
  if(payout) await User.updateOne({userId:i.user.id},{$inc:{credits:payout}});
  const fresh=await User.findOne({userId:i.user.id});
  const e=new EmbedBuilder().setColor(win?0xF1C40F:0x7F8C8D).setTitle(win?'🏦 فتحت خزنة البنك بنجاح!':'🔒 الخزنة أغلقت في وجهك').setDescription(win?`رهانك: **${bet}**\nاستلمت **${payout}** نقطة، وصافي ربحك **${payout-bet}** نقطة.`:`خسرت رهانك البالغ **${bet}** نقطة.`).addFields({name:'رصيدك الآن',value:`**${fresh?.credits||0}** نقطة`}).setFooter({text:'الرصيد عام بين سيرفرات البوت • النتائج عشوائية'});
  return i.reply({embeds:[e]});
 }
};
