const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('فحص سرعة استجابة البوت'),
  new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('إرسال رسالة زر فتح التذاكر')
    .addChannelOption(option =>
      option.setName('category')
        .setDescription('القسم الذي ستفتح فيه رومات التذاكر')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('support_role')
        .setDescription('رتبة الإدارة أو الدعم الفني')
        .setRequired(true)
    )
].map(command => command.toJSON());

// تخزين مؤقت لإعدادات التذاكر في الذاكرة
const ticketSettings = new Map();

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

      // حفظ الإعدادات في الذاكرة مباشرة للسيرفر الحالي
      ticketSettings.set(interaction.guild.id, {
        categoryId: category.id,
        supportRoleId: supportRole.id
      });

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

      await interaction.reply({ content: 'تم إعداد لوحة التذاكر بنجاح!', ephemeral: true });
      await interaction.channel.send({ embeds: [embed], components: [row] });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const settings = ticketSettings.get(interaction.guild.id);
      const categoryId = settings ? settings.categoryId : null;
      const supportRoleId = settings ? settings.supportRoleId : null;

      const existingChannel = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
      );
      if (existingChannel) {
        return interaction.reply({ content: `لديك تذكرة مفتوحة بالفعل: ${existingChannel}`, ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      const permissionOverwrites = [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
        },
      ];

      if (supportRoleId) {
        permissionOverwrites.push({
          id: supportRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId || undefined,
        permissionOverwrites: permissionOverwrites,
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle(`تذكرة المستخدم: ${interaction.user.tag}`)
        .setDescription(`أهلاً بك! يرجى توضيح مشكلتك وسيتم الرد عليك قريباً.\n\n<@&${supportRoleId}>`)
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
