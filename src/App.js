import React, { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const [editId, setEditId] = useState(null);

  // ✅ Chart Data
  const chartData = dashboard
    ? {
        labels: ["Income", "Expense"],
        datasets: [
          {
            label: "Amount",
            data: [dashboard.totalIncome, dashboard.totalExpense],
            backgroundColor: ["#22c55e", "#ef4444"],
          },
        ],
      }
    : null;

  // ✅ LOGIN
  const handleLogin = async () => {
    const res = await fetch(
      "https://finance-backend-quav.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();
    setToken(data.token);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps

const fetchDashboard = useCallback(async () => {
  const res = await fetch(
    "https://finance-backend-quav.onrender.com/api/dashboard/summary",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  setDashboard(data);
}, [token]);

 const fetchRecords = useCallback(async () => {
  const res = await fetch(
    "https://finance-backend-quav.onrender.com/api/records",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  setRecords(data);
}, [token]);

useEffect(() => {
  if (token) {
    fetchDashboard();
    fetchRecords();
  }
}, [token, fetchDashboard, fetchRecords]);

  // ✅ ADD RECORD
  const handleAddRecord = async () => {
    await fetch(
      "https://finance-backend-quav.onrender.com/api/records",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          type,
          category,
          notes,
        }),
      }
    );

    fetchRecords();
    fetchDashboard();

    setAmount("");
    setCategory("");
    setNotes("");
    setType("income");
  };

  // ✅ DELETE RECORD
  const handleDelete = async (id) => {
    await fetch(
      `https://finance-backend-quav.onrender.com/api/records/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchRecords();
    fetchDashboard();
  };

  // ✅ UPDATE RECORD
  const handleUpdate = async () => {
    await fetch(
      `https://finance-backend-quav.onrender.com/api/records/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          type,
          category,
          notes,
        }),
      }
    );

    setEditId(null);

    fetchRecords();
    fetchDashboard();

    setAmount("");
    setCategory("");
    setNotes("");
    setType("income");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {!token ? (
        // 🔐 LOGIN UI
        <div className="bg-white p-8 rounded-xl shadow-md w-80">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-2 border rounded mb-4"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-blue-500 text-white py-2 rounded"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      ) : (
        // 🟢 DASHBOARD
        <div className="w-full max-w-4xl p-6">
          {/* Logout */}
          <button
            className="bg-red-500 text-white px-4 py-2 rounded float-right mb-4"
            onClick={() => setToken("")}
          >
            Logout
          </button>

          <h1 className="text-3xl font-bold mb-6 text-center">
            Finance Dashboard
          </h1>

          {/* Dashboard Summary */}
          {dashboard && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500 text-white p-4 rounded">
                ₹{dashboard.totalIncome}
              </div>
              <div className="bg-red-500 text-white p-4 rounded">
                ₹{dashboard.totalExpense}
              </div>
              <div className="bg-blue-500 text-white p-4 rounded">
                ₹{dashboard.netBalance}
              </div>
            </div>
          )}

          {/* 📊 Chart */}
          {chartData && (
            <div className="bg-white p-4 rounded mb-6">
              <Bar data={chartData} />
            </div>
          )}

          {/* ➕ Add / Update */}
          <div className="bg-white p-4 rounded">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="border p-2 mr-2"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-2 mr-2"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="border p-2 mr-2"
            />

            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              className="border p-2 mr-2"
            />

            <button
              className="bg-green-500 text-white px-4 py-2"
              onClick={editId ? handleUpdate : handleAddRecord}
            >
              {editId ? "Update" : "Add"}
            </button>
          </div>

          {/* 📋 Records */}
          <div className="bg-white p-4 rounded mt-4">
            {records.map((r) => (
              <div key={r._id} className="flex justify-between border-b py-2">
                <span>{r.category}</span>
                <span>₹{r.amount}</span>

                <div>
                  <button
                    className="text-blue-500 mr-2"
                    onClick={() => {
                      setEditId(r._id);
                      setAmount(r.amount);
                      setType(r.type);
                      setCategory(r.category);
                      setNotes(r.notes);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(r._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;