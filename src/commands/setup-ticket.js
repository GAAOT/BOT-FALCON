const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getSettings } = require('../utils/helpers');
module.exports = {
 data: new SlashCommandBuilder().setName('setup-ticket').setDescription('إرسال لوحة إنشاء التكتات')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o=>o.setName('channel').setDescription('القناة التي سترسل فيها اللوحة').addChannelTypes(ChannelType.GuildText).setRequired(true))
  .addRoleOption(o=>o.setName('support').setDescription('رتبة فريق الدعم').setRequired(false))
  .addChannelOption(o=>o.setName('category').setDescription('تصنيف قنوات التكتات').addChannelTypes(ChannelType.GuildCategory).setRequired(false)),
 async execute(i) {
  const s=await getSettings(i.guildId); const ch=i.options.getChannel('channel');
  const role=i.options.getRole('support'); const cat=i.options.getChannel('category');
  if(role) s.ticketSupportRoleId=role.id; if(cat) s.ticketCategoryId=cat.id;
  s.ticketPanelChannelId=ch.id;
  const row=new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('ticket:create').setPlaceholder('اختر نوع التكت / Choose ticket type').addOptions(
   {label:'الدعم الفني',description:'مساعدة ومشاكل عامة',value:'support',emoji:'🛠️'},
   {label:'الشراء',description:'الاستفسار عن شراء أو طلب',value:'purchase',emoji:'🛒'},
   {label:'شكوى',description:'تقديم شكوى للإدارة',value:'complaint',emoji:'📣'}
  ));
  const panel=new EmbedBuilder().setColor(0x5865F2).setTitle('🎫 مركز التكتات | Ticket Center').setDescription('اختر القسم المناسب من القائمة لفتح تكت خاص بك.\nChoose a category below to create a private ticket.');
  const msg=await ch.send({embeds:[panel],components:[row]}); s.ticketPanelMessageId=msg.id; await s.save();
  await i.reply({content:`تم إرسال لوحة التكتات في ${ch}.`,ephemeral:true});
 }
};
