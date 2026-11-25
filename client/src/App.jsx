import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Users, UserPlus, Search, Pencil, Trash2, X, Building2, Mail, Phone, TrendingUp } from "lucide-react";

const api = axios.create({ baseURL: "http://localhost:5000/api" });
const emptyForm = { name: "", email: "", phone: "", company: "", status: "Lead" };

function App() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCustomers(term = search) {
    try {
      setLoading(true);
      const { data } = await api.get("/customers", { params: { search: term } });
      setCustomers(data);
      setError("");
    } catch {
      setError("Could not load customers. Check that the Express server and PostgreSQL are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCustomers(""); }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = useMemo(() => ({
    total: customers.length,
    leads: customers.filter(c => c.status === "Lead").length,
    contacted: customers.filter(c => c.status === "Contacted").length,
    customers: customers.filter(c => c.status === "Customer").length
  }), [customers]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name, email: customer.email, phone: customer.phone || "",
      company: customer.company || "", status: customer.status
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      if (editingId) await api.put(`/customers/${editingId}`, form);
      else await api.post("/customers", form);
      closeForm();
      await loadCustomers(search);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save customer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${customer.id}`);
      await loadCustomers(search);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete customer.");
    }
  }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Skipto<span className="brand-light"> CRM</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><Users size={18} /> Customers</div>
        <div className="sidebar-note">Simple customer management for growing teams.</div>
        <div className="sidebar-bottom"><div className="avatar">U</div><div><strong>Workspace</strong><small>Admin account</small></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div><span className="eyebrow">WORKSPACE / CRM</span><h1>Customers</h1></div><button className="primary-btn" onClick={openAdd}><UserPlus size={17}/> Add customer</button></header>

        <section className="welcome-row"><div><h2>Customer overview</h2><p>Manage your contacts, leads and customer relationships.</p></div><div className="date-label"><TrendingUp size={16}/> Live overview</div></section>

        <section className="stats-grid">
          <StatCard label="Total contacts" value={stats.total} icon={<Users />} tone="blue"/>
          <StatCard label="New leads" value={stats.leads} icon={<UserPlus />} tone="purple"/>
          <StatCard label="Contacted" value={stats.contacted} icon={<Phone />} tone="orange"/>
          <StatCard label="Customers" value={stats.customers} icon={<TrendingUp />} tone="green"/>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h2>All customers</h2><p>A list of everyone in your CRM workspace.</p></div><span className="count-pill">{customers.length} records</span></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or company..." /></div></div>
          {error && <div className="error-banner">{error}</div>}
          <div className="table-wrap">
            <table><thead><tr><th>CONTACT</th><th>COMPANY</th><th>PHONE</th><th>STATUS</th><th className="actions-heading">ACTIONS</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="empty-state">Loading customers...</td></tr> :
                 customers.length === 0 ? <tr><td colSpan="5" className="empty-state">No customers found. Add your first customer to get started.</td></tr> :
                 customers.map(customer => <tr key={customer.id}>
                   <td><div className="contact-cell"><div className="contact-avatar">{customer.name.charAt(0).toUpperCase()}</div><div><strong>{customer.name}</strong><small><Mail size={12}/>{customer.email}</small></div></div></td>
                   <td><span className="company-cell"><Building2 size={14}/>{customer.company || "—"}</span></td>
                   <td>{customer.phone || "—"}</td>
                   <td><span className={`status status-${customer.status.toLowerCase()}`}>{customer.status}</span></td>
                   <td><div className="action-buttons"><button aria-label="Edit customer" onClick={() => openEdit(customer)}><Pencil size={16}/></button><button aria-label="Delete customer" onClick={() => handleDelete(customer)}><Trash2 size={16}/></button></div></td>
                 </tr>)}
              </tbody>
            </table>
          </div>
        </section>
        <footer>Mini CRM <span>•</span> Customer relationship management</footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeForm(); }}>
        <div className="modal">
          <div className="modal-header"><div><h2>{editingId ? "Edit customer" : "Add customer"}</h2><p>{editingId ? "Update this contact's information." : "Add a new contact to your CRM."}</p></div><button className="icon-btn" onClick={closeForm}><X size={19}/></button></div>
          <form onSubmit={handleSubmit}>
            <label>Full name<input name="name" value={form.name} onChange={updateField} placeholder="e.g. Alex Morgan" required maxLength="120"/></label>
            <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} placeholder="alex@company.com" required maxLength="160"/></label>
            <div className="form-two"><label>Phone<input name="phone" value={form.phone} onChange={updateField} placeholder="+91 98765 43210"/></label><label>Company<input name="company" value={form.company} onChange={updateField} placeholder="Company name"/></label></div>
            <label>Status<select name="status" value={form.status} onChange={updateField}><option>Lead</option><option>Contacted</option><option>Customer</option></select></label>
            {error && <div className="error-banner">{error}</div>}
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={closeForm}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Create customer"}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return <div className="stat-card"><div><span>{label}</span><strong>{value}</strong></div><div className={`stat-icon ${tone}`}>{icon}</div></div>;
}

export default App;
