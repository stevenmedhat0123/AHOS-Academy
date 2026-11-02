# AHOS Academy — تحديث نسخة الويب

الرابط: https://stevenmedhat0123.github.io/AHOS-Academy/  (لو رابطك مختلف خده من Settings ← Pages)

## كل تحديث
1. فك ضغط الـ ZIP (Files ← Extract).
2. المستودع ← Add file ← Upload files ← **كل الملفات** ← Commit changes. (ما تلمسش config.js ولا uploads-config.js.)
3. استنى دقيقتين، وافتح **status.html** في Chrome (نفس الرابط + status.html). هتشوف رقم النسخة وقايمة ✅/❌.
   - ✅ كله والرقم صح: التطبيق هيتحدث لوحده (بيعمل Reload وحده لما يلاقي ملفات جديدة، لما تفتحه أو ترجعله، وكل 10 دقايق).
   - لو لسه قديم: اضغط **مسح الكاش وإعادة التحميل** في status.html (ما بيطلعكش من حسابك).
   - ❌ على ملف: ارفعه تاني. صفحة 404: الملفات اترفعت في مكان غلط أو Pages لسه ما نشرتش (Actions ← "pages build and deployment").
4. في التطبيق: المزيد ← آخر السطر بيكتب `AHOS · build ...` وده رقم النسخة اللي شغالة.

## Firebase
الصق `firestore.rules` في Firebase ← Rules ← Publish (مرة بعد كل ZIP فيه تغيير فيها).
