const { Client, GatewayIntentBits } = require('discord.js');
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
  prefix: { type: String, default: '!' }
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

client.once('ready', () => {
  console.log(`البوت أونلاين وجاهز باسم: ${client.user.tag}`);
});

// منطقة كتابة الأوامر والأحداث الخاصة بك
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  
  // تقدر تبدأ تكتب أكوادك وأوامرك هنا
});

// تسجيل الدخول باستخدام التوكن
client.login(process.env.TOKEN);
