"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";
import { Navigation } from "../components/Navigation";
import { LogIn, MapPin, Globe, Clock, ArrowLeft } from "lucide-react";

interface LoginRecord {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  location: string;
  login_time: string;
  logout_time: string | null;
}

export default function LoginHistoryPage() {
  const router = useRouter();
  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const fetchLoginHistory = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch login history from database
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", user.id)
        .order("login_time", { ascending: false })
        .limit(50);

      if (!error && data) {
        setLoginRecords(data);
      }
    }

    setLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID");
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "desktop":
        return "💻";
      case "mobile":
        return "📱";
      case "tablet":
        return "📱";
      default:
        return "🖥️";
    }
  };

  const getLocationEmoji = (location: string) => {
    if (location.toLowerCase().includes("jakarta")) return "🏙️";
    if (location.toLowerCase().includes("surabaya")) return "🌆";
    return "📍";
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Navigation />

      <div className="flex-1 p-4 md:p-8 md:ml-72">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              <LogIn size={32} className="text-emerald-400" />
              Riwayat Login
            </h1>
            <p className="text-zinc-500 text-lg mt-3">
              Pantau semua aktivitas login Anda dan identifikasi akses yang mencurigakan
            </p>
          </div>

          {loading ? (
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-12 text-center">
              <p className="text-zinc-400">Memuat riwayat login...</p>
            </div>
          ) : loginRecords.length === 0 ? (
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-12 text-center">
              <LogIn size={48} className="text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Belum ada riwayat login</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loginRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">
                        {getDeviceIcon(record.device_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold capitalize">
                          {record.device_type || "Unknown Device"}
                        </h3>
                        <p className="text-zinc-400 text-sm mt-1">
                          {record.user_agent}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <Clock size={16} />
                        <span className="font-semibold">
                          {formatDateTime(record.login_time)}
                        </span>
                      </div>
                      {record.logout_time && (
                        <p className="text-zinc-500 text-xs">
                          Logout: {new Date(record.logout_time).toLocaleTimeString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Globe size={16} />
                      <span className="text-sm">{record.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin size={16} />
                      {getLocationEmoji(record.location)}
                      <span className="text-sm">{record.location || "Lokasi Tidak Diketahui"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/30 rounded-3xl">
            <h3 className="font-bold text-blue-400 mb-2">💡 Tips Keamanan</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>• Periksa riwayat login Anda secara berkala untuk aktivitas mencurigakan</li>
              <li>• Ubah password Anda jika Anda melihat login dari perangkat atau lokasi yang tidak dikenal</li>
              <li>• Aktifkan 2FA (Verifikasi Dua Faktor) untuk keamanan tambahan</li>
              <li>• Jangan bagikan password Anda kepada siapa pun, bahkan ke dukungan teknis kami</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
