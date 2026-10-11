require('dotenv').config();
const { REST, Routes } = require('discord.js');
const commands = require('./commands');
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) throw new Error('Set DISCORD_TOKEN and CLIENT_ID in .env');
const rest = new REST({version:'10'}).setToken(process.env.DISCORD_TOKEN);
(async()=>{try{await rest.put(Routes.applicationCommands(process.env.CLIENT_ID),{body:commands.map(c=>c.data.toJSON())}); console.log(`Registered ${commands.length} slash commands.`);}catch(e){console.error(e);process.exitCode=1;}})();
