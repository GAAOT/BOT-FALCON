const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('تم الاتصال بقاعدة البيانات (MongoDB) بنجاح!'))
    .catch((err) => console.error('خطأ في الاتصال بقاعدة البيانات:', err));
}

// نموذج تخزين إعدادات السيرفرات (يشمل فئة وقناة رتبة الدعم الفني)
const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  ticketCategory: { type: String, default: null },
  supportRole: { type: String, default: null }
});
const GuildModel = mongoose.model('GuildSetting', guildSchema);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// قائمة الأوامر (سلاش) مع إضافة اختيار رتبة الدعم
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('فحص سرعة استجابة البوت'),
  new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('إرسال رسالة زر فتح التذاكر وتحديد الإعدادات')
    .addCategoryChannelOption(option =>
      option.setName('category')
        .setDescription('القسم (Category) الذي ستفتح فيه رومات التذاكر')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('support_role')
        .setDescription('رتبة الإدارة أو الدعم الفني التي تستطيع رؤية التذاكر')
        .setRequired(true)
    )
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`البوت أونلاين وجاهز باسم: ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('جاري تسجيل أوامر السلاش...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('تم تسجيل الأوامر بنجاح!');
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الأوامر:', error);
  }
});

client.on('interactionCreate', async interaction => {
  // 1. التعامل مع الأوامر
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'ping') {
      const latency = Date.now() - interaction.createdTimestamp;
      await interaction.reply({ content: `Pong! 🏓 سرعة استجابة البوت: ${latency}ms`, ephemeral: true });
    }

    if (interaction.commandName === 'ticket-setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'عذراً، يجب أن تمتلك صلاحية المسؤول (Administrator) لاستخدام هذا الأمر.', ephemeral: true });
      }

      const category = interaction.options.getChannel('category');
      const supportRole = interaction.options.getRole('support_role');

      // حفظ الإعدادات في قاعدة البيانات لكل سيرفر
      await GuildModel.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { 
          ticketCategory: category.id,
          supportRole: supportRole.id 
        },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setTitle('🎫 نظام الدعم الفني والتذاكر')
        .setDescription('إذا كنت بحاجة إلى مساعدة أو لديك استفسار، اضغط على الزر بالأسفل لفتح تذكرة خاصة بك.')
        .setColor(0x5865F2)
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('فتح تذكرة')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫')
      );

      await interaction.reply({ content: 'تم إعداد لوحة التذاكر وحفظ رتبة الإدارة بنجاح!', ephemeral: true });
      await interaction.channel.send({ embeds: [embed], components: [row] });
    }
  }

  // 2. التعامل مع الأزرار
  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const guildData = await GuildModel.findOne({ guildId: interaction.guild.id });
      const categoryId = guildData ? guildData.ticketCategory : null;
      const supportRoleId = guildData ? guildData.supportRole : null;

      // منع فتح أكثر من تذكرة لنفس المستخدم
      const existingChannel = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
      );
      if (existingChannel) {
        return interaction.reply({ content: `لديك تذكرة مفتوحة بالفعل: ${existingChannel}`, ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      // تجهيز الصلاحيات (إخفاء الروم عن الكل، وإعطاء الصلاحية لصاحب التذكرة، ولرتبة الدعم الفني، والبوت)
      const permissionOverwrites = [
        {
          id: interaction.guild.id, // @everyone
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id, // صاحب التذكرة
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: client.user.id, // البوت
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
        },
      ];

      // إذا كانت رتبة الدعم موجودة، نعطيها صلاحية الرؤية
      if (supportRoleId) {
        permissionOverwrites.push({
          id: supportRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      // إنشاء روم التذكرة
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId || undefined,
        permissionOverwrites: permissionOverwrites,
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle(`تذكرة المستخدم: ${interaction.user.tag}`)
        .setDescription(`أهلاً بك! يرجى توضيح مشكلتك وسيتم الرد عليك قريباً من قبل فريق الإدارة.\n\n<@&${supportRoleId}>`)
        .setColor(0x00FFCC);

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('إغلاق التذكرة')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await ticketChannel.send({ content: `${interaction.user} أهلاً بك!`, embeds: [ticketEmbed], components: [closeRow] });
      await interaction.editReply({ content: `تم فتح التذكرة بنجاح! توجه إلى هنا: ${ticketChannel}` });
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: 'جاري إغلاق التذكرة وحذف الغرفة...' });
      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }
});

client.login(process.env.TOKEN);
