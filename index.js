const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('تم الاتصال بقاعدة البيانات (MongoDB) بنجاح!'))
    .catch((err) => console.error('خطأ في الاتصال بقاعدة البيانات:', err));
}

// نموذج تخزين إعدادات السيرفرات
const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' }
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

// 1. قائمة الأوامر (هنا تبدأ تضفت أوامرك السلاش الجديدة)
const commands = [
  new SlashCommandBuilder()
    .setName('ping') // اسم الأمر
    .setDescription('فحص سرعة استجابة البوت وحالة التشغيل') // وصف الأمر
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`البوت أونلاين وجاهز باسم: ${client.user.tag}`);

  // تسجيل الأوامر في ديسكورد تلقائياً عند تشغيل البوت
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('جاري تسجيل أوامر السلاش (Slash Commands)...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('تم تسجيل الأوامر بنجاح!');
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الأوامر:', error);
  }
});

// 2. التفاعل مع الأوامر عندما يكتبها المستخدم
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // تنفيذ أمر /ping
  if (interaction.commandName === 'ping') {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply({ 
      content: `Pong! 🏓 سرعة استجابة البوت: ${latency}ms`, 
      ephemeral: true // تخليه يظهر لك وحدك بدون ما يزعج بقية الاعضاء
    });
  }
  
  // تقدر تضيف أوامر ثانية هنا بنفس الطريقة!
});

client.login(process.env.TOKEN);
