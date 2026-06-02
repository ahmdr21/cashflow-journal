"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../supabase";
import { Navigation } from "../components/Navigation";
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from "../utils/helpers";

import {
  Search,
  Trash2,
  LogOut,
} from "lucide-react";

type Transaction = {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  created_at: string;
};

export default function TransaksiPage() {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [userName, setUserName] =
    useState("User");

  const [form, setForm] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
  });

  // =========================
  // CATEGORY
  // =========================

  const incomeCategories = [
    "Gaji",
    "Bonus",
    "Freelance",
    "Investasi",
    "Penjualan",
    "Hadiah",
  ];

  const expenseCategories = [
    "Makanan & Minuman",
    "Transportasi",
    "Belanja",
    "Tagihan",
    "Hiburan & Rekreasi",
    "Kesehatan",
    "Pendidikan",
    "Fashion",
    "Rumah Tangga",
    "Hobi & Gaya Hidup",
  ];

  const categories =
    form.type === "income"
      ? incomeCategories
      : expenseCategories;

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    initializePage();

    const channel = supabase
      .channel("transactions-live")
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
  // SESSION + USER
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

    setUserId(user.id);

    const fullName =
      user.user_metadata
        ?.full_name;

    if (fullName) {
      setUserName(fullName);
    }

    fetchTransactions(user.id);
  }

  // =========================
  // FETCH DATA
  // =========================

  async function fetchTransactions(
    uid: string
  ) {
    const { data, error } =
      await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", uid)
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
  // HANDLE AMOUNT
  // =========================

  function handleAmountChange(
    value: string
  ) {
    const rawValue = value.replace(/[^0-9,]/g, "");
    const formatted = formatCurrencyInput(rawValue);

    setForm({
      ...form,
      amount: formatted,
    });
  }

  // =========================
  // ADD
  // =========================

  async function handleAddTransaction() {
    if (
      !form.amount ||
      !form.category
    ) {
      alert(
        "Lengkapi data transaksi"
      );
      return;
    }

    const { error } =
      await supabase
        .from("transactions")
        .insert([
          {
            user_id: userId,

            category:
              form.category,

            description:
              form.description,

            amount: parseCurrencyInput(form.amount),

            type: form.type,
          },
        ]);

    if (!error) {
      setForm({
        type: "income",
        amount: "",
        category: "",
        description: "",
      });

      fetchTransactions(userId);
    }
  }

  // =========================
  // DELETE
  // =========================

  async function deleteTransaction(
    id: string
  ) {
    await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    setTransactions(
      transactions.filter(
        (item) => item.id !== id
      )
    );
  }

  // =========================
  // FILTER
  // =========================

  const filteredTransactions =
    transactions.filter(
      (item) =>
        item.category
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        item.description
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    );

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

  return (
    <main className="w-full min-h-screen bg-[#050505] text-white flex overflow-hidden">

      {/* SIDEBAR */}
      <Navigation />

      {/* CONTENT */}

      <section className="flex-1 min-h-screen overflow-auto px-4 py-4 lg:px-8 lg:py-8 lg:ml-72">

        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row items-start justify-between mb-6">

          <div>

            <h1 className="text-[52px] font-black leading-none">
              Transaksi
            </h1>

            <p className="text-zinc-500 text-sm mt-3">
              Kelola pemasukan dan
              pengeluaran keuangan
            </p>

          </div>

          <div className="flex items-center gap-2 bg-[#0B0B0B] border border-zinc-800 rounded-2xl px-4 h-12 w-[260px]">

            <Search
              size={16}
              className="text-zinc-500"
            />

            <input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="bg-transparent outline-none text-sm w-full placeholder:text-zinc-600"
            />

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <p className="text-zinc-500 text-sm mb-5">
              Total Saldo
            </p>

            <h2 className="text-[38px] font-black leading-none">
              Rp {formatRupiah(balance)}
            </h2>

          </div>

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <p className="text-zinc-500 text-sm mb-5">
              Pemasukan
            </p>

            <h2 className="text-[38px] font-black text-emerald-400 leading-none">
              Rp {formatRupiah(totalIncome)}
            </h2>

          </div>

          <div className="bg-[#09090C] border border-zinc-900 rounded-[30px] p-7">

            <p className="text-zinc-500 text-sm mb-5">
              Pengeluaran
            </p>

            <h2 className="text-[38px] font-black text-red-400 leading-none">
              Rp {formatRupiah(totalExpense)}
            </h2>

          </div>

        </div>

        {/* FORM */}

        <div className="bg-[#09090C] border border-zinc-900 rounded-[32px] p-6 mb-6">

          <h2 className="text-[28px] font-black mb-6">
            Tambah Transaksi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                  category: "",
                })
              }
              className="h-14 rounded-2xl bg-black border border-zinc-800 px-4 outline-none"
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>

            <input
              type="text"
              placeholder="Nominal"
              value={form.amount ? `Rp ${form.amount}` : ""}
              onChange={(e) =>
                handleAmountChange(e.target.value)
              }
              className="h-14 rounded-2xl bg-black border border-zinc-800 px-4 outline-none"
            />

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
              className="h-14 rounded-2xl bg-black border border-zinc-800 px-4 outline-none"
            >

              <option value="">
                Pilih kategori
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

            <input
              type="text"
              placeholder="Keterangan transaksi"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              className="h-14 rounded-2xl bg-black border border-zinc-800 px-4 outline-none"
            />

          </div>

          <button
            onClick={
              handleAddTransaction
            }
            className="mt-5 h-12 px-6 rounded-2xl bg-emerald-500 text-black font-bold hover:opacity-90 transition-all"
          >
            Simpan Transaksi
          </button>

        </div>

        {/* LIST */}

        <div className="bg-[#09090C] border border-zinc-900 rounded-[32px] p-6">

          <h2 className="text-[28px] font-black mb-6">
            Riwayat Transaksi
          </h2>

          <div className="space-y-4">

            {filteredTransactions.map(
              (item) => (

                <div
                  key={item.id}
                  className="bg-black border border-zinc-800 rounded-3xl px-5 py-5 flex items-center justify-between"
                >

                  <div>

                    <h3 className="font-semibold text-[18px]">
                      {item.category}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-1">
                      {
                        item.description
                      }
                    </p>

                    <p className="text-zinc-600 text-xs mt-2">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>

                  </div>

                  <div className="flex items-center gap-5">

                    <h3
                      className={`text-[28px] font-black ${
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
                    </h3>

                    <button
              onClick={() => deleteTransaction(item.id)}
                    >

                      <Trash2
                        size={17}
                      />

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </main>
  );
}