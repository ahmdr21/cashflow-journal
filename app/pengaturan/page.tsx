"use client";

import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import {
  Settings,
  User,
  Bell,
  Lock,
  HardDrive,
  LogOut,
  Save,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

export default function PengaturanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Ahmad Ramadhan");
  const [userEmail, setUserEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      if (profile?.phone_number) {
        setPhoneNumber(profile.phone_number);
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profile")
        .upsert(
          {
            id: user.id,
            full_name: userName,
            phone_number: phoneNumber,
          },
          { onConflict: "id" }
        );

      setSavedMessage("Profil berhasil disimpan!");
      setTimeout(() => setSavedMessage(""), 3000);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Silakan login kembali untuk mengekspor data.");
      return;
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !transactions) {
      alert("Gagal mengambil data transaksi untuk export.");
      return;
    }

    const csvRows = [
      ["Tanggal", "Kategori", "Deskripsi", "Tipe", "Nominal"],
      ...transactions.map((item) => [
        new Date(item.created_at).toLocaleDateString("id-ID"),
        item.category,
        item.description,
        item.type,
        item.amount.toString(),
      ]),
    ];

    const csv = csvRows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    downloadFile("cashflow-transactions.csv", csv, "text/csv;charset=utf-8");
    setSavedMessage("Data berhasil diekspor ke CSV.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleBackupData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Silakan login kembali untuk membuat backup.");
      return;
    }

    const [{ data: transactions, error: txError }, { data: profile, error: profileError }] =
      await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id),
        supabase.from("profile").select("*").eq("id", user.id).maybeSingle(),
      ]);

    if (txError) {
      alert("Gagal mengambil transaksi untuk backup.");
      return;
    }

    if (profileError) {
      alert("Gagal mengambil profil untuk backup.");
      return;
    }

    const backup = {
      user: {
        id: user.id,
        email: user.email,
        full_name: userName,
        phone_number: phoneNumber,
      },
      profile,
      transactions,
      created_at: new Date().toISOString(),
    };

    downloadFile(
      "cashflow-backup.json",
      JSON.stringify(backup, null, 2),
      "application/json"
    );
    setSavedMessage("Backup data berhasil dibuat.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleDeleteAllData = async () => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus semua data transaksi? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmDelete) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Silakan login kembali.");
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      alert("Gagal menghapus data transaksi.");
      return;
    }

    setSavedMessage("Semua transaksi berhasil dihapus.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleResetPassword = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      alert("Tidak dapat mengirim reset password. Email pengguna tidak ditemukan.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      user.email
    );

    if (error) {
      alert(error.message);
      return;
    }

    setSavedMessage("Link reset password telah dikirim ke email Anda.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Navigation />

      {/* CONTENT */}
      <div className="flex-1 p-4 md:p-8 md:ml-72">
        <div className="max-w-3xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              <Settings size={32} className="text-green-400" />
              Pengaturan
            </h1>
            <p className="text-zinc-500 text-lg mt-3">
              Kelola profil dan preferensi akun Anda
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {savedMessage && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-400 text-black flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              {savedMessage}
            </div>
          )}

          {/* SETTINGS SECTIONS */}
          <div className="space-y-6">
            {/* PROFIL SECTION */}
            <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <User size={20} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-black">Profil Pengguna</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-zinc-400 text-sm block mb-3">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-sm block mb-3">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="contoh: 081234567890"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition text-white"
                  />
                  <p className="text-zinc-500 text-sm mt-2">
                    Nomor digunakan untuk fitur kirim laporan WhatsApp.
                  </p>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm block mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-zinc-500"
                  />
                  <p className="text-zinc-500 text-sm mt-2">
                    Email tidak dapat diubah
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </section>

            {/* NOTIFIKASI SECTION */}
            <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bell size={20} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-black">Notifikasi</h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Notifikasi Pengeluaran Besar", desc: "Ingatkan saat pengeluaran melebihi batas" },
                  { label: "Laporan Mingguan", desc: "Terima ringkasan mingguan via email" },
                  { label: "Reminder Kategori", desc: "Ingatkan menginput transaksi" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-green-500" />
                  </div>
                ))}
              </div>
            </section>

            {/* KEAMANAN SECTION */}
            <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Lock size={20} className="text-yellow-400" />
                </div>
                <h2 className="text-2xl font-black">Keamanan</h2>
              </div>

              <div className="space-y-3">
                <button onClick={handleResetPassword} className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition">
                  <span className="font-semibold">Ubah Password</span>
                  <ChevronRight size={20} className="text-zinc-500" />
                </button>
                <button onClick={() => router.push("/two-factor")} className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition">
                  <span className="font-semibold">Verifikasi 2FA</span>
                  <ChevronRight size={20} className="text-zinc-500" />
                </button>
                <button onClick={() => router.push("/login-history")} className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition">
                  <span className="font-semibold">Riwayat Login</span>
                  <ChevronRight size={20} className="text-zinc-500" />
                </button>
              </div>
            </section>

            {/* DATA SECTION */}
            <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <HardDrive size={20} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-black">Data & Cadangan</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition"
                >
                  <span className="font-semibold">Export Data (CSV)</span>
                  <ChevronRight size={20} className="text-zinc-500" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition">
                  <span className="font-semibold">Buat Backup</span>
                  <ChevronRight size={20} className="text-zinc-500" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition">
                  <span className="font-semibold text-red-400">Hapus Semua Data</span>
                  <ChevronRight size={20} className="text-red-400" />
                </button>
              </div>
            </section>

            {/* AKUN SECTION */}
            <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-black mb-6">Akun</h2>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 px-6 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                Keluar (Logout)
              </button>
            </section>

            {/* ABOUT SECTION */}
            <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-black mb-6">Tentang</h2>

              <div className="space-y-3 text-zinc-400">
                <div className="flex justify-between">
                  <span>Versi Aplikasi</span>
                  <span className="text-white font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Dibuat</span>
                  <span className="text-white font-semibold">2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform</span>
                  <span className="text-white font-semibold">Web</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-zinc-500 text-sm">
                  CashFlow Journal adalah aplikasi manajemen keuangan pribadi yang membantu Anda
                  mengelola pengeluaran dan pemasukan dengan lebih efisien.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
