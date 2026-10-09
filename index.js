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
    .setDescription('إرسال رسالة زر فتح التذاكر وتخصيص الإعدادات')
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
    .addChannelOption(option =>
      option.setName('log_channel')
        .setDescription('روم اللوق (سجلات إغلاق التذاكر)')
        .addChannelTypes(ChannelType.GuildText)
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
      const logChannel = interaction.options.getChannel('log_channel');
      const customMessage = interaction.options.getString('message');

      ticketSettings.set(interaction.guild.id, {
        categoryId: category.id,
        supportRoleId: supportRole.id,
        logChannelId: logChannel.id,
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
    const settings = ticketSettings.get(interaction.guild.id);
    const categoryId = settings ? settings.categoryId : null;
    const supportRoleId = settings ? settings.supportRoleId : null;
    const customMessage = settings ? settings.customMessage : 'يرجى توضيح مشكلتك وسيتم الرد عليك قريباً.';

    if (interaction.customId === 'create_ticket') {
      // التأكد من أن المستخدم ليس لديه تذكرة مفتوحة حالياً
      const existingChannel = interaction.guild.channels.cache.find(
        c => (c.name.startsWith('ticket-') || c.name.startsWith('claimed-')) &&
             c.permissionOverwrites.has(interaction.user.id)
      );

      if (existingChannel) {
        return interaction.reply({ content: `❌ لديك تذكرة مفتوحة بالفعل ولا يمكنك فتح تذكرة أخرى: ${existingChannel}`, ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      // حساب رقم التذكرة بناءً على الرومات الموجودة في السيرفر لضمان عدم تكرار الأرقام
      const existingTickets = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-') || c.name.startsWith('claimed-'));
      let ticketNumber = existingTickets.size + 1;
      
      // التأكد من أن الرقم غير مستخدم مسبقاً
      while (interaction.guild.channels.cache.some(c => c.name === `ticket-${ticketNumber}` || c.name === `claimed-${ticketNumber}`)) {
        ticketNumber++;
      }

      const channelName = `ticket-${ticketNumber}`;

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
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoryId || undefined,
        permissionOverwrites: permissionOverwrites,
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle(`تذكرة رقم: #${ticketNumber} | ${interaction.user.tag}`)
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
      if (interaction.channel.name.startsWith('claimed-')) {
        return interaction.reply({ content: '❌ هذه التذكرة مستلمة بالفعل بواسطة مشرف آخر!', ephemeral: true });
      }

      // استخراج رقم التذكرة الحالي من اسم الروم لتحديثه بشكل صحيح
      const currentName = interaction.channel.name.replace('ticket-', '');
      await interaction.reply({ content: `✅ تم استلام التذكرة بواسطة ${interaction.user}!` });
      await interaction.channel.setName(`claimed-${currentName}`).catch(() => {});

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claimed_disabled')
          .setLabel(`مستلمة بواسطة ${interaction.user.username}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('إغلاق التذكرة')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await interaction.message.edit({ components: [disabledRow] }).catch(() => {});
    }

    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: '🗑️ جاري إغلاق التذكرة وإرسال السجل...' });

      const logChannelId = settings ? settings.logChannelId : null;
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('📁 سجل إغلاق تذكرة')
            .setDescription(`تم إغلاق التذكرة **${interaction.channel.name}** بواسطة العضو/المشرف: ${interaction.user}`)
            .setColor(0xFF0000)
            .setTimestamp();
          await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }
});

// الأوامر النصية داخل رومات التذاكر
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
      message.reply(`✅ تمت إضافة العضو ${targetMember} بنجاح، وبإمكانه الآن رؤية والكتابة في التذكرة.`);
    } catch (err) {
      message.reply('❌ حدث خطأ أثناء إضافة العضو.');
    }
  }

  // 3. أمر حذف التذكرة: $حذف
  if (command === '$حذف') {
    message.reply('🗑️ جاري حذف التذكرة وسجلاتها...');
    
    const settings = ticketSettings.get(message.guild.id);
    const logChannelId = settings ? settings.logChannelId : null;
    if (logChannelId) {
      const logChannel = message.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('📁 سجل حذف تذكرة')
          .setDescription(`تم حذف التذكرة **${message.channel.name}** بواسطة: ${message.author}`)
          .setColor(0xFF0000)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }

    setTimeout(async () => {
      await message.channel.delete().catch(() => {});
    }, 2000);
  }
});

client.login(process.env.TOKEN);
