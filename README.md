# FALCON SYSTEM PRO 🦅

بوت ديسكورد متعدد الوظائف باستخدام Discord.js v14 وMongoDB.

## المميزات
- أوامر Slash بأسماء إنجليزية ووصف عربي.
- تكتات مع لوحة اختيار، فتح، إغلاق، إعادة فتح، إضافة/إزالة عضو، تغيير اسم، وحفظ سجل نصي عند الإغلاق.
- ترحيب ومغادرة مع صورة العضو داخل Embed.
- إعداد قناة السجلات.
- أدوات إدارة: تحذير، طرد، حظر، timeout، مسح رسائل، إدارة رتب.
- مستويات XP وترتيب الأعضاء (منفصلة لكل سيرفر).
- رصيد وتحويل رصيد وإدارة الرصيد للمسؤولين المحددين (الرصيد عالمي بين كل السيرفرات).
- مسابقات بزر مشاركة واختيار فائز تلقائي عند انتهائها.
- معلومات العضو والسيرفر وأمر `/help` مقسّم حسب الأقسام مع شرح عربي لكل أمر.
- ردود تلقائية قابلة للإعداد لكل سيرفر: `/autoreply-add` و`/autoreply-remove` و`/autoreply-list`.
- نظام خبرة يحد من جمع XP بالسبام عبر مهلة دقيقة لكل عضو في كل سيرفر.
- نظام طاقم الإدارة: إعداد الرتب الموجودة، قبول/رفض، ترقية/تخفيض، فصل، قائمة الطاقم وسجل القرارات.

## التثبيت محلياً
1. ثبّت Node.js 20 أو أحدث.
2. انسخ `.env.example` إلى `.env` واملأ القيم.
3. شغّل `npm install`.
4. سجّل أوامر Slash:
   - للسيرفر التجريبي: ضع `GUILD_ID` في `.env` ثم `npm run deploy`
   - للنشر العام: اترك `GUILD_ID` فارغاً ثم `npm run deploy` (قد يتأخر ظهور الأوامر).
5. شغّل `npm start`.

## Render
أنشئ **Background Worker**:
- Build Command: `npm install`
- Start Command: `npm start`
- أضف المتغيرات `DISCORD_TOKEN`, `CLIENT_ID`, `MONGODB_URI` و`GUILD_ID` إذا احتجته.
- استخدم MongoDB Atlas كقاعدة بيانات.

## Discord Developer Portal
فعّل `Server Members Intent` و`Message Content Intent` في صفحة Bot. يحتاج البوت صلاحيات Discord المناسبة ورتبته أعلى من الرتب التي سيديرها.

## ملاحظات
- أوامر الترقية/التخفيض عبر `/role` تمنح أو تسحب رتبة تختارها؛ لا يستطيع البوت تجاوز ترتيب رتب Discord.
- لا تشارك `DISCORD_TOKEN` أو رابط قاعدة البيانات مع أحد.
- اختبر الأوامر في سيرفر تجريبي أولاً. هذا مشروع أساس متكامل قابل للتوسعة، وليس نسخة مطابقة لخدمات ProBot أو Ticket Tool التجارية.

## إعداد الردود التلقائية
- `/autoreply-add` لإضافة رد: حدّد `trigger` (الكلمة)، و`response` (الرد)، و`match` (contains أو exact).
- `contains` يرد إذا احتوت الرسالة على الكلمة، و`exact` يرد إذا كانت الرسالة هي الكلمة فقط.
- `/autoreply-list` يعرض الردود، و`/autoreply-remove` يحذف ردًا باستخدام نفس الكلمة المحفوظة.
- الردود لا تعمل إلا بعد رفع التعديلات وإعادة تشغيل البوت، وتسجيل أوامر Slash مجددًا بواسطة `npm run deploy`.
- تتطلب هذه الأوامر صلاحية **Manage Server / إدارة السيرفر**، والردود مستقلة لكل سيرفر.

## إعداد نظام طاقم الإدارة
1. استعمل `/setup-staff` واختر رتبة الإدارة الأساسية ورتبة الإدارة العليا من الرتب الموجودة في السيرفر.
2. `/staff-accept` يقبل عضوًا ويعطيه الرتبة الأساسية المحددة.
3. `/staff-reject` يسجل الرفض والسبب، ويحاول إرسال إشعار خاص للعضو.
4. `/staff-promote` يضيف رتبة أعلى موجودة، ويمكن اختيار رتبة قديمة لإزالتها.
5. `/staff-demote` يزيل الرتبة المحددة ويمكن إضافة رتبة أدنى. `/staff-fire` يزيل رتبة الإدارة الأساسية.
6. `/staff-list` يعرض أعضاء الرتبة الأساسية، و`/staff-history` يعرض آخر القرارات.

