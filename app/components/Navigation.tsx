"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "🏠" },
    { href: "/transaksi", label: "Transaksi", icon: "💰" },
    { href: "/laporan", label: "Laporan", icon: "📊" },
    { href: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 min-h-screen border-r border-zinc-800 bg-zinc-950 p-6 hidden lg:flex flex-col justify-between fixed left-0 top-0">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition">
            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center font-black text-black text-xl">
              $
            </div>

            <div>
              <h1 className="text-2xl font-black leading-none">CashFlow</h1>
              <p className="text-green-400 font-semibold">Journal</p>
            </div>
          </Link>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full rounded-2xl px-5 py-4 text-left font-semibold transition ${
                    pathname === item.href
                      ? "bg-green-500/20 border border-green-500/30 text-green-400"
                      : "hover:bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <p className="font-bold text-lg">Ahmad Ramadhan</p>
          <p className="text-zinc-500 text-sm mt-1">Premium User 👑</p>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-zinc-950 border-b border-zinc-800 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center font-bold text-black">
              $
            </div>
            <div>
              <p className="text-lg font-black">CashFlow</p>
              <p className="text-green-400 text-xs font-semibold">Journal</p>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-zinc-900 rounded-lg transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <nav className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition ${
                    pathname === item.href
                      ? "bg-green-500/20 text-green-400"
                      : "hover:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* MOBILE PADDING */}
      <div className="lg:hidden h-20" />
    </>
  );
}
