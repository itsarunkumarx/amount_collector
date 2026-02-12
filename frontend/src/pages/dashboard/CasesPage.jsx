import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Plus, Check, X, FileSpreadsheet, Trash2, Bell, Image } from 'lucide-react';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';

export default function CasesPage() {
    const { user } = useAuth();
    const [cases, setCases] = useState([]);
    const [workers, setWorkers] = useState([]); // New state for workers
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [selectedProofUrl, setSelectedProofUrl] = useState(null);

    const [formData, setFormData] = useState({
        borrower_email: '',
        borrower_name: '',
        borrower_phone: '',
        amount_lent: '',
        interest_rate: '',
        due_date: '',
        proof_documents: [],
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            const [casesRes, workersRes] = await Promise.all([
                api.get('/cases/'),
                api.get('/users/workers')
            ]);
            setCases(casesRes.data);
            setWorkers(workersRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace('/api/v1', '');
        return `${baseUrl}${url}`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cases/', {
                ...formData,
                amount_lent: parseFloat(formData.amount_lent),
                interest_rate: parseFloat(formData.interest_rate) || 0,
                due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
                proof_documents: formData.proof_documents
            });

            alert("Case submitted successfully!");
            setShowCreateModal(false);
            fetchData(); // Refresh all
            setFormData({ borrower_email: '', borrower_name: '', borrower_phone: '', amount_lent: '', interest_rate: '', assigned_worker_id: '', due_date: '', proof_documents: [], bank_name: '', account_number: '', ifsc_code: '' });
        } catch (err) {
            alert("Failed to create case: " + (err.response?.data?.detail || err.message));
        }
    };

    const verifyCase = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this case?`)) return;
        try {
            await api.put(`/cases/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert("Action failed");
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently remove this case?")) return;
        try {
            await api.delete(`/cases/${id}`);
            fetchData();
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleAlert = async (c) => {
        if (!window.confirm(`Send payment reminder to ${c.borrower_name} (${c.borrower_phone})?`)) return;
        try {
            await api.post(`/cases/${c.id}/alert`);
            alert(`Alert sent to ${c.borrower_phone}`);
        } catch (err) {
            alert("Alert failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { Name: "John Doe", Phone: "9876543210", Email: "john@example.com", Amount: 50000, Interest: 2.5, DueDate: "2024-12-31" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Case_Import_Template.xlsx");
    };

    const handleExcelImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("No data found in Excel file");
                    return;
                }

                let successCount = 0;
                let failCount = 0;
                let errors = [];

                for (const [index, row] of data.entries()) {
                    // Try to map commonly used keys if exact keys aren't found
                    const name = row.Name || row.name || row['Borrower Name'] || row.Borrower;
                    const phone = row.Phone || row.phone || row['Mobile'] || row['Phone Number'];
                    const amount = row.Amount || row.amount || row['Amount Lent'] || row['Loan Amount'];

                    if (!amount || !name) {
                        failCount++;
                        errors.push(`Row ${index + 2}: Missing Name or Amount`);
                        continue;
                    }

                    try {
                        await api.post('/cases/', {
                            borrower_name: name,
                            borrower_phone: String(phone || ""),
                            borrower_email: row.Email || row.email || "",
                            amount_lent: parseFloat(amount),
                            interest_rate: parseFloat(row.Interest || row.interest || 0),
                            due_date: row.DueDate ? new Date(row.DueDate).toISOString() : null,
                            proof_documents: []
                        });
                        successCount++;
                    } catch (err) {
                        console.error("Row failed:", row, err);
                        errors.push(`Row ${index + 2}: ${err.response?.data?.detail || err.message}`);
                        failCount++;
                    }
                }

                let msg = `Import Complete: ${successCount} imported, ${failCount} failed.`;
                if (errors.length > 0) msg += "\nErrors:\n" + errors.slice(0, 5).join("\n") + (errors.length > 5 ? "\n..." : "");
                alert(msg);
                fetchData();
            } catch (err) {
                console.error(err);
                alert("Failed to parse Excel file");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null; // Reset input
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif text-royal-gold">Case Management</h1>
                <div className="flex gap-2">
                    <label className="cursor-pointer bg-green-900/40 text-green-400 border border-green-500/20 px-4 py-2 rounded-lg flex items-center hover:bg-green-800/40 transition-colors">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Import Excel
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelImport} />
                    </label>
                    <button onClick={handleDownloadTemplate} className="text-xs text-royal-gold underline hover:text-white px-2">
                        Get Template
                    </button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Case
                    </Button>
                </div>
            </div>

            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-royal-800/50 text-royal-gold uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Borrower</th>
                            <th className="p-4">Assigned To</th>
                            <th className="p-4">Amount (Pending)</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-royal-gold/10">
                        {cases.map(c => (
                            <tr key={c.id} className="hover:bg-royal-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-royal-text">{c.borrower_name}</div>
                                    <div className="text-xs text-royal-muted">{c.borrower_email}</div>
                                </td>
                                <td className="p-4 text-sm text-royal-text">
                                    {c.assigned_worker_id ? (workers.find(w => w.id === c.assigned_worker_id)?.full_name || 'Worker') : <span className="text-royal-muted opacity-50">Unassigned</span>}
                                </td>
                                <td className="p-4 text-royal-text font-mono">
                                    <div className="font-bold">₹{c.amount_pending?.toLocaleString() ?? c.amount_lent.toLocaleString()}</div>
                                    <div className="text-xs text-royal-muted">Total: ₹{c.amount_lent.toLocaleString()}</div>
                                </td>
                                <td className="p-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        c.status === 'ACTIVE' ? "bg-green-900/40 text-green-400 border border-green-500/20" :
                                            c.status === 'PENDING_VERIFICATION' ? "bg-yellow-900/40 text-yellow-400 border border-yellow-500/20" :
                                                "bg-red-900/40 text-red-400 border border-red-500/20"
                                    )}>{c.status.replace('_', ' ')}</span>
                                </td>
                                <td className="p-4 text-sm text-royal-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="p-4 flex gap-2">
                                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && c.status === 'PENDING_VERIFICATION' && (
                                        <>
                                            <button onClick={() => verifyCase(c.id, 'ACTIVE')} className="p-1 rounded bg-green-900/50 text-green-400 hover:bg-green-800" title="Verify"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => verifyCase(c.id, 'REJECTED')} className="p-1 rounded bg-red-900/50 text-red-400 hover:bg-red-800" title="Reject"><X className="w-4 h-4" /></button>
                                        </>
                                    )}

                                    {/* Assign Button (Admin only if unassigned) */}
                                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && !c.assigned_worker_id && (
                                        <Button size="sm" variant="outline" onClick={() => { setSelectedCaseId(c.id); setShowAssignModal(true); }} className="text-xs h-7 px-2">
                                            Assign
                                        </Button>
                                    )}

                                    {/* Alert Button (Active cases) */}
                                    {c.status === 'ACTIVE' && (
                                        <button onClick={() => handleAlert(c)} className="p-1 rounded bg-yellow-900/50 text-yellow-400 hover:bg-yellow-800" title="Send Alert">
                                            <Bell className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Delete Button (Completed/Rejected or Admin) */}
                                    {(c.status === 'COMPLETED' || c.status === 'REJECTED' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                                        <button onClick={() => handleDelete(c.id)} className="p-1 rounded bg-red-900/50 text-red-400 hover:bg-red-800" title="Remove Case">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {/* View Proof Button */}
                                    {c.proof_documents && c.proof_documents.length > 0 && (
                                        <button onClick={() => setSelectedProofUrl(getFullImageUrl(c.proof_documents[0]))} className="p-1 rounded bg-blue-900/50 text-blue-400 hover:bg-blue-800" title="View Proof">
                                            <Image className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {cases.length === 0 && (
                            <tr><td colSpan="6" className="p-8 text-center text-royal-muted">No cases found in the royal usage records.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Create Case */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10">
                        <div className="glass p-8 rounded-xl w-full max-w-lg relative bg-royal-900/90 my-auto">
                            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-royal-muted hover:text-royal-text"><X /></button>
                            <h2 className="text-2xl font-serif text-royal-gold mb-6">Record New Money Given</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Borrower Name" value={formData.borrower_name} onChange={e => setFormData({ ...formData, borrower_name: e.target.value })} required />
                                    <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Borrower Phone" value={formData.borrower_phone} onChange={e => setFormData({ ...formData, borrower_phone: e.target.value })} required />
                                </div>
                                <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Borrower Email" type="email" value={formData.borrower_email} onChange={e => setFormData({ ...formData, borrower_email: e.target.value })} required />

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Amount (₹)" value={formData.amount_lent} onChange={e => setFormData({ ...formData, amount_lent: e.target.value })} required />
                                    <input type="number" className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Interest Rate (%)" value={formData.interest_rate} onChange={e => setFormData({ ...formData, interest_rate: e.target.value })} />
                                </div>

                                <div className="space-y-2 border-t border-royal-700/50 pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-royal-gold">Bank Details (Optional)</h4>
                                    <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Bank Name" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text" placeholder="Account Number" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} />
                                        <input className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text uppercase" placeholder="IFSC Code" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} />
                                    </div>
                                </div>

                                {/* Worker Assignment removed for Lenders */}

                                <div>
                                    <label className="block text-sm text-royal-muted mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text invert-calendar-icon"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-royal-muted mb-1">Proof Document (Image/PDF)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setUploading(true);
                                                const uploadData = new FormData();
                                                uploadData.append('file', file);
                                                try {
                                                    const res = await api.post('/utils/upload', uploadData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    });
                                                    setFormData(prev => ({ ...prev, proof_documents: [res.data.url] }));
                                                } catch (err) {
                                                    alert("Upload failed");
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                        />
                                        {uploading && <span className="text-royal-gold animate-pulse my-auto">Uploading...</span>}
                                        {formData.proof_documents.length > 0 && <span className="text-green-500 my-auto text-sm">Attached</span>}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full mt-4">Submit for Verification</Button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal for Assign Worker */}
            {
                showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="glass p-6 rounded-xl w-full max-w-md relative bg-royal-900">
                            <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-royal-muted hover:text-royal-text"><X className="w-4 h-4" /></button>
                            <h3 className="text-xl font-serif text-royal-gold mb-4">Assign Field Worker</h3>
                            <div className="space-y-4">
                                <select
                                    className="w-full p-3 bg-royal-900/50 border border-royal-700 rounded text-royal-text"
                                    value={selectedWorkerId}
                                    onChange={e => setSelectedWorkerId(e.target.value)}
                                >
                                    <option value="">Select a Worker...</option>
                                    {workers.map(w => (
                                        <option key={w.id} value={w.id}>{w.full_name}</option>
                                    ))}
                                </select>
                                <Button onClick={async () => {
                                    if (!selectedWorkerId) return;
                                    try {
                                        await api.put(`/cases/${selectedCaseId}/status`, { assigned_worker_id: selectedWorkerId });
                                        setShowAssignModal(false);
                                        fetchData();
                                    } catch (err) {
                                        alert("Assignment failed");
                                    }
                                }} className="w-full">
                                    Confirm Assignment
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal for Showing Proof Image */}
            {selectedProofUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setSelectedProofUrl(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] mx-4">
                        <button onClick={() => setSelectedProofUrl(null)} className="absolute -top-10 right-0 text-white hover:text-royal-gold"><X className="w-8 h-8" /></button>
                        <img src={selectedProofUrl} alt="Proof Document" className="max-w-full max-h-[85vh] rounded-lg border-2 border-royal-gold/50 shadow-2xl" />
                    </div>
                </div>
            )}
        </div >
    );
}
