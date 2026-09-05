# bluemace.xyz — link-in-bio with auth & dashboard

موقع على غرار guns.lol: المستخدم يسجل، يختار رابط (slug)، ويتحكم بصفحته العامة.

## 🚀 التشغيل محلياً

```bash
# 1. تثبيت الحزم
bun install        # أو: npm install / pnpm install

# 2. إعداد المتغيرات البيئية
cp .env.example .env
# افتح .env واملأ القيم

# 3. إنشاء قاعدة البيانات
bun run db:push

# 4. تشغيل خادم التطوير
bun run dev
```

افتح http://localhost:3000 في المتصفح.

## 🌐 النشر على Vercel (الأسهل)

### الخطوة 1: إعداد قاعدة بيانات PostgreSQL

1. روح على https://neon.tech (مجاني) أو https://supabase.com (مجاني)
2. أنشئ مشروع جديد
3. انسخ `DATABASE_URL` (يبدا بـ `postgresql://`)

### الخطوة 2: تعديل Prisma schema

في ملف `prisma/schema.prisma`، غيّر:
```prisma
datasource db {
  provider = "postgresql"   // بدل "sqlite"
  url      = env("DATABASE_URL")
}
```

### الخطوة 3: النشر على Vercel

1. ارفع المستودع لـ GitHub (تم ✅)
2. روح على https://vercel.com و سجل دخول بـ GitHub
3. اضغط **New Project** → اختر المستودع
4. في **Environment Variables**، أضف:
   - `DATABASE_URL` = رابط PostgreSQL من Neon/Supabase
   - `NEXTAUTH_SECRET` = نص عشوائي 32+ حرف (استخدم `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = `https://your-project.vercel.app` (بعد أول نشر)
   - `NEXT_PUBLIC_SITE_URL` = `bluemace.xyz` (أو نطاقك)
   - `NEXT_PUBLIC_HAS_DISCORD` = `false`
   - `NEXT_PUBLIC_HAS_GOOGLE` = `false`
   - `NEXT_PUBLIC_DISCORD_ENABLED` = `false`
   - `NEXT_PUBLIC_GOOGLE_ENABLED` = `false`
5. اضغط **Deploy**
6. بعد النشر، روح على Vercel Dashboard → Project → Settings → Functions → تأكد إن `build` يشتغل `prisma generate`

### الخطوة 4: ربط نطاق bluemace.xyz

1. في Vercel → Project → Settings → Domains
2. أضف `bluemace.xyz` و `www.bluemace.xyz`
3. اتبع تعليمات DNS (غيّر nameservers في موفر النطاق)
4. حدّث `NEXTAUTH_URL=https://bluemace.xyz` في Environment Variables

## 🔐 تفعيل Discord / Google OAuth (اختياري)

### Discord
1. https://discord.com/developers/applications → New Application
2. OAuth2 → Redirects:
   - `http://localhost:3000/api/auth/callback/discord` (dev)
   - `https://your-domain.com/api/auth/callback/discord` (prod)
3. انسخ Client ID و Client Secret في `.env`
4. ضع `NEXT_PUBLIC_DISCORD_ENABLED=true`

### Google
1. https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
4. ضع `NEXT_PUBLIC_GOOGLE_ENABLED=true`

## 🔗 روابط `bluemace.xyz/username` (بدل `?u=username`)

للحصول على روابط نظيفة، أضف التالي في `next.config.ts`:

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
├── .env.example
├── package.json
└── README.md
```

## 📝 ملاحظات

- قاعدة البيانات SQLite للتطوير فقط. للإنتاج، استخدم PostgreSQL.
- لتغيير قاعدة البيانات: عدّل `provider` في `prisma/schema.prisma` وشغّل `bun run db:push`.
- كل بيانات المستخدمين محفوظة في قاعدة البيانات (مش في localStorage).
- كلمات المرور مشفّرة بـ bcrypt (10 rounds).

## 🆘 الدعم

لو فيه مشكلة، افتح issue على GitHub.
