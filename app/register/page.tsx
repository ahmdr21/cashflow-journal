"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // CHECK SESSION
  // =========================

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.push("/");
    }
  }

  // =========================
  // VALIDATION
  // =========================

  const validateForm = () => {
    setError("");

    if (!email.trim()) {
      setError("Email harus diisi.");
      return false;
    }

    if (!email.includes("@")) {
      setError("Format email tidak valid.");
      return false;
    }

    if (!password.trim()) {
      setError("Password harus diisi.");
      return false;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return false;
    }

    return true;
  };

  // =========================
  // REGISTRATION
  // =========================

  async function handleRegister() {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;

    if (userId) {
      await supabase.from("profile").upsert({
        id: userId,
        email,
        full_name: email.split("@")[0],
      });
    }

    // If user exists (auto-confirm), sign in directly
    if (data?.user && !data.user.user_metadata?.email_verified) {
      setSuccessMessage(
        "Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun."
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      // Auto login after signup
      router.push("/");
    }

    setLoading(false);
  }

  const handleOpenTerms = () => {
    router.push("/terms");
  };

  const handleOpenPrivacy = () => {
    router.push("/privacy");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] flex items-center justify-center px-5 py-10 text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {/* BASE */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#07111F] to-[#020617]" />

        {/* GRID */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,255,170,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.08) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }}
          />
        </div>

        {/* LEFT CIRCLE */}
        <div className="absolute left-[-260px] top-[5%] w-[700px] h-[700px] rounded-full border border-emerald-500/20" />

        {/* RIGHT CIRCLE */}
        <div className="absolute right-[-320px] bottom-[-120px] w-[700px] h-[700px] rounded-full border border-emerald-500/20" />

        {/* GLOW */}
        <div className="absolute top-[-250px] left-[-200px] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute bottom-[-250px] right-[-200px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        {/* PARTICLES */}
        <div className="absolute top-[12%] left-[18%] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_18px_#00ff99]" />
        <div className="absolute top-[28%] right-[22%] w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_18px_#00ff99]" />
        <div className="absolute bottom-[18%] left-[12%] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_18px_#00ff99]" />
        <div className="absolute bottom-[24%] right-[14%] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_18px_#00ff99]" />
      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-[620px]">
        {/* OUTER GLOW */}
        <div className="absolute inset-0 rounded-[42px] bg-emerald-500/10 blur-[40px]" />

        {/* MAIN CARD */}
        <div className="relative overflow-hidden rounded-[38px] border border-emerald-500/20 bg-[#08111D]/92 backdrop-blur-2xl px-8 md:px-10 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
          {/* INNER LIGHT */}
          <div className="absolute top-0 left-0 w-full h-[220px] bg-gradient-to-b from-emerald-500/10 to-transparent" />

          {/* TOP GLOW */}
          <div className="absolute top-[-100px] right-[-100px] w-[240px] h-[240px] rounded-full bg-emerald-500/10 blur-[120px]" />

          {/* CONTENT */}
          <div className="relative z-10">
            {/* BACK BUTTON */}
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4 transition text-[14px]"
            >
              <ArrowLeft size={18} />
              Kembali ke Login
            </button>

            {/* LOGO */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-[28px] bg-emerald-500 blur-[35px] opacity-40" />
                <div className="relative w-[90px] h-[90px] rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center border border-emerald-300/20 shadow-[0_0_60px_rgba(16,185,129,0.35)]">
                  <Wallet size={42} className="text-black" strokeWidth={2.8} />
                </div>
              </div>

              <h1 className="mt-8 text-[64px] font-black tracking-[-4px] leading-none">
                Daftar
                <span className="text-emerald-400"> Akun</span>
              </h1>

              <p className="text-slate-300 text-[17px] mt-4">
                Mulai kelola keuangan Anda
              </p>

              <p className="text-slate-500 text-[15px] mt-8 leading-relaxed max-w-[360px]">
                Buat akun baru untuk mengakses semua fitur CashFlow Journal.
              </p>
            </div>

            {(error || successMessage) && (
              <div
                className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
                  error
                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                    : "border-green-500/20 bg-green-500/10 text-green-400"
                }`}
              >
                {error || successMessage}
              </div>
            )}

            {/* FORM */}
            <div className="mt-10 space-y-5">
              {/* EMAIL */}
              <div className="group rounded-[22px] border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-6 h-[86px] flex items-center gap-5 transition-all duration-300 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.12)] backdrop-blur-sm">
                <div className="text-emerald-400">
                  <Mail size={28} />
                </div>

                <div className="flex-1">
                  <p className="text-white text-[14px] mb-1">Email</p>
                  <input
                    type="email"
                    placeholder="masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent outline-none w-full text-[18px] placeholder:text-slate-500 text-slate-300"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="group rounded-[22px] border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-6 h-[86px] flex items-center gap-5 transition-all duration-300 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.12)] backdrop-blur-sm">
                <div className="text-emerald-400">
                  <Lock size={28} />
                </div>

                <div className="flex-1">
                  <p className="text-white text-[14px] mb-1">Password</p>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent outline-none w-full text-[18px] placeholder:text-slate-500 text-slate-300"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-emerald-400 transition-all"
                >
                  {showPassword ? (
                    <EyeOff size={24} />
                  ) : (
                    <Eye size={24} />
                  )}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="group rounded-[22px] border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-6 h-[86px] flex items-center gap-5 transition-all duration-300 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.12)] backdrop-blur-sm">
                <div className="text-emerald-400">
                  <Lock size={28} />
                </div>

                <div className="flex-1">
                  <p className="text-white text-[14px] mb-1">Konfirmasi Password</p>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent outline-none w-full text-[18px] placeholder:text-slate-500 text-slate-300"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-emerald-400 transition-all"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={24} />
                  ) : (
                    <Eye size={24} />
                  )}
                </button>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="group mt-2 w-full h-[78px] rounded-[24px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-400 text-black text-[28px] font-black flex items-center justify-center gap-4 hover:brightness-110 hover:scale-[1.01] transition-all duration-300 shadow-[0_0_60px_rgba(16,185,129,0.25)] disabled:opacity-60"
              >
                {loading ? "Loading..." : "Daftar Sekarang"}
                <ArrowRight
                  size={32}
                  className="group-hover:translate-x-1 transition-all"
                />
              </button>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col items-center text-center mt-10">
              <div className="flex items-center gap-3 text-slate-400 mb-3">
                <ShieldCheck
                  size={20}
                  className="text-emerald-400"
                />
                <p className="text-[15px]">
                  Dengan mendaftar, Anda menyetujui
                </p>
              </div>

              <div className="flex items-center gap-4 text-emerald-400 text-[16px] mb-6">
                <button
                  onClick={handleOpenTerms}
                  className="hover:text-emerald-300 transition-all"
                >
                  Syarat & Ketentuan
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={handleOpenPrivacy}
                  className="hover:text-emerald-300 transition-all"
                >
                  Kebijakan Privasi
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[15px]">
                <p>Sudah punya akun?</p>
                <button
                  onClick={() => router.push("/login")}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-all"
                >
                  Masuk di sini
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
