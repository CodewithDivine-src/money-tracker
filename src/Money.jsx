import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import "./Money.css"

function Money() {
  const [transactions, setTransactions] = useState([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("Expense")

  // Edit states
  const [editingId, setEditingId] = useState(null)
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editType, setEditType] = useState("Expense")

  // Local Storage: Load saved transactions
  useEffect(() => {
    const savedTransaction = localStorage.getItem("transactions")
    if (savedTransaction) {
      setTransactions(JSON.parse(savedTransaction))
    }
  }, [])

  // Local Storage: Save transactions whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  function addTransaction() {
    if (description === "") return
    if (amount === "") return

    let finalAmount = Number(amount)
    if (type === "Expense") {
      finalAmount = -finalAmount
    }

    const newTransaction = {
      id: Date.now(),
      description: description,
      amount: finalAmount,
      type: type
    }

    setTransactions([...transactions, newTransaction])
    setDescription("")
    setAmount("")
  }

  function deleteTransaction(id) {
    const updatedTransactions = transactions.filter(t => t.id !== id)
    setTransactions(updatedTransactions)
  }

  // Calculations
  let balance = 0
  let income = 0
  let expenses = 0

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    balance = balance + t.amount

    if (t.type === "Income") {
      income = income + t.amount
    } else if (t.type === "Expense") {
      expenses = expenses + t.amount
    }
  }

  const expenseTotal = Math.abs(expenses)

  const chartData = [
    { name: "Income", amount: income },
    { name: "Expenses", amount: expenseTotal }
  ]

  // Edit functions
  function startEdit(transaction) {
    setEditingId(transaction.id)
    setEditDescription(transaction.description)
    setEditAmount(Math.abs(transaction.amount))
    setEditType(transaction.type)
  }

  function saveEdit() {
    let finalAmount = Number(editAmount)
    if (editType === "Expense") {
      finalAmount = -finalAmount
    }

    const updatedArray = transactions.map(t =>
      t.id === editingId
        ? { ...t, description: editDescription, amount: finalAmount, type: editType }
        : t
    )

    setTransactions(updatedArray)
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      {/* Totals */}
      <div className="totals">
        <h3>Balance: ${balance}</h3>
        <h3>Income: ${income}</h3>
        <h3>Expenses: ${expenseTotal}</h3>
      </div>

      {/* Form */}
      <div className="form-row">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>
        <button onClick={addTransaction}>Add</button>
      </div>

      {/* Chart */}
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction list */}
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.id === editingId ? (
              // Edit mode
              <div className="edit-form">
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Amount"
                />
                <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              // Normal mode
              <>
                <span>{transaction.description}</span>
                <span>
                  {transaction.type === "Expense"
                    ? `-$${Math.abs(transaction.amount)}`
                    : `$${transaction.amount}`}
                </span>
                <div>
                  <button onClick={() => startEdit(transaction)}>Edit</button>
                  <button onClick={() => deleteTransaction(transaction.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Money