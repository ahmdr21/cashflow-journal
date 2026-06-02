# Setup Google OAuth untuk CashFlow Journal

## Langkah-langkah Konfigurasi

### 1. Google Cloud Console Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau gunakan project yang sudah ada
3. Aktifkan **Google+ API**:
   - Pilih "Enabled APIs & services" → "Enable APIs and Services"
   - Search "Google+ API" dan click "Enable"

4. Buat OAuth Credentials:
   - Di sidebar, pilih "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Pilih "Web application"
   - Pada "Authorized JavaScript origins", tambahkan:
     - `http://localhost:3000` (untuk development)
     - URL production Anda (misal: `https://cashflowjournal.com`)
   - Pada "Authorized redirect URIs", tambahkan:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`
   - Click "Create" dan copy **Client ID**

### 2. Supabase Console Setup

1. Buka [Supabase Dashboard](https://supabase.io/)
2. Pilih project Anda
3. Di sidebar, pilih "Authentication" → "Providers"
4. Cari **Google** dan click untuk membukanya
5. Toggle "Enable Sign in with Google" → ON
6. Paste **Client ID** dari Google Cloud Console di field "Client ID"
7. Paste **Client Secret** dari Google Cloud Console di field "Client Secret"
8. Pastikan **Redirect URL** sudah sesuai (biasanya otomatis: `https://[project-id].supabase.co/auth/v1/callback`)
9. Click "Save"

### 3. Environment Variables (.env.local)

Pastikan `.env.local` Anda memiliki:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 4. Testing

1. Buka `http://localhost:3000/login`
2. Click tombol "🌐 Google"
3. Anda akan diredirect ke Google login
4. Setelah login berhasil, Anda akan diredirect ke halaman utama `/`

### Troubleshooting

**Error: "Gagal login dengan Google"**
- Pastikan Google OAuth sudah diaktifkan di Supabase
- Pastikan Redirect URI sudah terdaftar di Google Cloud Console
- Check browser console untuk error details (F12 → Console)

**Redirect loop atau redirect salah**
- Pastikan `redirectTo` di code mengarah ke `/auth/callback`
- Pastikan `/auth/callback` route sudah ada di aplikasi

**User tidak masuk ke home setelah login**
- Check network tab (F12 → Network) saat melakukan OAuth
- Pastikan user sudah ter-authenticate setelah callback

## Fitur Baru

### Login Page (`/login`)
- ✅ Email/password login
- ✅ Google OAuth login dengan callback handler
- ✅ Forgot password
- ✅ Password visibility toggle
- ✅ Link ke halaman registrasi
- ✅ Styling transparan dan clean

### Register Page (`/register`)
- ✅ Email/password registration
- ✅ Password confirmation
- ✅ Validasi form (email format, password length, password match)
- ✅ Auto redirect ke login setelah registrasi
- ✅ Link ke halaman login
- ✅ Same styling sebagai login page

### OAuth Callback (`/auth/callback`)
- ✅ Handle OAuth redirect dari Google
- ✅ Exchange code untuk session
- ✅ Auto redirect ke home page setelah berhasil

## Styling Improvements

Input fields sekarang memiliki:
- ✅ Background transparan dengan hover effect
- ✅ Border yang lebih subtle (white/[0.12])
- ✅ Focus state dengan emerald accent
- ✅ Backdrop blur untuk effect modern
- ✅ Smooth transition pada semua state

## Auto-Redirect Flow

```
User Registration
↓
signUp() dengan email/password
↓
Check if email verification required
↓
Jika ya: Redirect ke /login dengan pesan
Jika tidak: Auto redirect ke /
```

```
User OAuth Login
↓
Click "Google" button
↓
Redirect ke /auth/callback dengan code
↓
exchangeCodeForSession(code)
↓
Auto redirect ke /
```

---

**Untuk bantuan lebih lanjut, lihat dokumentasi:**
- [Supabase Auth Docs](https://supabase.io/docs/guides/auth)
- [Supabase Google OAuth](https://supabase.io/docs/guides/auth/social-login/auth-google)
- [Next.js OAuth Setup](https://supabase.io/docs/guides/auth/social-login#nextjs)
