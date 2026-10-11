const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../models/Ticket');
const Giveaway = require('../models/Giveaway');
const { getSettings, embed, sendLog } = require('../utils/helpers');

module.exports = { name: 'interactionCreate', async execute(i, client) {
 try {
  if (i.isButton() && i.customId.startsWith('falcon:language:')) {
   const language = i.customId.split(':')[2];
   const settings = await getSettings(i.guildId);
   settings.language = language;
   await settings.save();
   const content = language === 'ar'
    ? '✅ تم إعداد FALCON SYSTEM PRO بالعربية لهذا السيرفر! الألعاب تعمل بالبادئة `.` مثل `.اسرع` و`.رياضيات` و`.خمن`. إعدادات السيرفر مستقلة عن باقي السيرفرات.'
    : '✅ FALCON SYSTEM PRO is now configured in English for this server! Games use the `.` prefix, e.g. `.fast`, `.math`, and `.guess`. This server has its own settings.';
   await i.update({ content, embeds: [], components: [] });
   return;
  }

  if (i.isChatInputCommand()) {
   const command = client.commands.get(i.commandName);
   if (!command) return;
   await command.execute(i, client);
   return;
  }

  if (i.isStringSelectMenu() && i.customId === 'ticket:create') {
   const settings = await getSettings(i.guildId);
   const existing = await Ticket.findOne({ guildId:i.guildId, openerId:i.user.id, status:'open' });
   if (existing) return i.reply({ content:`عندك تكت مفتوح بالفعل: <#${existing.channelId}>`, ephemeral:true });
   const type = i.values[0];
   const typeNames = { support:'support', purchase:'purchase', complaint:'complaint' };
   const safeName = `${typeNames[type]}-${i.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,90) || `ticket-${i.user.id}`;
   const overwrites = [
    { id:i.guild.roles.everyone.id, deny:[PermissionFlagsBits.ViewChannel] },
    { id:i.user.id, allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles] },
    { id:client.user.id, allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels] }
   ];
   if (settings.ticketSupportRoleId) overwrites.push({id:settings.ticketSupportRoleId,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]});
   const channel = await i.guild.channels.create({ name:safeName, type:ChannelType.GuildText, parent:settings.ticketCategoryId||undefined, permissionOverwrites:overwrites, topic:`Ticket owner: ${i.user.id} | Type: ${type}` });
   await Ticket.create({guildId:i.guildId,channelId:channel.id,openerId:i.user.id,type,status:'open'});
   const intro = new EmbedBuilder().setColor(0x5865F2).setTitle('🎫 تم فتح التكت').setDescription(`أهلاً ${i.user}، اشرح طلبك وسيرد عليك فريق الدعم.\nالنوع: **${type}**\n\nأوامر التكت: \`/ticket-close\`, \`/ticket-rename\`, \`/ticket-add\`, \`/ticket-remove\`.`);
   await channel.send({content:settings.ticketSupportRoleId?`<@&${settings.ticketSupportRoleId}>`:`${i.user}`,embeds:[intro]});
   await sendLog(i.guild,`تم فتح تكت ${channel} بواسطة ${i.user.tag} (${type}).`);
   return i.reply({content:`تم إنشاء تكتك: ${channel}`,ephemeral:true});
  }

  if (i.isButton() && i.customId.startsWith('giveaway:join:')) {
   const id=i.customId.split(':')[2];const g=await Giveaway.findById(id);
   if(!g||g.ended||g.endsAt<=new Date())return i.reply({content:'هذه المسابقة انتهت.',ephemeral:true});
   if(g.entrants.includes(i.user.id))return i.reply({content:'أنت مشارك بالفعل! 🎉',ephemeral:true});
   g.entrants.push(i.user.id);await g.save();
   const e=i.message.embeds[0]?EmbedBuilder.from(i.message.embeds[0]):new EmbedBuilder().setTitle('مسابقة');
   const desc=e.data.description||'';e.setDescription(desc.replace(/المشاركون:\s*\d+/,'المشاركون: '+g.entrants.length));
   await i.message.edit({embeds:[e]});
   return i.reply({content:'تم تسجيل مشاركتك بالتوفيق! 🍀',ephemeral:true});
  }
 } catch (err) {
  console.error('interactionCreate error:',err);
  if (i.isRepliable()&&!i.replied&&!i.deferred) await i.reply({content:'صار خطأ أثناء تنفيذ الأمر. تأكد من إعدادات البوت والصلاحيات.',ephemeral:true}).catch(()=>{});
 }
}};
