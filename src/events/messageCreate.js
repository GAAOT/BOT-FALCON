const GuildLevel = require('../models/GuildLevel');
const AutoReply = require('../models/AutoReply');
const { getSettings, sendLog } = require('../utils/helpers');
const replyCooldowns = new Map(), xpCooldowns = new Map(), messageWindows = new Map(), warned = new Map();
const activeGames = new Map();
const speedWords = ['falcon', 'discord', 'winner', 'gaming', 'rocket', 'system', 'eagle'];
const REPLY_COOLDOWN_MS=3000, XP_COOLDOWN_MS=60000;
module.exports={name:'messageCreate',async execute(message){
 if(!message.guild||message.author.bot||!message.content)return;
 const now=Date.now(),key=`${message.guild.id}:${message.author.id}`;
 try{
  const settings=await getSettings(message.guild.id);
  // Prefix games are enabled by default, like a ready-to-play games bot.
  // Arabic aliases are available when the server selected Arabic; English aliases remain accepted too.
  const lang = settings.language || 'ar';
  const raw = message.content.trim();
  const gameKey = `${message.guild.id}:${message.channel.id}`;
  const active = activeGames.get(gameKey);
  if (active && active.expiresAt > now && message.author.id !== active.starterId) {
   let won = false;
   if (active.type === 'speed' && raw.toLowerCase() === active.answer.toLowerCase()) won = true;
   if (active.type === 'math' && Number(raw) === active.answer) won = true;
   if (won) {
    activeGames.delete(gameKey);
    await message.reply(lang === 'ar' ? `🏆 برافو ${message.author}! جاوبت صح وفزت بتحدي **${active.type === 'speed' ? 'السرعة' : 'الرياضيات'}**.` : `🏆 Well done ${message.author}! You won the **${active.type}** challenge.`).catch(()=>{});
   }
  }
  const command = raw.replace(/^\./, '').split(/\s+/)[0].toLowerCase();
  const isSpeed = ['fast','speed','اسرع','أسرع','سرعة','السرعة'].includes(command);
  const isMath = ['math','رياضيات','حساب'].includes(command);
  const isGuess = ['guess','خمن','خمنها'].includes(command);
  if (raw.startsWith('.') && (isSpeed || isMath || isGuess)) {
   if (settings.gamesChannelId && message.channel.id !== settings.gamesChannelId) {
    await message.reply(lang === 'ar' ? `🎮 الألعاب مخصصة في <#${settings.gamesChannelId}>.` : `🎮 Games are set up in <#${settings.gamesChannelId}>.`).catch(()=>{});
    return;
   }
   if (activeGames.has(gameKey) && activeGames.get(gameKey).expiresAt > now) {
    await message.reply(lang === 'ar' ? '⏳ فيه تحدي شغال بالفعل في القناة! جاوبوا أول.' : '⏳ A game is already active in this channel! Answer it first.').catch(()=>{});
    return;
   }
   if (isSpeed) {
    const answer = speedWords[Math.floor(Math.random()*speedWords.length)];
    activeGames.set(gameKey, { type:'speed', answer, starterId:message.author.id, expiresAt:now+15000 });
    await message.channel.send(lang === 'ar' ? `⚡ **تحدي أسرع واحد!**
أول شخص يكتب الكلمة التالية يفوز:
# ${answer}
⏱️ عندكم 15 ثانية!` : `⚡ **Fastest typer challenge!**
First person to type this word wins:
# ${answer}
⏱️ You have 15 seconds!`).catch(()=>{});
    setTimeout(()=>{ const g=activeGames.get(gameKey); if(g?.type==='speed'&&g.answer===answer){activeGames.delete(gameKey);message.channel.send(lang==='ar'?'⌛ انتهى الوقت! ما حد فاز هالمرة.':'⌛ Time is up! Nobody won this round.').catch(()=>{});}},15000);
    return;
   }
   if (isMath) {
    const a=1+Math.floor(Math.random()*30), b=1+Math.floor(Math.random()*30), op=Math.random()<0.5?'+':'×';
    const answer=op==='+'?a+b:a*b;
    activeGames.set(gameKey,{type:'math',answer,starterId:message.author.id,expiresAt:now+20000});
    await message.channel.send(lang==='ar'?`🧠 **تحدي الرياضيات!** أول واحد يرسل الناتج يفوز:
# ${a} ${op} ${b}
⏱️ 20 ثانية.`:`🧠 **Math challenge!** First to answer wins:
# ${a} ${op} ${b}
⏱️ 20 seconds.`).catch(()=>{});
    setTimeout(()=>{const g=activeGames.get(gameKey);if(g?.type==='math'&&g.answer===answer){activeGames.delete(gameKey);message.channel.send(lang==='ar'?`⌛ انتهى الوقت! الإجابة كانت **${answer}**.`:`⌛ Time's up! The answer was **${answer}**.`).catch(()=>{});}},20000);
    return;
   }
   if (isGuess) {
    const answer=1+Math.floor(Math.random()*20);
    activeGames.set(gameKey,{type:'guess',answer,starterId:message.author.id,expiresAt:now+30000});
    await message.channel.send(lang==='ar'?'🎯 **خمن الرقم من 1 إلى 20!** اكتب تخمينك في رسالة منفصلة. عندكم 30 ثانية.':'🎯 **Guess a number from 1 to 20!** Send your guess in a separate message. You have 30 seconds.').catch(()=>{});
    setTimeout(()=>{const g=activeGames.get(gameKey);if(g?.type==='guess'&&g.answer===answer){activeGames.delete(gameKey);message.channel.send(lang==='ar'?`⌛ انتهى الوقت! الرقم كان **${answer}**.`:`⌛ Time's up! The number was **${answer}**.`).catch(()=>{});}},30000);
    return;
   }
  }
  if (active && active.type === 'guess' && active.expiresAt > now && message.author.id !== active.starterId) {
   const guess = Number(raw);
   if (Number.isInteger(guess) && guess >= 1 && guess <= 20) {
    if (guess === active.answer) { activeGames.delete(gameKey); await message.reply(lang==='ar'?'🎯 صح عليك! خمنت الرقم وفزت!':'🎯 Correct! You guessed the number and won!').catch(()=>{}); }
    else await message.reply(lang==='ar'?(guess<active.answer?'⬆️ أعلى!':'⬇️ أقل!'):(guess<active.answer?'⬆️ Higher!':'⬇️ Lower!')).catch(()=>{});
   }
  }
  // Configurable anti-spam; users with ManageMessages are exempt. Remove the burst, but avoid escalating automatically.
  if(settings.antiSpamEnabled&&!message.member.permissions.has('ManageMessages')){
   const arr=(messageWindows.get(key)||[]).filter(t=>now-t<settings.antiSpamWindowMs);arr.push(now);messageWindows.set(key,arr);
   if(arr.length>settings.antiSpamMax){await message.delete().catch(()=>{});if(now-(warned.get(key)||0)>5000){warned.set(key,now);const warn=await message.channel.send(`${message.author} هدّئ شوي، ممنوع السبام.`).catch(()=>null);if(warn)setTimeout(()=>warn.delete().catch(()=>{}),5000);}return;}
  }
  if(settings.antiInviteEnabled&&/(discord\.gg\/|discord\.com\/invite\/)/i.test(message.content)&&!message.member.permissions.has('ManageGuild')){await message.delete().catch(()=>{});return message.channel.send(`${message.author} روابط الدعوات ممنوعة هنا.`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),5000)).catch(()=>{});}
  if(settings.antiLinkEnabled&&/(https?:\/\/|www\.)/i.test(message.content)&&!message.member.permissions.has('ManageMessages')){await message.delete().catch(()=>{});return message.channel.send(`${message.author} الروابط ممنوعة هنا.`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),5000)).catch(()=>{});}
  const rules=await AutoReply.find({guildId:message.guild.id,enabled:true}).sort({trigger:-1}).limit(100),content=message.content.trim();
  const matched=rules.find(r=>{const a=content.toLowerCase(),b=r.trigger.trim().toLowerCase();return b&&(r.matchType==='exact'?a===b:a.includes(b));});
  if(matched&&now-(replyCooldowns.get(key)||0)>=REPLY_COOLDOWN_MS){replyCooldowns.set(key,now);await message.reply({content:matched.response,allowedMentions:{parse:[]}}).catch(()=>{});}
  if(now-(xpCooldowns.get(key)||0)<XP_COOLDOWN_MS)return;xpCooldowns.set(key,now);
  const gain=8+Math.floor(Math.random()*8);const user=await GuildLevel.findOneAndUpdate({guildId:message.guild.id,userId:message.author.id},{$inc:{xp:gain},$setOnInsert:{guildId:message.guild.id,userId:message.author.id}},{upsert:true,new:true});
  const next=(user.level+1)*100;if(user.xp>=next){user.level+=1;await user.save();await message.channel.send(`🎉 مبروك ${message.author}! وصلت للمستوى **${user.level}** في هذا السيرفر.`).catch(()=>{});}
 }catch(e){console.error('messageCreate error:',e);}
 if(messageWindows.size>10000)messageWindows.clear();if(replyCooldowns.size>5000)replyCooldowns.clear();if(xpCooldowns.size>5000)xpCooldowns.clear();if(warned.size>5000)warned.clear();
}};
