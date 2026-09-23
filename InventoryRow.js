'use client';
export default function InventoryRow({ item, onDelete }) {
  const priceNum = Number(item.price) || 0;
  const qty = Number(item.stock_quantity) || 0;
  const gstAmount = priceNum * qty * 0.10; // PNG 10% GST
  const totalWithGST = (priceNum * qty) + gstAmount;

  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700">
      <div className="truncate w-full sm:w-1/3">
        <p className="text-sm font-bold text-slate-200 truncate">{item.product_name}</p>
        <div className="flex gap-2 items-center mt-1">
          <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 uppercase">{item.category}</span>
          {qty <= 5 && <span className="text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded animate-pulse">Low Stock</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-right items-center w-full sm:w-2/3 justify-end">
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Unit Cost</p>
          <p className="text-xs font-mono font-bold text-cyan-400 mt-0.5">K{priceNum.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Total + GST</p>
          <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">K{totalWithGST.toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Stock Qty</p>
            <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">{qty} <span className="text-[9px] text-slate-500 font-normal">pcs</span></p>
          </div>
          <button onClick={() => onDelete(item.id)} className="p-2 bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-500/20 rounded-lg text-xs cursor-pointer transition-all">🗑️</button>
        </div>
      </div>
    </div>
  );
}
