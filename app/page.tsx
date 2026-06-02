"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "./supabase";
import { Navigation } from "./components/Navigation";

import {
  Home,
  ReceiptText,
  FileText,
  Settings,
  Bell,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Receipt,
  Gamepad2,
  LogOut,
} from "lucide-react";

type Transaction = {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [userName, setUserName] =
    useState("User");

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    initializeDashboard();

    const channel = supabase
      .channel("dashboard-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        async () => {
          const {
            data: { user },
          } =
            await supabase.auth.getUser();

          if (user) {
            fetchTransactions(
              user.id
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =========================
  // CHECK USER
  // =========================

  async function initializeDashboard() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const fullName =
      user.user_metadata
        ?.full_name;

    if (fullName) {
      setUserName(fullName);
    } else if (user.email) {
      setUserName(user.email.split("@")[0]);
    }

    const { data: profile } = await supabase
      .from("profile")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.full_name) {
      setUserName(profile.full_name);
    }

    fetchTransactions(user.id);
  }

  // =========================
  // FETCH DATA
  // =========================

  async function fetchTransactions(
    userId: string
  ) {
    const { data, error } =
      await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

    if (!error && data) {
      setTransactions(data);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
  }

  // =========================
  // FORMAT
  // =========================

  function formatRupiah(
    value: number
  ) {
    return new Intl.NumberFormat(
      "id-ID"
    ).format(value);
  }

  // =========================
  // SUMMARY
  // =========================

  const income = useMemo(() => {
    return transactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (acc, item) =>
          acc + Number(item.amount),
        0
      );
  }, [transactions]);

  const expense = useMemo(() => {
    return transactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (acc, item) =>
          acc + Number(item.amount),
        0
      );
  }, [transactions]);

  const balance = income - expense;

  // =========================
  // CATEGORY
  // =========================

  const categoryData = useMemo(() => {
    const expenseData =
      transactions.filter(
        (item) =>
          item.type === "expense"
      );

    const grouped: Record<
      string,
      number
    > = {};

    expenseData.forEach((item) => {
      if (
        !grouped[item.category]
      ) {
        grouped[item.category] = 0;
      }

      grouped[item.category] +=
        Number(item.amount);
    });

    const colors = [
      "#3B82F6",
      "#22C55E",
      "#F59E0B",
      "#A855F7",
      "#EF4444",
    ];

    const icons = [
      <UtensilsCrossed size={15} />,
      <Car size={15} />,
      <ShoppingCart size={15} />,
      <Receipt size={15} />,
      <Gamepad2 size={15} />,
    ];

    return Object.entries(grouped).map(
      ([name, total], index) => ({
        name,
        total,
        color:
          colors[
            index %
              colors.length
          ],
        icon:
          icons[
            index %
              icons.length
          ],
        percent:
          expense > 0
            ? Math.round(
                (total /
                  expense) *
                  100
              )
            : 0,
      })
    );
  }, [transactions, expense]);

  // =========================
  // DONUT
  // =========================

  const donutChart =
    categoryData.length > 0
      ? `conic-gradient(${categoryData
          .map((item, index) => {
            const previous =
              categoryData
                .slice(0, index)
                .reduce(
                  (acc, curr) =>
                    acc +
                    curr.percent,
                  0
                );

            return `${item.color} ${previous}% ${
              previous +
              item.percent
            }%`;
          })
          .join(", ")})`
      : "#27272a";

  return (
    <main className="w-full min-h-screen bg-[#050505] text-white flex">

      {/* SIDEBAR */}

      <Navigation />

      {/* CONTENT */}

      <section className="flex-1 min-h-0 min-w-0 overflow-auto pt-24 lg:pt-8 px-4 pb-6 lg:px-8 lg:py-8 lg:ml-72">

        {/* HEADER */}

        <div className="flex flex-col gap-6 lg:flex-row items-start justify-between mb-6">

          <div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[56px] font-black tracking-[-2px] leading-tight max-w-3xl">
              Halo, {userName} 👋
            </h1>

            <p className="text-zinc-500 text-[15px] mt-4">
              Kelola keuanganmu dengan
              lebih bijak
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="h-12 px-5 rounded-2xl bg-[#0B0B0B] border border-zinc-800 flex items-center gap-3 text-sm">

              <Calendar size={15} />

              {new Date().toLocaleDateString(
                "id-ID"
              )}

            </div>

            <button className="w-12 h-12 rounded-2xl bg-[#0B0B0B] border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 transition-all">

              <Bell size={16} />

            </button>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <div className="flex items-center justify-between mb-6">

              <p className="text-zinc-500 text-sm">
                Total Saldo
              </p>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">

                <Wallet size={18} />

              </div>

            </div>

            <h2 className="text-2xl md:text-[32px] lg:text-[36px] xl:text-[40px] font-black tracking-[-1px] leading-tight">
              Rp {formatRupiah(balance)}
            </h2>

          </div>

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <div className="flex items-center justify-between mb-6">

              <p className="text-zinc-500 text-sm">
                Pemasukan
              </p>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">

                <TrendingUp size={18} />

              </div>

            </div>

            <h2 className="text-2xl md:text-[32px] lg:text-[36px] xl:text-[40px] font-black tracking-[-1px] text-emerald-400 leading-tight">
              Rp {formatRupiah(income)}
            </h2>

          </div>

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <div className="flex items-center justify-between mb-6">

              <p className="text-zinc-500 text-sm">
                Pengeluaran
              </p>

              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">

                <TrendingDown size={18} />

              </div>

            </div>

            <h2 className="text-2xl md:text-[32px] lg:text-[36px] xl:text-[40px] font-black tracking-[-1px] text-red-400 leading-tight">
              Rp {formatRupiah(expense)}
            </h2>

          </div>

        </div>

        {/* ANALYTICS */}

<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 min-h-[320px] lg:min-h-[380px]">

          {/* LEFT */}

          <div className="bg-[#09090C] border border-zinc-900 rounded-[34px] p-7 flex flex-col overflow-hidden">

            <div className="flex items-start justify-between mb-8">

              <div>

<h2 className="text-2xl md:text-[34px] lg:text-[38px] font-black tracking-[-2px] leading-tight">
                  Analisa Pengeluaran
                </h2>

                <p className="text-zinc-500 mt-3 text-[15px]">
                  Distribusi pengeluaran bulan ini
                </p>

              </div>

            </div>

<div className="flex-1 grid grid-cols-1 xl:grid-cols-[270px_1fr] gap-8 items-center overflow-hidden">

              {/* DONUT */}

              <div className="flex justify-center">

                <div
                  className="w-[150px] h-[150px] rounded-full relative mx-auto xl:mx-0"
                  style={{
                    background:
                      donutChart,
                  }}
                >

                  <div className="absolute inset-[28px] rounded-full bg-[#09090C] flex flex-col items-center justify-center">

                    <p className="text-zinc-500 text-sm">
                      Total
                    </p>

                    <h3 className="text-[20px] font-black leading-tight text-center mt-2">
                      Rp {formatRupiah(expense)}
                    </h3>

                  </div>

                </div>

              </div>

              {/* CATEGORY */}

              <div className="space-y-4 overflow-auto pr-1">

                {categoryData.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="bg-black border border-zinc-900 rounded-[26px] px-5 py-4 hover:border-zinc-700 transition-all"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-4">

                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              background:
                                item.color,
                            }}
                          />

                          <div>

                            <h3 className="font-semibold text-[17px]">
                              {item.name}
                            </h3>

                            <p className="text-zinc-500 text-sm mt-1">
                              Rp {formatRupiah(item.total)}
                            </p>

                          </div>

                        </div>

                        <p className="font-semibold text-[15px]">
                          {item.percent}%
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="bg-[#09090C] border border-zinc-900 rounded-[34px] p-6 flex flex-col overflow-hidden">

            <div className="mb-8">

              <h2 className="text-2xl md:text-[30px] lg:text-[34px] font-black tracking-[-2px] leading-tight">
                Kategori
              </h2>

              <p className="text-zinc-500 text-[15px] mt-3">
                Pengeluaran kategori utama
              </p>

            </div>

            <div className="space-y-7 overflow-auto pr-1">

              {categoryData.map(
                (item, index) => (

                  <div key={index}>

                    <div className="flex items-center justify-between mb-3">

                      <div className="flex items-center gap-4">

                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `${item.color}15`,
                            color:
                              item.color,
                          }}
                        >

                          {item.icon}

                        </div>

                        <h3 className="font-semibold text-[17px]">
                          {item.name}
                        </h3>

                      </div>

                      <div className="text-right">

                        <h3 className="font-bold text-[17px]">
                          Rp {formatRupiah(item.total)}
                        </h3>

                        <p className="text-zinc-500 text-sm mt-1">
                          {item.percent}%
                        </p>

                      </div>

                    </div>

                    <div className="w-full h-[7px] bg-zinc-900 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percent}%`,
                          background:
                            item.color,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}