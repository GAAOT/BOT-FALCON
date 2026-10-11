const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { colors } = require('../config');
const GuildSettings = require('../models/GuildSettings');

function embed(title, description, color = colors.main) {
  return new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();
}
async function getSettings(guildId) {
  return GuildSettings.findOneAndUpdate({ guildId }, { $setOnInsert: { guildId } }, { upsert: true, new: true });
}
function isAdmin(userId) {
  return require('../config').admins.includes(userId);
}
function hasManage(member) {
  return member?.permissions?.has(PermissionFlagsBits.Administrator) ||
         member?.permissions?.has(PermissionFlagsBits.ManageGuild);
}
async function sendLog(guild, description) {
  try {
    const settings = await getSettings(guild.id);
    if (!settings.logsChannelId) return;
    const channel = await guild.channels.fetch(settings.logsChannelId).catch(() => null);
    if (channel?.isTextBased()) await channel.send({ embeds: [embed('سجل الإدارة', description, colors.warning)] });
  } catch (e) { console.error('Log error:', e); }
}
module.exports = { embed, getSettings, isAdmin, hasManage, sendLog };
