const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const User = require('../models/User');
const { getSettings, hasManage, embed } = require('./helpers');
const ownerIds = (process.env.FALCON_OWNER_IDS || '').split(',').map(x=>x.trim()).filter(Boolean);
function cmd(name, description, options, execute) {
 const data = new SlashCommandBuilder().setName(name).setDescription(description.slice(0,100));
 if(options) options(data);
 return {data, execute};
}
async function getUser(id) { return User.findOneAndUpdate({userId:id}, {$setOnInsert:{userId:id}}, {upsert:true,new:true}); }
function premium(settings) { return !!(settings.premiumUntil && settings.premiumUntil > new Date()); }
function isOwner(id) { return ownerIds.includes(id); }
function requireManage(i) { return hasManage(i.member); }
module.exports={cmd,getUser,premium,isOwner,requireManage,PermissionFlagsBits,GuildSettings,User,getSettings,embed,EmbedBuilder};
