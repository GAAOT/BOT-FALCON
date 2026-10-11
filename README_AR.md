# FOLK Discord Bot — نسخة تشغيل أولية موسّعة

## المتطلبات
- Node.js 20 أو أحدث
- بوت Discord من Developer Portal مع صلاحية `applications.commands` و `bot`
- MongoDB Atlas URI

## التشغيل على Termux
```bash
pkg update && pkg upgrade
pkg install nodejs-lts unzip
cd ~/storage/downloads
unzip FOLK-BOT-TERMUX.zip
cd FOLK-BOT
cp .env.example .env
nano .env
npm install
npm run deploy
npm start
```

ضع القيم في `.env` ولا ترسلها لأحد:
```env
DISCORD_TOKEN=ضع_توكن_البوت_هنا
MONGODB_URI=ضع_رابط_MongoDB_هنا
CLIENT_ID=ايدي_تطبيق_البوت
GUILD_ID=ايدي_سيرفر_التجربة_اختياري
```

إذا وضعت `GUILD_ID` تُسجّل الأوامر في سيرفر الاختبار بسرعة؛ وإلا تُسجّل عالميًا وقد يتأخر ظهورها.

## الأوامر المتضمنة في هذه النسخة
`/help /folkme /balance /pay /profile /server /avatar /say /clear /kick /ban /timeout /warn /deposit /withdraw /work /points /points-give /richest /ping /uptime`

## مهم جدًا
هذه نسخة تشغيل أولية موسعة وليست تنفيذًا كاملًا لكل المتطلبات الكبيرة التي طلبتها (مثل كل وظائف SilverWare وClover وControl Bank، نظام التذاكر المتعدد، anti-nuke، الاختصارات العامة، الترحيب واللفلات والسحوبات). لا يمكن ضمان خلو أي بوت من كل الأخطاء في كل بيئة؛ اختبره أولًا في سيرفر تجريبي. الأرصدة عالمية حسب Discord user ID. النقاط في هذه النسخة أيضًا عالمية حاليًا، وليست مفصولة لكل سيرفر بعد.

**أمان:** لا ترفع ملف `.env` إلى GitHub. إذا سبق أن نشرت توكن Discord أو GitHub أو كلمة مرور MongoDB، ألغها وولّد بدائل جديدة فورًا.
