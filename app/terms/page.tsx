"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        <h1 className="text-5xl font-black tracking-tight mb-8">
          Syarat & Ketentuan
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              1. Penerimaan Syarat
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Dengan mengakses dan menggunakan aplikasi CashFlow Journal, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, harap hentikan penggunaan aplikasi kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              2. Penggunaan Layanan
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Anda setuju untuk menggunakan CashFlow Journal hanya untuk tujuan yang sah dan dengan cara yang tidak melanggar hak-hak orang lain atau membatasi penggunaan dan kenikmatan orang lain atas aplikasi ini.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              3. Akun Pengguna
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Anda bertanggung jawab untuk mempertahankan kerahasiaan informasi akun Anda dan kata sandi serta untuk membatasi akses ke komputer atau perangkat Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              4. Data dan Privasi
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Data keuangan Anda disimpan dengan aman di server kami. Kami berkomitmen untuk melindungi privasi Anda sesuai dengan Kebijakan Privasi kami yang terpisah. Anda mempertahankan kepemilikan penuh atas semua data Anda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              5. Pembatasan Tanggung Jawab
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Dalam hal apa pun, CashFlow Journal tidak akan bertanggung jawab atas kerugian apa pun yang timbul dari penggunaan atau ketidakmampuan menggunakan aplikasi ini, termasuk tetapi tidak terbatas pada kerugian data langsung, tidak langsung, insidental, atau konsekuensial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              6. Dilarang Aktivitas
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Anda tidak boleh:
            </p>
            <ul className="text-zinc-300 leading-relaxed list-disc list-inside space-y-2">
              <li>Mengirimkan atau mentransmisikan materi yang ilegal atau berbahaya</li>
              <li>Mengganggu operasi atau jaringan aplikasi kami</li>
              <li>Mengakses atau mencari data aplikasi melalui cara apa pun selain antarmuka yang disediakan kami</li>
              <li>Mencoba untuk mengambil alih atau mengganggu layanan kami</li>
              <li>Membuat akun palsu atau menggunakan akun orang lain tanpa izin</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              7. Modifikasi Layanan
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Kami berhak untuk memodifikasi atau menghentikan layasi kami kapan saja dengan atau tanpa pemberitahuan. Kami tidak akan bertanggung jawab kepada Anda karena modifikasi atau penghentian layanan apa pun.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              8. Konten Pengguna
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Anda mempertahankan semua hak ke konten apa pun yang Anda kirimkan, posting, atau menampilkan di CashFlow Journal. Dengan mengirimkan konten, Anda memberikan kepada kami lisensi non-eksklusif untuk menggunakan konten tersebut untuk operasi layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              9. Hukum yang Mengatur
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Syarat dan Ketentuan ini dan Kebijakan Privasi kami diatur oleh dan ditafsirkan sesuai dengan hukum Indonesia, tanpa memperhatikan prinsip-prinsip konflik hukumnya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              10. Perubahan pada Syarat
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan saja. Penggunaan berkelanjutan dari aplikasi kami setelah perubahan tersebut akan dianggap sebagai penerimaan Anda terhadap Syarat dan Ketentuan yang diubah.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              11. Hubungi Kami
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di support@cashflowjournal.com
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
          <p className="text-zinc-400 text-sm">
            Syarat dan Ketentuan terakhir diperbarui pada 1 Juni 2026
          </p>
        </div>
      </div>
    </main>
  );
}
