"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../supabase";
import { Navigation } from "../components/Navigation";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  PieChart,
} from "lucide-react";

import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Transaction = {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  created_at: string;
};

export default function LaporanPage() {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [userName, setUserName] =
    useState("User");

  const [rangeStart, setRangeStart] =
    useState("");
  const [rangeEnd, setRangeEnd] =
    useState("");
  const [activeRange, setActiveRange] =
    useState({
      start: "",
      end: "",
    });

  const rangeStartRef = useRef<HTMLInputElement | null>(null);
  const rangeEndRef = useRef<HTMLInputElement | null>(null);

  const formatDateLabel = (val: string) => {
    if (!val) return "Pilih tanggal";
    try {
      const d = new Date(`${val}T00:00:00`);
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Pilih tanggal";
    }
  };

  // =========================
  // SESSION
  // =========================

  async function initializePage() {
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

    // PROFILE

    const { data: profile } =
      await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile?.full_name) {
      setUserName(
        profile.full_name
      );
    }

    fetchTransactions(user.id);
  }

  // =========================
  // FETCH
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
  // INIT
  // =========================

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initializePage();

    const channel = supabase
      .channel("laporan-live")
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
  /* eslint-enable react-hooks/exhaustive-deps */

  // =========================
  // SUMMARY
  // =========================

  const totalIncome = useMemo(() => {
    return transactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [transactions]);

  const balance =
    totalIncome - totalExpense;

  // =========================
  // CURRENT MONTH DATA
  // =========================

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(
      (item) => {
        const itemDate = new Date(
          item.created_at
        );
        return (
          itemDate.getMonth() ===
            currentMonth &&
          itemDate.getFullYear() ===
            currentYear
        );
      }
    );
  }, [transactions, currentMonth, currentYear]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [currentMonthTransactions]);

  const currentMonthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [currentMonthTransactions]);

  const currentMonthBalance =
    currentMonthIncome - currentMonthExpense;

  const filteredTransactions = useMemo(
    () => {
      if (!activeRange.start && !activeRange.end) {
        return transactions;
      }

      const startDate = activeRange.start
        ? new Date(
            `${activeRange.start}T00:00:00`
          )
        : null;
      const endDate = activeRange.end
        ? new Date(
            `${activeRange.end}T23:59:59`
          )
        : null;

      return transactions.filter((item) => {
        const itemDate = new Date(
          item.created_at
        );

        if (
          startDate &&
          itemDate < startDate
        ) {
          return false;
        }

        if (
          endDate &&
          itemDate > endDate
        ) {
          return false;
        }

        return true;
      });
    },
    [transactions, activeRange]
  );

  const previousMonthDate = useMemo(
    () =>
      new Date(
        currentYear,
        currentMonth - 1,
        1
      ),
    [currentYear, currentMonth]
  );

  const previousMonthTransactions = useMemo(
    () => {
      return transactions.filter((item) => {
        const itemDate = new Date(
          item.created_at
        );
        return (
          itemDate.getMonth() ===
            previousMonthDate.getMonth() &&
          itemDate.getFullYear() ===
            previousMonthDate.getFullYear()
        );
      });
    },
    [transactions, previousMonthDate]
  );

  const previousMonthIncome = useMemo(() => {
    return previousMonthTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [previousMonthTransactions]);

  const previousMonthExpense = useMemo(() => {
    return previousMonthTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [previousMonthTransactions]);

  const incomeGrowth =
    previousMonthIncome === 0
      ? 0
      : Math.round(
          ((currentMonthIncome -
            previousMonthIncome) /
            previousMonthIncome) *
            100
        );

  const expenseGrowth =
    previousMonthExpense === 0
      ? 0
      : Math.round(
          ((currentMonthExpense -
            previousMonthExpense) /
            previousMonthExpense) *
            100
        );

  const currentMonthLabel = currentDate.toLocaleDateString(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    }
  );

  const previousMonthLabel = previousMonthDate.toLocaleDateString(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    }
  );

  const formatGrowth = (value: number) => {
    if (value === 0) {
      return "0%";
    }

    return `${value > 0 ? "+" : ""}${value}%`;
  };

  const rangeLabel = useMemo(() => {
    if (activeRange.start && activeRange.end) {
      return `${new Date(
        `${activeRange.start}T00:00:00`
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} – ${new Date(
        `${activeRange.end}T23:59:59`
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`;
    }

    if (activeRange.start) {
      return `Dari ${new Date(
        `${activeRange.start}T00:00:00`
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`;
    }

    if (activeRange.end) {
      return `Sampai ${new Date(
        `${activeRange.end}T23:59:59`
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`;
    }

    return "Semua Periode";
  }, [activeRange]);

  const rangeTotalIncome = useMemo(() => {
    return filteredTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [filteredTransactions]);

  const rangeTotalExpense = useMemo(() => {
    return filteredTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (acc, item) =>
          acc + item.amount,
        0
      );
  }, [filteredTransactions]);

  const rangeBalance =
    rangeTotalIncome - rangeTotalExpense;

  const handleApplyRange = () => {
    if (
      rangeStart &&
      rangeEnd &&
      new Date(rangeStart) >
        new Date(rangeEnd)
    ) {
      alert(
        "Tanggal awal tidak boleh lebih besar dari tanggal akhir"
      );
      return;
    }

    setActiveRange({
      start: rangeStart,
      end: rangeEnd,
    });
  };

  const handleResetRange = () => {
    setRangeStart("");
    setRangeEnd("");
    setActiveRange({
      start: "",
      end: "",
    });
  };

  // =========================
  // MONTHLY TREND (6 MONTHS)
  // =========================

  const monthlyTrendData = useMemo(() => {
    const monthMap: {
      [key: string]: {
        month: string;
        income: number;
        expense: number;
        date: Date;
      };
    } = {};

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentYear,
        currentMonth - i,
        1
      );
      const monthKey = date
        .toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        })
        .replace(/\s/g, "-");

      monthMap[monthKey] = {
        month: date.toLocaleDateString(
          "id-ID",
          {
            month: "short",
            year: "numeric",
          }
        ),
        income: 0,
        expense: 0,
        date: date,
      };
    }

    // Aggregate transactions by month
    transactions.forEach((item) => {
      const itemDate = new Date(
        item.created_at
      );
      const monthKey = itemDate
        .toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        })
        .replace(/\s/g, "-");

      if (monthMap[monthKey]) {
        if (item.type === "income") {
          monthMap[monthKey].income +=
            item.amount;
        } else {
          monthMap[monthKey].expense +=
            item.amount;
        }
      }
    });

    return Object.values(monthMap).sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime()
    );
  }, [transactions, currentMonth, currentYear]);

  const rangeChartData = useMemo(() => {
    const dateFormatOptions: Intl.DateTimeFormatOptions =
      activeRange.start &&
      activeRange.end
        ? (() => {
            const start = new Date(
              `${activeRange.start}T00:00:00`
            );
            const end = new Date(
              `${activeRange.end}T23:59:59`
            );
            const diffDays = Math.ceil(
              (end.getTime() -
                start.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return diffDays > 45
              ? {
                  month: "short" as const,
                  year: "numeric" as const,
                }
              : {
                  day: "2-digit" as const,
                  month: "short" as const,
                };
          })()
        : {
            day: "2-digit" as const,
            month: "short" as const,
          };

    const dateMap: {
      [key: string]: {
        label: string;
        income: number;
        expense: number;
        date: Date;
      };
    } = {};

    filteredTransactions.forEach((item) => {
      const itemDate = new Date(
        item.created_at
      );
      const key = itemDate
        .toLocaleDateString("id-ID", dateFormatOptions)
        .replace(/\s/g, " ");
      const label = itemDate.toLocaleDateString(
        "id-ID",
        dateFormatOptions
      );

      if (!dateMap[key]) {
        dateMap[key] = {
          label,
          income: 0,
          expense: 0,
          date: itemDate,
        };
      }

      if (item.type === "income") {
        dateMap[key].income += item.amount;
      } else {
        dateMap[key].expense +=
          item.amount;
      }
    });

    return Object.values(dateMap).sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime()
    );
  }, [filteredTransactions, activeRange]);

  const chartData =
    activeRange.start || activeRange.end
      ? rangeChartData
      : monthlyTrendData;

  const chartDataForRecharts = chartData as Array<
    | { month: string; income: number; expense: number; date: Date }
    | { label: string; income: number; expense: number; date: Date }
  >;

  const chartXAxisKey =
    activeRange.start || activeRange.end
      ? "label"
      : "month";

  const chartTitle =
    activeRange.start || activeRange.end
      ? "Tren Periode Terpilih"
      : "Tren 6 Bulan";

  const chartSubtitle =
    activeRange.start || activeRange.end
      ? `Data ${rangeLabel}`
      : "Pemasukan vs Pengeluaran";

  // =========================
  // TOP CATEGORIES (CURRENT MONTH)
  // =========================

  const topCategories = useMemo(() => {
    const categoryMap: {
      [key: string]: number;
    } = {};

    currentMonthTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .forEach((item) => {
        categoryMap[item.category] =
          (categoryMap[
            item.category
          ] || 0) + item.amount;
      });

    return Object.entries(
      categoryMap
    )
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) =>
        b.value - a.value
      )
      .slice(0, 5);
  }, [currentMonthTransactions]);

  const COLORS = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];

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
  // EXPORT PDF
  // =========================

  function exportPDF() {
    const doc = new jsPDF();

    // =========================
    // HEADER
    // =========================

    doc.setFontSize(28);

    doc.setTextColor(
      16,
      185,
      129
    );

    doc.text(
      "CashFlow Journal",
      14,
      22
    );

    doc.setFontSize(12);

    doc.setTextColor(
      120,
      120,
      120
    );

    doc.text(
      "Laporan Keuangan User",
      14,
      32
    );

    // =========================
    // USER INFO
    // =========================

    doc.setFontSize(12);

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      `Nama User: ${userName}`,
      14,
      50
    );

    doc.text(
      `Tanggal Export: ${new Date().toLocaleDateString(
        "id-ID"
      )}`,
      14,
      60
    );

    doc.text(
      `Periode: ${rangeLabel}`,
      14,
      70
    );

    // =========================
    // SUMMARY CARD
    // =========================

    doc.setFillColor(
      248,
      250,
      252
    );

    doc.roundedRect(
      14,
      72,
      182,
      38,
      5,
      5,
      "F"
    );

    doc.setFontSize(12);

    doc.setTextColor(
      0,
      0,
      0
    );

    // TANPA EMOJI BIAR PDF AMAN

    doc.text(
      `Total Saldo : Rp ${formatRupiah(
        balance
      )}`,
      22,
      86
    );

    doc.text(
      `Pemasukan : Rp ${formatRupiah(
        totalIncome
      )}`,
      22,
      96
    );

    doc.text(
      `Pengeluaran : Rp ${formatRupiah(
        totalExpense
      )}`,
      22,
      106
    );

    // =========================
    // TABLE
    // =========================

    autoTable(doc, {
      startY: 125,

      head: [
        [
          "Tanggal",
          "Kategori",
          "Deskripsi",
          "Tipe",
          "Nominal",
        ],
      ],

      body: filteredTransactions.map(
        (item) => [
          new Date(
            item.created_at
          ).toLocaleDateString(
            "id-ID"
          ),

          item.category,

          item.description,

          item.type ===
          "income"
            ? "Pemasukan"
            : "Pengeluaran",

          `Rp ${formatRupiah(
            item.amount
          )}`,
        ]
      ),

      // =========================
      // STYLE
      // =========================

      styles: {
        fontSize: 10,

        cellPadding: 4,

        textColor: [
          0, 0, 0,
        ],

        lineColor: [
          225, 225, 225,
        ],

        lineWidth: 0.2,
      },

      // =========================
      // HEADER
      // =========================

      headStyles: {
        fillColor: [
          16, 185, 129,
        ],

        textColor: [
          255, 255, 255,
        ],

        fontStyle: "bold",
      },

      // =========================
      // BODY
      // =========================

      bodyStyles: {
        fillColor: [
          255, 255, 255,
        ],

        textColor: [
          0, 0, 0,
        ],
      },

      // =========================
      // ZEBRA ROW
      // =========================

      alternateRowStyles: {
        fillColor: [
          245, 245, 245,
        ],
      },

      // =========================
      // COLUMN
      // =========================

      columnStyles: {
        4: {
          halign: "right",
        },
      },
    });

    // =========================
    // FOOTER
    // =========================

    const pageHeight =
      doc.internal.pageSize.height;

    doc.setFontSize(10);

    doc.setTextColor(
      120,
      120,
      120
    );

    doc.text(
      "Generated by CashFlow Journal",
      14,
      pageHeight - 10
    );

    // =========================
    // SAVE
    // =========================

    doc.save(
      "laporan-keuangan.pdf"
    );
  }

  // =========================
  // SEND WHATSAPP
  // =========================

  async function sendWhatsApp() {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        alert(
          "User tidak ditemukan"
        );

        return;
      }

      // PROFILE

      const { data: profile } =
        await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

      if (
        !profile?.phone_number
      ) {
        alert(
          "Nomor WhatsApp belum tersedia"
        );

        return;
      }

      // MESSAGE

      const message =
        `Halo ${userName}

Laporan keuangan berhasil dibuat.

━━━━━━━━━━━━━━━
Total Saldo
Rp ${formatRupiah(balance)}

Pemasukan
Rp ${formatRupiah(totalIncome)}

Pengeluaran
Rp ${formatRupiah(totalExpense)}
━━━━━━━━━━━━━━━

Terima kasih telah menggunakan CashFlow Journal`;

      // SEND WA

      const response =
        await fetch(
          "/api/send-wa",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              phone:
                profile.phone_number,

              message,
            }),
          }
        );

      const result =
        await response.json();

      if (result.success) {
        alert(
          "WhatsApp berhasil dikirim 🚀"
        );
      } else {
        alert(
          "Gagal mengirim WhatsApp"
        );
      }
    } catch (error) {
      console.log(error);

      alert("Terjadi error");
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex overflow-hidden">

      {/* SIDEBAR */}

      <Navigation />

      {/* CONTENT */}

      <section className="flex-1 min-h-screen overflow-auto px-4 py-4 lg:px-8 lg:py-8 lg:ml-72">

        {/* HEADER */}

        <div className="flex flex-col gap-6 lg:flex-row items-start justify-between mb-6">

          <div>

            <h1 className="text-[50px] md:text-[64px] font-black tracking-[-2px] leading-none">
              Laporan Keuangan
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mt-4">
              <p className="text-zinc-500 text-[15px]">
                Ringkasan transaksi dan pengeluaran
              </p>
              <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-zinc-400">
                Periode: {currentMonthLabel}
              </span>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            <button
              onClick={exportPDF}
              className="h-12 px-5 rounded-2xl bg-emerald-500 text-black font-bold flex items-center gap-3 hover:opacity-90 transition-all"
            >

              <Download size={18} />

              Export PDF

            </button>

            <button
              onClick={
                sendWhatsApp
              }
              className="h-12 px-5 rounded-2xl bg-[#111111] border border-zinc-800 text-white font-bold flex items-center gap-3 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
            >

              📲 Kirim WhatsApp

            </button>

            <div className="h-12 px-5 rounded-2xl bg-[#0B0B0B] border border-zinc-800 flex items-center gap-3 text-sm">

              <Calendar size={15} />

              {new Date().toLocaleDateString(
                "id-ID"
              )}

            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <div className="flex items-center justify-between mb-6">

              <p className="text-zinc-500 text-sm">
                Total Saldo (Semua Waktu)
              </p>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">

                <Wallet size={18} />

              </div>

            </div>

            <h2 className="text-[44px] font-black tracking-[-1px] leading-none">
              Rp {formatRupiah(balance)}
            </h2>

          </div>

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <div className="flex items-center justify-between mb-6">

              <p className="text-zinc-500 text-sm">
                Pemasukan (Semua Waktu)
              </p>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">

                <TrendingUp size={18} />

              </div>

            </div>

            <h2 className="text-[44px] font-black tracking-[-1px] text-emerald-400 leading-none">
              Rp {formatRupiah(totalIncome)}
            </h2>

          </div>

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <div className="flex items-center justify-between mb-6">

              <p className="text-zinc-500 text-sm">
                Pengeluaran (Semua Waktu)
              </p>

              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">

                <TrendingDown size={18} />

              </div>

            </div>

            <h2 className="text-[44px] font-black tracking-[-1px] text-red-400 leading-none">
              Rp {formatRupiah(totalExpense)}
            </h2>

          </div>

        </div>

        {/* CURRENT MONTH STATS */}

        <div className="mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">

            <div>
              <h2 className="text-[38px] md:text-[42px] font-black tracking-[-2px] leading-none">
                Ringkasan Bulanan
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                Data bulan ini & perbandingan dengan bulan lalu
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-zinc-400">
              <span className="font-semibold text-white">Perbandingan:</span>
              {previousMonthLabel}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-[30px] p-6 min-h-[180px]">

              <p className="text-emerald-400 text-sm mb-3 font-medium">
                Saldo Bulan Ini
              </p>

              <h2 className="text-[38px] md:text-[44px] font-black tracking-[-1px] text-emerald-400 leading-none">
                Rp {formatRupiah(
                  currentMonthBalance
                )}
              </h2>

              <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
                Total masuk dan keluar bulan ini, dibandingkan dengan {previousMonthLabel}.
              </p>

            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-[30px] p-6 min-h-[180px]">

              <div className="flex items-center justify-between mb-3">
                <p className="text-blue-400 text-sm font-medium">
                  Pemasukan Bulan Ini
                </p>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                  {formatGrowth(incomeGrowth)}
                </span>
              </div>

              <h2 className="text-[38px] md:text-[44px] font-black tracking-[-1px] text-blue-400 leading-none">
                Rp {formatRupiah(
                  currentMonthIncome
                )}
              </h2>

              <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
                Dibandingkan bulan lalu: Rp {formatRupiah(previousMonthIncome)}
              </p>

            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-[30px] p-6 min-h-[180px]">

              <div className="flex items-center justify-between mb-3">
                <p className="text-red-400 text-sm font-medium">
                  Pengeluaran Bulan Ini
                </p>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">
                  {formatGrowth(expenseGrowth)}
                </span>
              </div>

              <h2 className="text-[38px] md:text-[44px] font-black tracking-[-1px] text-red-400 leading-none">
                Rp {formatRupiah(
                  currentMonthExpense
                )}
              </h2>

              <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
                Dibandingkan bulan lalu: Rp {formatRupiah(previousMonthExpense)}
              </p>

            </div>

          </div>

        </div>

        {/* CHARTS */}

        <div className="bg-[#09090C] border border-zinc-900 rounded-[34px] p-7 mb-6">

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] items-end">

            <div>
              <h3 className="text-[28px] font-bold tracking-[-1px] leading-none">
                Filter Periode
              </h3>
              <p className="text-zinc-500 text-sm mt-2">
                Cari data laporan berdasarkan rentang tanggal dan lihat chart bar untuk periode tersebut.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_180px_auto] gap-3 w-full max-w-[780px]">

              <label className="flex flex-col gap-2 text-sm text-zinc-400">
                Dari
                <div
                  className="relative"
                  onClick={() => {
                    if (rangeStartRef.current) {
                      ;(rangeStartRef.current as any).showPicker?.() || rangeStartRef.current.focus();
                    }
                  }}
                >
                  <Calendar
                    onClick={(e) => {
                      e.stopPropagation();
                      if (rangeStartRef.current) {
                        ;(rangeStartRef.current as any).showPicker?.() || rangeStartRef.current.focus();
                      }
                    }}
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 cursor-pointer"
                  />

                  <span className="absolute left-12 top-1/2 -translate-y-1/2 text-zinc-400 select-none pointer-events-none">
                    {formatDateLabel(rangeStart)}
                  </span>

                  <input
                    ref={rangeStartRef}
                    aria-label="Tanggal mulai"
                    type="date"
                    value={rangeStart}
                    onChange={(event) => setRangeStart(event.target.value)}
                    className="absolute inset-0 w-full rounded-2xl border border-zinc-800 bg-transparent px-12 py-3 outline-none opacity-0 cursor-pointer"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm text-zinc-400">
                Sampai
                <div
                  className="relative"
                  onClick={() => {
                    if (rangeEndRef.current) {
                      ;(rangeEndRef.current as any).showPicker?.() || rangeEndRef.current.focus();
                    }
                  }}
                >
                  <Calendar
                    onClick={(e) => {
                      e.stopPropagation();
                      if (rangeEndRef.current) {
                        ;(rangeEndRef.current as any).showPicker?.() || rangeEndRef.current.focus();
                      }
                    }}
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 cursor-pointer"
                  />

                  <span className="absolute left-12 top-1/2 -translate-y-1/2 text-zinc-400 select-none pointer-events-none">
                    {formatDateLabel(rangeEnd)}
                  </span>

                  <input
                    ref={rangeEndRef}
                    aria-label="Tanggal akhir"
                    type="date"
                    value={rangeEnd}
                    onChange={(event) => setRangeEnd(event.target.value)}
                    className="absolute inset-0 w-full rounded-2xl border border-zinc-800 bg-transparent px-12 py-3 outline-none opacity-0 cursor-pointer"
                  />
                </div>
              </label>

              <div className="flex items-end gap-3">
                <button
                  onClick={handleApplyRange}
                  className="h-12 rounded-2xl bg-emerald-500 px-5 text-black font-bold hover:opacity-90 transition-all"
                >
                  Cari
                </button>
                <button
                  onClick={handleResetRange}
                  className="h-12 rounded-2xl border border-zinc-800 bg-[#111111] px-5 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
                >
                  Reset
                </button>
              </div>

            </div>

          </div>

          {activeRange.start || activeRange.end ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              <div className="rounded-[30px] border border-zinc-900 bg-[#050505] p-5">
                <p className="text-zinc-500 text-sm">
                  Total Pemasukan
                </p>
                <h3 className="text-[28px] font-black text-emerald-400">
                  Rp {formatRupiah(rangeTotalIncome)}
                </h3>
              </div>

              <div className="rounded-[30px] border border-zinc-900 bg-[#050505] p-5">
                <p className="text-zinc-500 text-sm">
                  Total Pengeluaran
                </p>
                <h3 className="text-[28px] font-black text-red-400">
                  Rp {formatRupiah(rangeTotalExpense)}
                </h3>
              </div>

              <div className="rounded-[30px] border border-zinc-900 bg-[#050505] p-5">
                <p className="text-zinc-500 text-sm">
                  Saldo Periode
                </p>
                <h3 className="text-[28px] font-black text-white">
                  Rp {formatRupiah(rangeBalance)}
                </h3>
              </div>

            </div>
          ) : null}

          <div className="mt-6 rounded-[30px] border border-zinc-900 bg-[#050505] p-5 text-sm text-zinc-400">
            Export PDF akan menggunakan rentang tanggal: <span className="text-white">{rangeLabel}</span>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* MONTHLY TREND CHART */}

          <div className="lg:col-span-2 bg-[#09090C] border border-zinc-900 rounded-[34px] p-7">

            <div className="mb-6">

              <h3 className="text-[28px] font-bold tracking-[-1px] leading-none">
                {chartTitle}
              </h3>

              <p className="text-zinc-500 text-sm mt-2">
                {chartSubtitle}
              </p>

            </div>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={chartDataForRecharts}
                margin={{
                  top: 5,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                />

                <XAxis
                  dataKey={chartXAxisKey}
                  tick={{
                    fill: "#a1a1aa",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke:
                      "#27272a",
                  }}
                />

                <YAxis
                  tick={{
                    fill: "#a1a1aa",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke:
                      "#27272a",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "#18181b",
                    border: "1px solid #27272a",
                    borderRadius:
                      "12px",
                    padding:
                      "8px 12px",
                  }}
                  labelStyle={{
                    color: "#fff",
                  }}
                  formatter={(value) => `Rp ${formatRupiah(
                    Number(value)
                  )}`}
                />

                <Legend
                  wrapperStyle={{
                    paddingTop:
                      "20px",
                  }}
                  iconType="circle"
                />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pemasukan"
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pengeluaran"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* TOP CATEGORIES PIE CHART */}

          <div className="bg-[#09090C] border border-zinc-900 rounded-[34px] p-7">

            <div className="mb-6">

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-zinc-950/70 p-3 text-emerald-400">
                  <PieChart size={18} />
                </div>
                <div>
                  <h3 className="text-[28px] font-bold tracking-[-1px] leading-none">
                    Kategori Terbesar
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    Pengeluaran bulan ini
                  </p>
                </div>
              </div>

            </div>

            {topCategories.length >
            0 ? (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <RechartsPieChart>

                  <Pie
                    data={topCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({
                      name,
                      value,
                    }) =>
                      `${name}: Rp ${formatRupiah(
                        value
                      )}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >

                    {topCategories.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#18181b",
                      border: "1px solid #27272a",
                      borderRadius:
                        "12px",
                    }}
                    labelStyle={{
                      color: "#fff",
                    }}
                    formatter={(value) => `Rp ${formatRupiah(
                      Number(value)
                    )}`}
                  />

                </RechartsPieChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-[300px] flex items-center justify-center text-zinc-500">

                Tidak ada pengeluaran
                bulan ini

              </div>

            )}

          </div>

        </div>

        <div className="bg-[#09090C] border border-zinc-900 rounded-[34px] p-7">

          <div className="mb-8">

            <h2 className="text-[42px] font-black tracking-[-2px] leading-none">
              Riwayat Transaksi ({rangeLabel})
            </h2>

            <p className="text-zinc-500 mt-3 text-[15px]">
              Semua data transaksi
              keuangan user
            </p>

          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-900">

            <table className="w-full min-w-[720px] text-sm">

              <thead className="bg-black sticky top-0 z-10">

                <tr className="border-b border-zinc-900">

                  <th className="px-6 py-5 text-left text-zinc-500 text-sm font-medium">
                    Tanggal
                  </th>

                  <th className="px-6 py-5 text-left text-zinc-500 text-sm font-medium">
                    Kategori
                  </th>

                  <th className="px-6 py-5 text-left text-zinc-500 text-sm font-medium">
                    Deskripsi
                  </th>

                  <th className="px-6 py-5 text-left text-zinc-500 text-sm font-medium">
                    Tipe
                  </th>

                  <th className="px-6 py-5 text-right text-zinc-500 text-sm font-medium">
                    Nominal
                  </th>

                </tr>

              </thead>

              <tbody>

                {transactions.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-b border-zinc-900 hover:bg-black/40 transition-all"
                    >

                      <td className="px-6 py-5 text-sm">

                        {new Date(
                          item.created_at
                        ).toLocaleDateString(
                          "id-ID"
                        )}

                      </td>

                      <td className="px-6 py-5 font-medium">
                        {item.category}
                      </td>

                      <td className="px-6 py-5 text-zinc-400">
                        {
                          item.description
                        }
                      </td>

                      <td className="px-6 py-5">

                        <div
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            item.type ===
                            "income"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >

                          {item.type ===
                          "income"
                            ? "Pemasukan"
                            : "Pengeluaran"}

                        </div>

                      </td>

                      <td
                        className={`px-6 py-5 text-right font-bold ${
                          item.type ===
                          "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >

                        {item.type ===
                        "income"
                          ? "+"
                          : "-"}
                        Rp{" "}
                        {formatRupiah(
                          item.amount
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </main>
  );
}