## فصل البيانات
- الأرصدة محفوظة في سجل عالمي حسب Discord user ID، لذلك الرصيد نفسه في كل السيرفرات.
- XP والمستويات محفوظة بمفتاح يجمع server ID وuser ID، لذلك مستوى العضو يختلف من سيرفر لآخر.
- إعدادات التكت والترحيب والسجلات والتحذيرات والمسابقات مرتبطة بمعرّف السيرفر.


## 🎮 ألعاب الرصيد
- `/setup-games` لتحديد روم الألعاب (يتطلب Manage Server).
- `/clover bet:<amount>` لعبة البرسيم.
- `/bank-game bet:<amount>` لعبة خزنة البنك.
الألعاب تعمل فقط في الروم الذي حدّدته الإدارة، وتستخدم رصيد المستخدم العام بين السيرفرات. النتائج عشوائية وقد تخسر الرهان.


## FALCON SYSTEM PRO 3.0 — إضافات

تشمل هذه النسخة نظام Cash عالمي مشترك بين السيرفرات، مكافآت يومية وأسبوعية وعمل، تحويل Cash، متجر وحقيبة، ملفات أعضاء، ألعاب خفيفة، تصويت، أدوات صورة/نرد، Premium داخلي للسيرفر، إعداد تحقق ورتبة تلقائية، ومنع سبام وروابط قابل للضبط.

### متغيرات إضافية
- `FALCON_OWNER_IDS`: أرقام حسابات مالكي البوت مفصولة بفواصل. مطلوبة لاستخدام `/premium-grant`.

### خطوات التشغيل
1. ثبّت Node.js 20 أو أحدث.
2. انسخ `.env.example` إلى `.env` واملأ `DISCORD_TOKEN` و`CLIENT_ID` و`MONGODB_URI`.
3. فعّل Server Members Intent وMessage Content Intent من Discord Developer Portal.
4. شغّل `npm install` ثم `npm run deploy` ثم `npm start`.

### ملاحظات مهمة قبل الإنتاج
- هذه نسخة تطوير موسعة وليست مدققة على سيرفر حقيقي؛ اختبرها في سيرفر تجريبي أولاً، وتأكد من صلاحيات البوت وترتيب الرتب.
- ميزة Premium هنا هي entitlement داخلي يتحكم به مالك البوت عبر `/premium-grant`، وليست اشتراكاً مدفوعاً جاهزاً ولا تفعيل Premium في Clover أو ProBot. بوابة الدفع والفواتير والتجديد الآلي غير مدمجة.
- ميزات الألعاب هي ألعاب أصلية بسيطة مستوحاة من أنواع شائعة، وليست نسخاً حرفية من ألعاب أو كود بوتات أخرى. ليست كل الألعاب المذكورة في أي بوت خارجي موجودة هنا.
- لا تضع `DISCORD_TOKEN` أو `MONGODB_URI` في GitHub. أضفهما كـ Environment Variables في Render.
- بعض الميزات القديمة من النسخة السابقة باقية؛ راجع الأوامر واختبرها قبل إطلاق البوت للعامة.

## Language onboarding and prefix games (updated build)
- When the bot joins a server, it attempts to post a bilingual language picker in the system channel or first writable text channel.
- Selecting Arabic or English saves that server's language independently in MongoDB.
- `/language` lets a server manager change the language later.
- Prefix games are enabled by default: `.اسرع` / `.fast`, `.رياضيات` / `.math`, `.خمن` / `.guess`.
- If a games channel is configured with `/setup-games`, prefix games are restricted to that channel; otherwise they work in any text channel.

## Important release status
This project is an **alpha/starter build**, not a claim of a fully production-tested 200–300-command commercial bot. JavaScript syntax was checked, but it has not been tested against your live Discord application and MongoDB. Configure a test server first, review permissions, and test every moderation/economy flow before inviting it to a public community. Premium currently provides the foundation/commands present in the source; real payment processing and subscription verification must be configured separately.
