"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          Kebijakan Privasi
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              1. Pendahuluan
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              CashFlow Journal ("kami", "kami") mengoperasikan aplikasi CashFlow Journal. Halaman ini menginformasikan Anda tentang kebijakan privasi kami mengenai pengumpulan, penggunaan, dan pengungkapan data pribadi kami saat Anda menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              2. Informasi yang Kami Kumpulkan
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Kami mengumpulkan berbagai jenis informasi dalam hubungan dengan layanan yang kami berikan, termasuk:
            </p>
            <ul className="text-zinc-300 leading-relaxed list-disc list-inside space-y-2">
              <li>Informasi Akun: nama, alamat email, nomor telepon, dan kata sandi</li>
              <li>Data Transaksi: kategori, deskripsi, jumlah, dan tanggal transaksi keuangan Anda</li>
              <li>Informasi Perangkat: tipe perangkat, sistem operasi, dan pengidentifikasi unik</li>
              <li>Informasi Penggunaan: halaman yang dikunjungi, waktu dan durasi kunjungan, dan pola penggunaan</li>
              <li>Informasi Lokasi: data lokasi opsional jika Anda memberi izin</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              3. Bagaimana Kami Menggunakan Informasi Anda
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Kami menggunakan informasi yang kami kumpulkan untuk:
            </p>
            <ul className="text-zinc-300 leading-relaxed list-disc list-inside space-y-2">
              <li>Menyediakan, memelihara, dan meningkatkan layanan kami</li>
              <li>Memproses transaksi Anda dan mengirimkan notifikasi terkait</li>
              <li>Mengirimkan pesan informasi dan promosi opsional</li>
              <li>Merespons pertanyaan Anda dan memberikan dukungan pelanggan</li>
              <li>Memantau dan menganalisis tren, penggunaan, dan aktivitas untuk keamanan</li>
              <li>Mendeteksi, mencegah, dan mengatasi penipuan dan masalah teknis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              4. Keamanan Data
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Keamanan data Anda penting bagi kami. Kami menggunakan enkripsi SSL/TLS untuk melindungi data Anda dalam transit. Data Anda disimpan di server kami yang aman dengan akses terbatas. Namun, tidak ada metode transmisi Internet atau penyimpanan elektronik yang 100% aman, dan kami tidak dapat menjamin keamanan absolut.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              5. Pembagian Informasi
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya dapat membagikan informasi Anda:
            </p>
            <ul className="text-zinc-300 leading-relaxed list-disc list-inside space-y-2">
              <li>Kepada penyedia layanan yang membantu kami menjalankan aplikasi kami</li>
              <li>Jika diperlukan oleh hukum atau peraturan pemerintah</li>
              <li>Dengan persetujuan eksplisit Anda</li>
              <li>Untuk melindungi hak, privasi, keselamatan, atau properti kami</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              6. Cookie dan Teknologi Pelacakan
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Kami menggunakan cookie dan teknologi pelacakan serupa untuk melacak aktivitas di aplikasi kami dan menyimpan informasi tertentu. Anda dapat mengatur browser Anda untuk menolak cookie, tetapi beberapa fitur aplikasi kami mungkin tidak berfungsi dengan baik jika Anda melakukannya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              7. Retensi Data
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Kami menyimpan data pribadi Anda selama akun Anda aktif atau sesuai kebutuhan untuk memberikan layanan kepada Anda. Anda dapat meminta penghapusan akun Anda dan data terkait kapan saja.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              8. Hak Privasi Anda
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Bergantung pada yurisdiksi Anda, Anda mungkin memiliki hak untuk:
            </p>
            <ul className="text-zinc-300 leading-relaxed list-disc list-inside space-y-2">
              <li>Mengakses data pribadi Anda yang kami simpan</li>
              <li>Mengoreksi atau memperbarui informasi Anda</li>
              <li>Menghapus data Anda</li>
              <li>Menolak pemrosesan data Anda untuk tujuan pemasaran</li>
              <li>Membatasi penggunaan data Anda oleh kami</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              9. Layanan Pihak Ketiga
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Aplikasi kami dapat berisi tautan ke situs web atau layanan pihak ketiga yang bukan milik atau dikendalikan oleh kami. Kebijakan privasi ini hanya berlaku untuk aplikasi kami, dan kami tidak bertanggung jawab atas praktik privasi situs pihak ketiga. Harap baca kebijakan privasi mereka sebelum memberikan informasi pribadi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              10. Anak-Anak
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Aplikasi kami bukan untuk anak-anak di bawah 13 tahun. Kami tidak secara sengaja mengumpulkan informasi pribadi dari anak-anak di bawah 13 tahun. Jika kami mengetahui bahwa kami telah mengumpulkan informasi pribadi dari seorang anak di bawah 13 tahun, kami akan menghapusnya dengan segera.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              11. Perubahan pada Kebijakan Ini
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir Diperbarui" di bawah.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">
              12. Hubungi Kami
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi kami atau praktik privasi kami, silakan hubungi kami di:
            </p>
            <div className="mt-4 text-zinc-300">
              <p>Email: privacy@cashflowjournal.com</p>
              <p>Alamat: Jakarta, Indonesia</p>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
          <p className="text-zinc-400 text-sm">
            Kebijakan Privasi terakhir diperbarui pada 1 Juni 2026
          </p>
        </div>
      </div>
    </main>
  );
}
