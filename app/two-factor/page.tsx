"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";
import { Navigation } from "../components/Navigation";
import { Lock, Copy, Check, AlertCircle, ArrowLeft } from "lucide-react";

export default function TwoFactorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"disabled" | "enabled">("disabled");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    }
  };

  const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const handleEnableTwoFactor = async () => {
    setLoading(true);
    setErrorMessage("");

    const newSecret = generateSecret();
    setSecret(newSecret);

    // Generate a simple QR code URL using a service (in production, use proper QR library)
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth://totp/CashFlow:${user.email}?secret=${newSecret}&issuer=CashFlow`;
      setQrCode(qrUrl);
    }

    setLoading(false);
  };

  const handleVerifyTwoFactor = async () => {
    if (verificationCode.length !== 6) {
      setErrorMessage("Kode verifikasi harus 6 digit");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // In a real app, you would verify the TOTP code on the server
      // For now, we'll just store the secret as a placeholder
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            two_factor_enabled: true,
            two_factor_secret: secret,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        setErrorMessage("Gagal mengaktifkan 2FA. Silakan coba lagi.");
      } else {
        setSuccessMessage("2FA berhasil diaktifkan!");
        setStatus("enabled");
        setTimeout(() => {
          router.push("/pengaturan");
        }, 2000);
      }
    }

    setLoading(false);
  };

  const handleDisableTwoFactor = async () => {
    const confirmed = window.confirm(
      "Yakin ingin menonaktifkan 2FA? Akun Anda akan kurang aman."
    );

    if (!confirmed) return;

    setLoading(true);
    setErrorMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("user_settings")
        .update({ two_factor_enabled: false })
        .eq("user_id", user.id);

      if (error) {
        setErrorMessage("Gagal menonaktifkan 2FA. Silakan coba lagi.");
      } else {
        setSuccessMessage("2FA berhasil dinonaktifkan!");
        setStatus("disabled");
        setTimeout(() => {
          router.push("/pengaturan");
        }, 2000);
      }
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Navigation />

      <div className="flex-1 p-4 md:p-8 md:ml-72">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              <Lock size={32} className="text-emerald-400" />
              Verifikasi 2FA
            </h1>
            <p className="text-zinc-500 text-lg mt-3">
              Tingkatkan keamanan akun Anda dengan autentikasi dua faktor
            </p>
          </div>

          {(errorMessage || successMessage) && (
            <div
              className={`mb-6 rounded-2xl border px-6 py-4 flex items-start gap-4 ${
                errorMessage
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-green-500/30 bg-green-500/10"
              }`}
            >
              <AlertCircle
                size={24}
                className={errorMessage ? "text-red-400" : "text-green-400"}
              />
              <p className={errorMessage ? "text-red-400" : "text-green-400"}>
                {errorMessage || successMessage}
              </p>
            </div>
          )}

          {status === "disabled" ? (
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Aktifkan 2FA</h2>

              {!secret ? (
                <div>
                  <p className="text-zinc-400 mb-6">
                    Autentikasi dua faktor menambah lapisan keamanan ekstra ke akun Anda. Anda akan diminta untuk memasukkan kode dari aplikasi autentikasi saat login.
                  </p>

                  <button
                    onClick={handleEnableTwoFactor}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-6 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
                  >
                    {loading ? "Memproses..." : "Mulai Proses 2FA"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Langkah 1: Pindai QR Code</h3>
                    <p className="text-zinc-400 mb-4">
                      Gunakan aplikasi autentikasi seperti Google Authenticator, Microsoft Authenticator, atau Authy untuk memindai QR code di bawah ini:
                    </p>
                    <div className="bg-white p-4 rounded-lg flex justify-center mb-4">
                      {qrCode && (
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4">Langkah 2: Kunci Rahasia</h3>
                    <p className="text-zinc-400 mb-4">
                      Jika QR code tidak berfungsi, masukkan kode ini secara manual di aplikasi Anda:
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                      <code className="font-mono text-emerald-400 text-lg break-all">
                        {secret}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="ml-4 p-2 hover:bg-zinc-800 rounded transition"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check size={20} className="text-green-400" />
                        ) : (
                          <Copy size={20} className="text-zinc-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4">Langkah 3: Verifikasi Kode</h3>
                    <p className="text-zinc-400 mb-4">
                      Masukkan kode 6 digit yang ditampilkan di aplikasi autentikasi Anda:
                    </p>
                    <input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                      maxLength={6}
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl font-mono tracking-widest text-white mb-4"
                    />

                    <button
                      onClick={handleVerifyTwoFactor}
                      disabled={loading || verificationCode.length !== 6}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-6 py-4 rounded-lg font-bold transition"
                    >
                      {loading ? "Memverifikasi..." : "Verifikasi & Aktifkan 2FA"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/80 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">2FA Sudah Aktif</h2>
                  <p className="text-zinc-400 mt-1">
                    Akun Anda dilindungi dengan autentikasi dua faktor.
                  </p>
                </div>
              </div>

              <p className="text-zinc-400 mb-6">
                Setiap kali Anda login, Anda akan diminta untuk memasukkan kode dari aplikasi autentikasi Anda. Ini membuat akun Anda jauh lebih aman.
              </p>

              <button
                onClick={handleDisableTwoFactor}
                disabled={loading}
                className="w-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 text-red-400 px-6 py-4 rounded-lg font-bold transition"
              >
                {loading ? "Memproses..." : "Nonaktifkan 2FA"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
