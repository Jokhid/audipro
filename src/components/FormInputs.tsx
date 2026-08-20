import { ReactNode, useContext } from "react";
import { VerificationContext } from "./VerificationContext";

export function Title({ icon, text }: { icon: ReactNode; text: string }) { 
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
      {icon}
      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{text}</h2>
    </div>
  ); 
}

export function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { 
  const isPending = value === "" || value === "No indicado";
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
        <span>{label}</span>
        <span className={`text-[9px] px-1 rounded font-bold ${isPending ? "bg-yellow-300 text-black font-semibold" : "bg-emerald-100 text-emerald-700"}`}>
          {isPending ? "Pendiente" : "Verificado"}
        </span>
      </span>
      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#C5A566] focus:ring-1 focus:ring-[#C5A566]" value={value} onChange={e=>onChange(e.target.value)}/>
    </label>
  ); 
}

export function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { 
  const { verifiedZeros, toggleVerifiedZero, clearVerifiedZero } = useContext(VerificationContext);
  const isVerifiedZero = verifiedZeros[label] || false;
  const isPending = value === 0 && !isVerifiedZero;

  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isVerifiedZero) {
      toggleVerifiedZero(label);
    }
    onChange(0);
  };

  const handleSiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isVerifiedZero) {
      clearVerifiedZero(label);
    }
  };

  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
        <span className="mr-1">{label}</span>
        <span className="flex items-center gap-1.5 flex-shrink-0">
          {/* Small NO / PND toggle when value is 0 */}
          {value === 0 && (
            <div className="flex rounded overflow-hidden border border-slate-200 text-[8px] font-bold bg-white">
              <button
                type="button"
                onClick={handleSiClick}
                className={`px-1.5 py-0.5 transition ${!isVerifiedZero ? 'bg-yellow-300 text-black font-semibold' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                title="Pendiente de rellenar"
              >
                PND
              </button>
              <button
                type="button"
                onClick={handleNoClick}
                className={`px-1.5 py-0.5 transition ${isVerifiedZero ? 'bg-emerald-600 text-white font-black' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                title="No tiene / NO"
              >
                NO
              </button>
            </div>
          )}
          <span className={`text-[9px] px-1 rounded font-bold ${isPending ? "bg-yellow-300 text-black font-semibold" : "bg-emerald-100 text-emerald-700"}`}>
            {isPending ? "Pendiente" : "Verificado"}
          </span>
        </span>
      </span>
      <input 
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#C5A566] focus:ring-1 focus:ring-[#C5A566]" 
        type="number" 
        value={value} 
        onChange={e => {
          const val = Number(e.target.value);
          onChange(val);
          if (val > 0) {
            clearVerifiedZero(label);
          }
        }}
      />
    </label>
  ); 
}

export function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { 
  const isPending = value === "Pendiente" || value === "desconocido" || value === "No indicado";
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
        <span>{label}</span>
        <span className={`text-[9px] px-1 rounded font-bold ${isPending ? "bg-yellow-300 text-black font-semibold" : "bg-emerald-100 text-emerald-700"}`}>
          {isPending ? "Pendiente" : "Verificado"}
        </span>
      </span>
      <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#C5A566] focus:ring-1 focus:ring-[#C5A566]" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(option=><option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  ); 
}

export function Metric({ label, value }: { label: string; value: string }) { 
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1.5 text-md font-black text-slate-800">{value}</p>
    </div>
  ); 
}
