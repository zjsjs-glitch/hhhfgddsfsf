# bluemace.xyz — link-in-bio with auth & dashboard

موقع على غرار guns.lol: المستخدم يسجل، يختار رابط (slug)، ويتحكم بصفحته العامة.

## 🚀 التشغيل محلياً

```bash
# 1. تثبيت الحزم
bun install        # أو: npm install

# 2. إعداد المتغيرات البيئية
cp .env.example .env

# 3. إنشاء قاعدة البيانات
bun run db:push

# 4. تشغيل خادم التطوير
bun run dev
```

افتح http://localhost:3000

## 🚂 النشر على Railway

### الخطوة 1: إعداد قاعدة بيانات PostgreSQL على Railway

1. روح على https://railway.app وسجل دخول بـ GitHub
2. اضغط **New Project** → **Provision PostgreSQL**
3. انتظر حتى ينشئ القاعدة
4. اضغط على PostgreSQL service → **Variables** → انسخ `DATABASE_URL`
   (يبدا بـ `postgresql://...`)

### الخطوة 2: تعديل Prisma schema لـ PostgreSQL

في ملف `prisma/schema.prisma`، غيّر:

```prisma
datasource db {
  provider = "postgresql"   # بدل "sqlite"
  url      = env("DATABASE_URL")
}
```

### الخطوة 3: رفع المستودع على Railway

1. في Railway Dashboard → **New Project** → **Deploy from GitHub repo**
2. اختر المستودع `zjsjs-glitch/hhhfgddsfsf`
3. في **Variables** أضف:

   ```
   DATABASE_URL=postgresql://... (من Railway PostgreSQL)
   NEXTAUTH_SECRET=اكتب-نص-عشوائي-32-حرف-على-الأقل
   NEXTAUTH_URL=https://your-app.up.railway.app
   NEXT_PUBLIC_SITE_URL=bluemace.xyz
   NEXT_PUBLIC_HAS_DISCORD=false
   NEXT_PUBLIC_HAS_GOOGLE=false
   NEXT_PUBLIC_DISCORD_ENABLED=false
   NEXT_PUBLIC_GOOGLE_ENABLED=false
   ```

4. لتوليد `NEXTAUTH_SECRET`، شغّل في Terminal:
   ```bash
   openssl rand -base64 32
   ```

5. Railway سيبني المشروع تلقائياً ويشغّله
6. انتظر حتى يظهر **Deployments → Active** وافتح الرابط 🎉

### الخطوة 4: إنشاء الجداول (مرة واحدة فقط)

بعد أول deploy ناجح، شغّل:

```bash
# من Terminal محلي
git clone https://github.com/zjsjs-glitch/hhhfgddsfsf
cd hhhfgddsfsf
npm install
# استخدم DATABASE_URL من Railway
DATABASE_URL=postgresql://... npx prisma db push --accept-data-loss
```

أو استخدم Railway shell:
1. Railway → PostgreSQL service → **Data** → **Query**
2. شغّل SQL:
   ```sql
   -- ما تحتاج شيء لو شغلت prisma db push من عندك
   ```

### الخطوة 5: ربط نطاق مخصص (bluemace.xyz)

1. Railway → Settings → **Networking** → **Generate Domain**
2. بعدها: **Custom Domains** → أضف `bluemace.xyz`
3. عند موفر النطاق:
   - أضف **CNAME** record يش للرابط اللي أعطاك Railway
   - أو عدّل A records حسب التعليمات
4. حدّث `NEXTAUTH_URL=https://bluemace.xyz` في Variables

## 🔐 تفعيل Discord / Google OAuth (اختياري)

### Discord
1. https://discord.com/developers/applications → New Application
2. OAuth2 → Redirects:
   - `https://your-app.up.railway.app/api/auth/callback/discord`
   - `https://bluemace.xyz/api/auth/callback/discord` (بعد ربط النطاق)
3. في Railway Variables:
   - `DISCORD_CLIENT_ID=...`
   - `DISCORD_CLIENT_SECRET=...`
   - `NEXT_PUBLIC_DISCORD_ENABLED=true`

### Google
1. https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `https://your-app.up.railway.app/api/auth/callback/google`
   - `https://bluemace.xyz/api/auth/callback/google`
4. في Railway Variables:
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`
   - `NEXT_PUBLIC_GOOGLE_ENABLED=true`

## 🔗 روابط نظيفة `bluemace.xyz/username`

افتح `next.config.ts` وأضف:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:slug",
        has: [{ type: "query", key: "u", absent: true }],
        destination: "/?u=:slug",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

ملاحظة: تأكد إن الـ slug ما يتعارض مع routes موجودة (`/api`, `/_next`, إلخ).

## ✨ الميزات

- ✅ تسجيل دخول بـ email + username + password (bcrypt)
- ✅ تسجيل دخول Discord / Google (اختياري)
- ✅ اختيار slug للرابط العام
- ✅ لوحة تحكم كاملة مع معاينة مباشرة
- ✅ خلفية فيديو + صورة غلاف + جزيئات
- ✅ 11 منصة تواصل اجتماعي
- ✅ عدّاد زيارات
- ✅ صفحة استكشاف للأحدث الصفحات
- ✅ حفظ تلقائي

## 🛠️ التقنيات

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js v4 + bcryptjs
- **Icons**: Lucide React
- **Hosting**: Railway (recommended) + Railway PostgreSQL

## 📁 البنية

```
bluemace.xyz/
├── prisma/
│   └── schema.prisma        # نماذج قاعدة البيانات
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth + register routes
│   │   │   ├── profile/     # CRUD للـ profiles
│   │   │   ├── check-slug/  # فحص توافر slug
│   │   │   ├── explore/     # قائمة الصفحات العامة
│   │   │   └── me/          # بيانات المستخدم الحالي
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/            # sign-in, slug-setup
│   │   ├── dashboard/       # لوحة التحكم + معاينة
│   │   ├── explore/         # صفحة الاستكشاف
│   │   ├── home/            # router رئيسي
│   │   ├── landing/         # صفحة الهبوط
│   │   ├── profile/         # الصفحة العامة + particles
│   │   └── ui/              # shadcn/ui components
│   └── lib/
│       ├── auth.ts          # NextAuth config
│       ├── db.ts            # Prisma client
│       └── ...
├── railway.json             # Railway config
├── .env.example
├── package.json
└── README.md
```

## 🆘 الدعم

لو فيه مشكلة، افتح issue على GitHub.
