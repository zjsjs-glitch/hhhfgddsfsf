# bluemace.xyz — link-in-bio مع تسجيل دخول ولوحة تحكم

موقع على غرار guns.lol: المستخدم يسجل، يختار رابط (slug)، ويتحكم بصفحته العامة.

## التشغيل محلياً

```bash
# 1. ثبّت الحزم
bun install
# أو: npm install / pnpm install

# 2. أنشئ ملف .env (انسخ من .env.example واملأ القيم)
cp .env.example .env

# 3. أنشئ قاعدة البيانات
bun run db:push
# أو: npx prisma db push

# 4. شغّل خادم التطوير
bun run dev
# أو: npm run dev / pnpm dev
```

افتح http://localhost:3000 في المتصفح.

## التشغيل في الإنتاج

### Vercel (الأسهل)
1. ارفع المستودع لـ GitHub
2. اربطه بـ Vercel
3. أضف Environment Variables (انسخ من .env.example)
4. غيّر `DATABASE_URL` إلى PostgreSQL hosted (Neon، Supabase، Railway)
5. عدّل `prisma/schema.prisma` لتغيير `provider = "sqlite"` إلى `provider = "postgresql"`
6. شغّل `bun run db:push` بعد النشر

### VPS / Railway / Render
1. ثبّت Node.js 18+ أو Bun
2. ارفع الملفات
3. شغّل:
```bash
bun install
bun run db:push
bun run build
bun run start
```

## تفعيل Discord / Google OAuth

### Discord
1. روح https://discord.com/developers/applications
2. أنشئ New Application
3. في OAuth2 → Redirects أضف:
   - `http://localhost:3000/api/auth/callback/discord` (تطوير)
   - `https://yourdomain.com/api/auth/callback/discord` (إنتاج)
4. انسخ Client ID و Client Secret في `.env`
5. ضع `NEXT_PUBLIC_DISCORD_ENABLED=true`

### Google
1. روح https://console.cloud.google.com/apis/credentials
2. أنشئ OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
4. انسخ Client ID و Client Secret في `.env`
5. ضع `NEXT_PUBLIC_GOOGLE_ENABLED=true`

## استخدام نطاق مخصص (bluemace.xyz)

1. اشترِ النطاق من Namecheap / Cloudflare / GoDaddy
2. اربطه بالـ host (Vercel أسهل — يحوّل DNS تلقائياً)
3. حدّث `NEXTAUTH_URL=https://bluemace.xyz` في `.env`
4. لروابط `bluemace.xyz/username` بدلاً من `?u=username`:
   - أضف rewrite في `next.config.ts`:
   ```ts
   async redirects() {
     return [
       { source: '/:slug', destination: '/?u=:slug', permanent: false }
     ]
   }
   ```
   - أو أنشئ route ديناميكي `app/[slug]/page.tsx` يحوّل

## الميزات

- ✅ تسجيل دخول بـ email + username + password (bcrypt)
- ✅ تسجيل دخول Discord / Google (اختياري — يحتاج مفاتيح)
- ✅ اختيار slug للرابط العام (`/?u=username`)
- ✅ لوحة تحكم كاملة مع معاينة مباشرة
- ✅ خلفية فيديو + صورة غلاف
- ✅ 11 منصة تواصل اجتماعي
- ✅ عدّاد زيارات
- ✅ صفحة استكشاف للأحدث الصفحات
- ✅ حفظ تلقائي للحظات التعديل

## التقنيات

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- NextAuth.js v4
- bcryptjs لكلمة المرور
- z-ai-web-dev-sdk (للميزات المستقبلية)
