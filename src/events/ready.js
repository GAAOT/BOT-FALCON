module.exports = { name: 'ready', once: true, execute(client) {
 console.log(`🦅 FALCON SYSTEM online as ${client.user.tag}`);
 client.user.setActivity('/help | FALCON SYSTEM');
}};
