require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

async function main() {
  if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    throw new Error('تأكد من DISCORD_TOKEN و CLIENT_ID في ملف .env');
  }
  const commandsPath = path.join(__dirname, '..', 'src', 'commands');
  const body = fs.readdirSync(commandsPath)
    .filter(f => f.endsWith('.js'))
    .map(f => require(path.join(commandsPath, f)).data.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  if (process.env.GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body });
    console.log(`تم تسجيل ${body.length} أمراً في السيرفر التجريبي.`);
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
    console.log(`تم تسجيل ${body.length} أمراً عالمياً. قد يحتاج الظهور بعض الوقت.`);
  }
}
main().catch(err => { console.error(err); process.exit(1); });
