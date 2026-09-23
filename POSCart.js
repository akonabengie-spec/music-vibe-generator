'use client';
import { useState } from 'react';

export default function POSCart({ inventoryList, onCheckoutSuccess }) {
  const [cart, setCart] = useState([]);
  const [cashReceived, setCashReceived] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      alert("This item is currently out of stock!"); return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        alert("Cannot add more units than what is physically available in stock!"); return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const cartGST = cartSubtotal * 0.10; // PNG 10% GST
  const cartTotal = cartSubtotal + cartGST;
  const changeDue = cashReceived ? Number(cashReceived) - cartTotal : 0;

  const handleProcessSale = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (Number(cashReceived) < cartTotal) {
      alert("Insufficient cash provided to cover transaction total!"); return;
    }

    setCheckoutMessage(`🧾 Sale successful! Change Due: K${changeDue.toFixed(2)}. Updating cloud registers...`);
    
    // Simulate updating stock counts locally
    setTimeout(() => {
      setCart([]);
      setCashReceived('');
      setCheckoutMessage('');
      onCheckoutSuccess(); // Refresh main lists
    }, 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl mt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-emerald-400 mb-4">[Point-of-Sale Front Counter Register]</h2>
      
      {/* Quick Click Item Add Grid */}
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Tap Stock Item to Scan</p>
      <div className="flex flex-wrap gap-2 mb-4 max-h-[120px] overflow-y-auto p-1">
        {inventoryList.map(product => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className="p-2 bg-slate-950 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-slate-800 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-95"
          >
            ➕ {product.product_name} (K{Number(product.price).toFixed(2)})
          </button>
        ))}
        {inventoryList.length === 0 && <p className="text-xs text-slate-600 font-mono italic">[Directory Empty - Log items below first]</p>}
      </div>

      {/* Transaction Cart Contents */}
      <div className="border-t border-slate-800/80 pt-3">
        {cart.length > 0 ? (
          <div className="space-y-2 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg text-xs">
                <span className="font-bold text-slate-300 truncate w-1/2">{item.product_name} <span className="text-slate-500 font-normal">x{item.quantity}</span></span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-cyan-400">K{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 font-bold px-1 cursor-pointer">✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-600 text-xs font-mono italic">[Shopping Cart Blank]</div>
        )}
      </div>

      {/* Accounting Totals & Till Drawer Integration */}
      {cart.length > 0 && (
        <form onSubmit={handleProcessSale} className="border-t border-slate-800/80 pt-3 space-y-3">
          <div className="space-y-1 font-mono text-xs text-slate-400">
            <div className="flex justify-between"><span>Subtotal:</span><span>K{cartSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>PNG GST (10%):</span><span>K{cartGST.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-200 font-bold text-sm pt-1 border-t border-dashed border-slate-800">
              <span>Total Bill Amount:</span><span className="text-emerald-400">K{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Cash Tendered (Kina)</label>
              <input
                type="number"
                step="0.01"
                required
                value={cashReceived}
                onChange={e => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Change Due</label>
              <div className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-cyan-400 h-9 flex items-center">
                K{changeDue > 0 ? changeDue.toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md">
            🧾 Issue Receipt & Print Invoice
          </button>
        </form>
      )}

      {checkoutMessage && (
        <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl text-center font-semibold animate-pulse">
          {checkoutMessage}
        </div>
      )}
    </div>
  );
}
