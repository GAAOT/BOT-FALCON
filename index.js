const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات MongoDB (عبر متغير البيئة في Render)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('تم الاتصال بقاعدة البيانات (MongoDB) بنجاح!'))
    .catch((err) => console.error('خطأ في الاتصال بقاعدة البيانات:', err));
}

// نموذج تخزين إعدادات كل سيرفر على حدة
const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  logChannel: { type: String, default: null },
  ticketCategory: { type: String, default: null }
});
const GuildModel = mongoose.model('GuildSetting', guildSchema);

// إنشاء عميل البوت مع الصلاحيات (Intents) اللازمة
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// تعريف أوامر البوت (Slash Commands)
const commands = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('إعداد النظام الأساسي للبوت في السيرفر')
    .addChannelOption(option =>
      option.setName('log_channel').setDescription('قناة السجلات (Logs)').setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('فحص سرعة استجابة البوت')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`البوت أونلاين وجاهز باسم: ${client.user.tag}`);

  // تسجيل الأوامر عند التشغيل
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('جاري تسجيل الأوامر (Slash Commands)...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('تم تسجيل الأوامر بنجاح لجميع السيرفرات!');
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الأوامر:', error);
  }
});

// التعامل مع تنفيذ الأوامر
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply({ content: `Pong! سرعة الاستجابة: ${latency}ms 🏓`, ephemeral: true });
  }

  if (interaction.commandName === 'setup') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'عذراً، يجب أن تمتلك صلاحية المسؤول (Administrator) لتنفيذ هذا الأمر.', ephemeral: true });
    }

    const logChannel = interaction.options.getChannel('log_channel');

    // حفظ أو تحديث الإعدادات الخاصة بهذا السيرفر حصرياً في قاعدة البيانات
    await GuildModel.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { logChannel: logChannel.id },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('تم الحفظ بنجاح ✅')
      .setDescription(`تم ضبط قناة السجلات لهذا السيرفر لتصبح: ${logChannel}`)
      .setColor(0x5865F2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// تسجيل الدخول باستخدام التوكن
client.login(process.env.TOKEN);

