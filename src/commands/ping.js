const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../utils/helpers');
module.exports = {
 data: new SlashCommandBuilder().setName('ping').setDescription('عرض سرعة استجابة البوت'),
 async execute(interaction) {
   await interaction.reply({ embeds: [embed('🏓 Pong!', `سرعة الاتصال: **${interaction.client.ws.ping}ms**`)], ephemeral: true });
 }
};
