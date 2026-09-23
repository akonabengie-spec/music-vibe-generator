'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import InventoryRow from './InventoryRow'; 

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [status, setStatus] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inventoryList, setInventoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetMargin, setTargetMargin] = useState(30);

  // 🛡️ Safe Live Style Injection: Waits for the browser window to exist before loading styles
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('tailwind-live-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-live-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://jsdelivr.net';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null); if (session?.user) fetchInventory();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null); if (session?.user) fetchInventory(); else setInventoryList([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault(); setStatus('Authenticating securely...');
    try {
      const res = isSigningUp 
        ? await supabase.auth.signUp({ email, password }) 
        : await supabase.auth.signInWithPassword({ email, password });
      if (res.error) throw res.error;
      setStatus(isSigningUp ? 'Registration sent! Check email.' : 'Access granted.');
    } catch (err) { setStatus(`Error: ${err.message}`); }
  };

  // 🔒 FIX: Added a window environment block checker to prevent Vercel compilation crashes
  const fetchInventory = async () => {
    if (typeof window === 'undefined') return; // Aborts safe if pre-rendering on Vercel servers
    setLoading(true);
    try {
      const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
      if (error) throw error; setInventoryList(data || []);
    } catch (err) { console.error(err.message); } finally { setLoading(false); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault(); if (!productName || !category || !price || !quantity) return;
    setStatus('Logging item data package to cloud ledger...');
    try {
      const { error } = await supabase.from('inventory').insert([{
        product_name: productName, category: category, price: parseFloat(price), stock_quantity: parseInt(quantity), user_id: user.id
      }]);
      if (error) throw error;
      setStatus('Product saved successfully!');
      setProductName(''); setCategory(''); setPrice(''); setQuantity(''); fetchInventory();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) { setStatus(`Error: ${err.message}`); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error; setStatus('Product removed.'); fetchInventory();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) { setStatus(`Error: ${err.message}`); }
  };

  const totalItemsCount = inventoryList.reduce((sum, item) => sum + (item.stock_quantity || 0), 0);
  const coreCostValuation = inventoryList.reduce((sum, item) => sum + ((item.price || 0) * (item.stock_quantity || 0)), 0);
  const calculatedGSTTotal = coreCostValuation * 0.10;
  const totalValuationWithGST = coreCostValuation + calculatedGSTTotal;
  const marginMultiplier = 1 / (1 - (targetMargin / 100));
  const estimatedRevenueForecast = totalValuationWithGST * marginMultiplier;
  const projectGrossProfitValue = estimatedRevenueForecast - totalValuationWithGST;
  const filteredInventory = inventoryList.filter(item => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()));
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-[10px] bg-green-500 bg-opacity-10 text-green-400 font-mono font-bold px-2 py-1 rounded border border-green-500 border-opacity-20 uppercase tracking-widest">Enterprise Core v3.0</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-green-400 mb-2 mt-2">ZEE STOCK CORE</h1>
            <p className="text-gray-400 text-xs mt-2">{status || 'Enter secure store access credentials'}</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Franchise Admin Email" className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 text-sm font-medium focus:outline-none focus:border-green-500" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Security Key Password" className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 text-sm font-medium focus:outline-none focus:border-green-500" />
            <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-400 text-gray-900 font-extrabold rounded-xl text-sm transition-all transform active:scale-95 cursor-pointer">Unlock Retail Hub</button>
          </form>
          <button type="button" onClick={() => { setIsSigningUp(!isSigningUp); setStatus(''); }} className="w-full mt-4 text-xs text-center text-green-400 font-bold hover:underline">{isSigningUp ? 'Go to Admin Sign In' : 'Setup Client Enterprise Account Module'}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between mb-6 border-b border-gray-900 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-green-400">ZEE STOCK CORE</h1>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Advanced ERP System: <span className="text-green-400 lowercase">{user.email}</span></p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 border border-gray-800 hover:border-red-500 bg-gray-900 text-gray-400 text-xs font-bold rounded-xl transition-all cursor-pointer">🔒 Terminate Session</button>
      </div>

      {status && <div className="w-full max-w-6xl mb-4 p-2 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 text-green-400 text-xs text-center rounded-xl font-medium animate-pulse">{status}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl mb-6">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl"><span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider font-bold block">Total Stock Count</span><span className="text-2xl font-extrabold text-gray-200 block mt-1">{totalItemsCount} <span className="text-xs text-gray-600 font-normal">items</span></span></div>
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl"><span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider font-bold block">Base Stock Cost</span><span className="text-2xl font-extrabold text-gray-300 block mt-1">K{coreCostValuation.toFixed(2)}</span></div>
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl"><span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider font-bold block">PNG GST Accumulated (10%)</span><span className="text-2xl font-extrabold text-amber-500 block mt-1">K{calculatedGSTTotal.toFixed(2)}</span></div>
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl bg-gradient-to-br from-slate-900 to-cyan-950/20"><span className="text-[9px] font-mono text-green-400 uppercase tracking-wider font-bold block">Total Value (+ GST)</span><span className="text-2xl font-extrabold text-green-400 block mt-1">K{totalValuationWithGST.toFixed(2)}</span></div>
      </div>

      {/* Financial Projections Simulation Sandbox */}
      <div className="w-full max-w-6xl p-5 bg-gray-900 border border-gray-800 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-green-400">Profit Forecast Sandbox</h3>
          <p className="text-[11px] text-gray-500 mt-1">Slide markup targets to instantly predict total store gross profit realizations.</p>
          <div className="flex items-center gap-3 mt-3">
            <input type="range" min="10" max="70" value={targetMargin} onChange={e => setTargetMargin(Number(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg cursor-pointer accent-green-400" />
            <span className="text-xs font-mono font-bold bg-green-500 bg-opacity-10 text-green-400 px-2 py-0.5 border border-green-500 border-opacity-20 rounded">{targetMargin}%</span>
          </div>
        </div>
        <div className="md:col-span-1 p-3 bg-gray-950 border border-gray-800 rounded-lg flex flex-col justify-center">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Estimated Revenue Realization</span>
          <span className="text-xl font-extrabold text-gray-200 mt-1">K{estimatedRevenueForecast.toFixed(2)}</span>
        </div>
        <div className="md:col-span-1 p-3 bg-gray-950 border border-gray-800 rounded-lg flex flex-col justify-center border-l-2 border-green-500">
          <span className="text-[9px] font-mono text-green-400 uppercase tracking-wider font-bold">Projected Net Margin Return</span>
          <span className="text-xl font-extrabold text-green-400 mt-1">K{projectGrossProfitValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl items-start">
        <div className="lg:col-span-1 bg-gray-900 rounded-2xl p-5 border border-gray-800 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 font-mono text-green-400">[Log Ingestion]</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input type="text" required value={productName} onChange={e => setProductName(e.target.value)} placeholder="Item Name / Barcode Tag" className="w-full p-3 bg-slate-950 border border-gray-800 rounded-xl text-gray-200 text-xs font-medium focus:outline-none focus:border-green-400" />
            <input type="text" required value={category} onChange={e => setCategory(e.target.value)} placeholder="Category Segments" className="w-full p-3 bg-slate-950 border border-gray-800 rounded-xl text-gray-200 text-xs font-medium focus:outline-none focus:border-green-400" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (Kina)" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-gray-200 text-xs font-medium focus:outline-none focus:border-green-400" />
              <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-gray-200 text-xs font-medium focus:outline-none focus:border-green-400" />
            </div>
            <button type="submit" className="w-full py-3 bg-green-500 text-gray-900 font-extrabold rounded-xl text-xs uppercase tracking-wider mt-2 transition-all transform active:scale-95 cursor-pointer">📥 Add Item to Shelf</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gray-900 bg-opacity-60 rounded-2xl p-5 border border-gray-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-green-400">[Active Ledger Directory]</h2>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Filter inventory matrix item..." className="p-2 px-3 bg-gray-950 border border-slate-800 rounded-xl text-gray-200 text-xs font-medium w-full sm:w-64 focus:outline-none focus:border-green-400" />
          </div>
          {loading ? <div className="text-center py-12 text-slate-500 text-xs font-mono animate-pulse">Syncing parameters...</div> : filteredInventory.length > 0 ? (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredInventory.map((item) => (
                <InventoryRow key={item.id} item={item} onDelete={handleDeleteProduct} />
              ))}
            </div>
          ) : <div className="text-center py-12 text-gray-600 text-xs font-mono border border-dashed border-gray-800 rounded-xl">[No Products Logged] Ready for data entry inputs.</div>}
        </div>
      </div>
    </main>
  );
}
