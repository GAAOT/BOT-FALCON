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
    .setDescription('إرسال رسالة زر فتح التذاكر وتخصيص رسالة التذكرة')
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
    .addStringOption(option =>
      option.setName('message')
        .setDescription('الرسالة التي ستظهر داخل التذكرة للمستخدمين')
        .setRequired(true)
    )
].map(command => command.toJSON());

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
      const customMessage = interaction.options.getString('message');

      ticketSettings.set(interaction.guild.id, {
        categoryId: category.id,
        supportRoleId: supportRole.id,
        customMessage: customMessage
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

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: 'تم إعداد لوحة التذاكر وإرسالها بنجاح!', ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      await interaction.deferReply({ ephemeral: true });

      const settings = ticketSettings.get(interaction.guild.id);
      const categoryId = settings ? settings.categoryId : null;
      const supportRoleId = settings ? settings.supportRoleId : null;
      const customMessage = settings ? settings.customMessage : 'يرجى توضيح مشكلتك وسيتم الرد عليك قريباً.';

      const existingChannel = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
      );
      if (existingChannel) {
        return interaction.editReply({ content: `لديك تذكرة مفتوحة بالفعل: ${existingChannel}` });
      }

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
        .setDescription(`${customMessage}\n\n<@&${supportRoleId}>`)
        .setColor(0x00FFCC);

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('استلام التذكرة')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🙋‍♂️'),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('إغلاق التذكرة')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await ticketChannel.send({ content: `${interaction.user} أهلاً بك!`, embeds: [ticketEmbed], components: [actionRow] });
      await interaction.editReply({ content: `تم فتح التذكرة بنجاح! توجه إلى هنا: ${ticketChannel}` });
    }

    if (interaction.customId === 'claim_ticket') {
      await interaction.reply({ content: `تم استلام التذكرة بواسطة ${interaction.user}! ✅` });
      await interaction.channel.setName(`claimed-${interaction.user.username}`).catch(() => {});
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: 'جاري إغلاق التذكرة وحذف الغرفة...' });
      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }
});

// الأوامر النصية داخل رومات التذاكر ($تكت ، $اضافة ، $حذف)
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('claimed-')) return;

  // 1. أمر تغيير اسم التذكرة: $تكت [الاسم الجديد]
  if (command === '$تكت') {
    const newName = args.join('-');
    if (!newName) {
      return message.reply('❌ يرجى كتابة الاسم الجديد بعد الأمر. مثال: `$تكت مشكلة-شحن`');
    }
    try {
      await message.channel.setName(newName);
      message.reply(`✅ تم تغيير اسم التذكرة إلى: **${newName}**`);
    } catch (err) {
      message.reply('❌ حدث خطأ أثناء تغيير اسم الروم، تأكد من صلاحيات البوت.');
    }
  }

  // 2. أمر إضافة عضو للتذكرة: $اضافة @الشخص
  if (command === '$اضافة') {
    const targetMember = message.mentions.members.first();
    if (!targetMember) {
      return message.reply('❌ يرجى منشن الشخص المراد إضافته. مثال: `$اضافة @User`');
    }
    try {
      await message.channel.permissionOverwrites.edit(targetMember.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
      message.reply(`✅ تمت إضافة العضو ${targetMember} بنجاح إلى التذكرة.`);
    } catch (err) {
      message.reply('❌ حدث خطأ أثناء إضافة العضو.');
    }
  }

  // 3. أمر حذف التذكرة: $حذف
  if (command === '$حذف') {
    message.reply('🗑️ جاري حذف التذكرة...');
    setTimeout(async () => {
      await message.channel.delete().catch(() => {});
    }, 2000);
  }
});

client.login(process.env.TOKEN);
