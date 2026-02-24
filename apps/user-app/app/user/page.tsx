'use client'

import { useState } from "react"
import { FiPlus, FiArrowUpRight, FiArrowDownLeft, FiChevronDown, FiExternalLink } from "react-icons/fi"
import { BsCreditCard2Front } from "react-icons/bs"

const cards = [
  { id: 1, balance: "5,400.55", last4: "4558", color: "from-blue-600 to-blue-400" },
  { id: 2, balance: "23,400.55", last4: "3225", color: "from-zinc-600 to-zinc-400" },
]

const barData = [
  { day: "23", h: 20 }, { day: "23", h: 30 }, { day: "23", h: 25 },
  { day: "24", h: 15 }, { day: "25", h: 40 }, { day: "25", h: 35 },
  { day: "26", h: 20 }, { day: "27", h: 45 }, { day: "28", h: 55 },
  { day: "29", h: 60 }, { day: "30", h: 70 }, { day: "31", h: 80 },
]

const transactions = [
  { id: 1, name: "Starbucks", category: "Shopping", amount: -120.00, date: "31 Mar 2025", icon: "shopping" },
  { id: 2, name: "Design Studio", category: "Salary", amount: 5000.00, date: "30 Mar 2025", icon: "salary" },
]

export default function UserHome() {
  const [selectedCard, setSelectedCard] = useState(0)
  const active = cards[selectedCard]!

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 overflow-y-auto h-[calc(100vh-57px)]">
      {/* Greeting Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-semibold text-sm">Dashboard</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 text-sm">Hello Matt, welcome back.</span>
        </div>
        <span className="text-zinc-500 text-sm hidden sm:block">
          {new Date().toLocaleString("en-US", {
            hour: "2-digit", minute: "2-digit", day: "2-digit", month: "long", year: "numeric"
          })}
        </span>
      </div>

      {/* Top Row: Cards + Balance */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* My Cards */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-white font-semibold text-lg mb-5">My cards</h2>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {/* Add Card */}
            <button className="shrink-0 w-[120px] h-[150px] rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition">
              <FiPlus className="w-7 h-7" />
            </button>

            {/* Card List */}
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(i)}
                className={`shrink-0 w-[200px] h-[150px] rounded-xl bg-linear-to-br ${card.color} p-5 flex flex-col justify-between text-white transition-all ${
                  selectedCard === i
                    ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-black scale-[1.03]"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <span className="text-xs font-bold tracking-widest">VISA</span>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xl font-bold">${card.balance}</span>
                  <span className="text-[10px] tracking-[0.2em] opacity-70">
                    **** **** **** {card.last4}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedCard(i)}
                className={`w-2 h-2 rounded-full transition ${
                  selectedCard === i ? "bg-blue-400" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Balance</h2>
            <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition">
              Last month <FiChevronDown className="w-3 h-3" />
            </button>
          </div>

          <p className="text-4xl font-bold text-emerald-400 mb-1">
            ${active.balance}
          </p>
          <p className="text-[11px] text-zinc-500 tracking-[0.2em] mb-6">
            **** **** **** {active.last4}
          </p>

          <div className="flex gap-6 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <FiArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Income</p>
                <p className="text-sm font-semibold text-emerald-400">+ $6,320.15</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                <FiArrowUpRight className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Expense</p>
                <p className="text-sm font-semibold text-red-400">- $919.60</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Monthly Summary + Latest Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Monthly Summary */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-lg">Monthly summary</h2>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition">
              Generate report
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Income / Expense cards */}
            <div className="flex flex-col gap-3 min-w-[140px]">
              <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3">
                <p className="text-[11px] text-zinc-500 mb-1">Income</p>
                <p className="text-lg font-bold text-emerald-400">+ $5000.00</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3">
                <p className="text-[11px] text-zinc-500 mb-1">Expense</p>
                <p className="text-lg font-bold text-red-400">- $234.55</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-end gap-[6px] h-[100px]">
                {barData.map((bar, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm min-w-[8px] transition-all ${
                      bar.h > 60 ? "bg-emerald-500" : "bg-zinc-600"
                    }`}
                    style={{ height: `${bar.h}%` }}
                  />
                ))}
              </div>
              <div className="flex gap-[6px] mt-2">
                {barData.map((bar, i) => (
                  <span key={i} className="flex-1 text-center text-[9px] text-zinc-600 min-w-[8px]">
                    {bar.day}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-zinc-600 mt-2">23 - 31 Mar. 2025</p>
            </div>
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-lg">Latest transaction</h2>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition">
              Check all
            </button>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-700/60 flex items-center justify-center">
                  <BsCreditCard2Front className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.name}</p>
                  <p className="text-xs text-blue-400">{tx.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-emerald-400" : "text-white"}`}>
                    {tx.amount > 0 ? "+" : "-"} ${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-zinc-500">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-3 transition">
              New transaction
            </button>
            <button className="flex-1 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-medium py-3 transition">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
