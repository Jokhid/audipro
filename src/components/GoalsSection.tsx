import { TrendingUp, Info } from "lucide-react";
import { ClientData } from "../types";
import { formatCurrency } from "../audit-calculations";
import { Input, NumberInput, SelectInput } from "./FormInputs";

interface GoalRow {
  id: number;
  name: string;
  target: number;
  years: number;
  priority: "Alta" | "Media" | "Baja";
  aportacionLineal: number;
  aportacionFinanciera: number;
  viable: string;
  color: string;
}

interface GoalsSectionProps {
  formData: ClientData;
  draftGoal: { name: string; target: number; years: number; priority: "Alta" | "Media" | "Baja" };
  setDraftGoal: React.Dispatch<React.SetStateAction<{ name: string; target: number; years: number; priority: "Alta" | "Media" | "Baja" }>>;
  addGoal: () => void;
  removeGoal: (id: number) => void;
  goalRows: GoalRow[];
  savingsCapacity: { sinRentas: number };
  totalMonthlyGoalAhorro: number;
  totalMonthlyGoalLineal: number;
  globalGoalStatusDetail: { label: string; color: string };
}

export function GoalsSection({
  formData,
  draftGoal,
  setDraftGoal,
  addGoal,
  removeGoal,
  goalRows,
  savingsCapacity,
  totalMonthlyGoalAhorro,
  totalMonthlyGoalLineal,
  globalGoalStatusDetail,
}: GoalsSectionProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-[#C5A566]" />
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase">Objetivos y Proyectos de Capitalización</h2>
          <p className="text-xs text-slate-500">Planifica las metas financieras a medio y largo plazo del cliente y contrástalas contra su capacidad de ahorro real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px_160px_160px_auto] items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
        <Input label="Proyecto / Objetivo de Ahorro" value={draftGoal.name} onChange={v => setDraftGoal(prev => ({ ...prev, name: v }))} />
        <NumberInput label="Capital Necesario (€)" value={draftGoal.target} onChange={v => setDraftGoal(prev => ({ ...prev, target: v }))} />
        <NumberInput label="Plazo (Años)" value={draftGoal.years} onChange={v => setDraftGoal(prev => ({ ...prev, years: v }))} />
        <SelectInput 
          label="Prioridad" 
          value={draftGoal.priority} 
          options={["Alta", "Media", "Baja"]} 
          onChange={v => setDraftGoal(prev => ({ ...prev, priority: v as any }))} 
        />
        <button onClick={addGoal} className="w-full bg-[#C5A566] text-white px-5 py-2.5 rounded font-bold uppercase text-xs hover:bg-[#A8833F]">Añadir</button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider">
            <tr>
              <th className="px-4 py-3">Proyecto</th>
              <th className="px-4 py-3 text-right">Importe</th>
              <th className="px-4 py-3 text-center">Plazo</th>
              <th className="px-4 py-3 text-right">Aportación Lineal (Sin Rentabilidad)</th>
              <th className="px-4 py-3 text-right">Aportación Financiera (Con Rentabilidad)</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {goalRows.map(goal => (
              <tr key={goal.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{goal.name}</td>
                <td className="px-4 py-3 text-right font-bold">{formatCurrency(goal.target)}</td>
                <td className="px-4 py-3 text-center">{goal.years} años</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(goal.aportacionLineal)}/mes</td>
                <td className="px-4 py-3 text-right text-emerald-700 font-bold">{formatCurrency(goal.aportacionFinanciera)}/mes</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    goal.viable === "Viable" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-300 text-black font-semibold shadow-sm"
                  }`}>{goal.viable}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => removeGoal(goal.id)} className="text-red-500 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
        {/* Tarjeta 1: CAPACIDAD AHORRO REAL */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Capacidad Ahorro Real</p>
          <p className="mt-2 text-xl font-black text-slate-800">{formatCurrency(savingsCapacity.sinRentas)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Capacidad de ahorro fáctica calculada</p>
          {formData.conyugeConIngresos === "Si" && (
            <p className="text-[9px] text-emerald-700 font-bold mt-1">
              (Incluye {formatCurrency(formData.ingresosConyuge)}/mes de ingresos del cónyuge)
            </p>
          )}
        </div>

        {/* Tarjeta 2: ESFUERZO MENSUAL FINANCIERO */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Esfuerzo Mensual Financiero</p>
          <p className="mt-2 text-xl font-black text-[#C5A566]">{formatCurrency(totalMonthlyGoalAhorro)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Aportación financiera mensual requerida</p>
        </div>

        {/* Tarjeta 3: ESFUERZO MENSUAL LINEAL */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Esfuerzo Mensual Lineal</p>
          <p className="mt-2 text-xl font-black text-slate-700">{formatCurrency(totalMonthlyGoalLineal)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Aportación lineal requerida (sin rentabilidad)</p>
        </div>

        {/* Tarjeta 4: VIABLE, INVIABLE O AJUSTADO */}
        <div className={`rounded-xl border p-5 shadow-sm transition-all duration-300 text-center ${
          globalGoalStatusDetail.color === "green" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
          globalGoalStatusDetail.color === "yellow" ? "bg-amber-500 border-amber-600 text-white" :
          globalGoalStatusDetail.color === "red" ? "bg-red-50 border-red-200 text-red-900" :
          "bg-slate-50 border-slate-200 text-slate-900"
        }`}>
          <p className={`text-[10px] font-black uppercase tracking-wider ${
            globalGoalStatusDetail.color === "green" ? "text-emerald-600" :
            globalGoalStatusDetail.color === "yellow" ? "text-amber-100" :
            globalGoalStatusDetail.color === "red" ? "text-red-600" :
            "text-slate-400"
          }`}>Estado de viabilidad</p>
          <p className="mt-2 text-xl font-black">{globalGoalStatusDetail.label}</p>
          <p className="mt-1 text-[11px] opacity-85">
            {globalGoalStatusDetail.color === "green" ? "La capacidad de ahorro cubre holgadamente los objetivos." :
             globalGoalStatusDetail.color === "yellow" ? "Capacidad ajustada. Considere optimizar gastos." :
             globalGoalStatusDetail.color === "red" ? "Capacidad insuficiente para cubrir las metas planteadas." :
             "No se han añadido objetivos de ahorro."}
          </p>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-slate-500 bg-slate-50/80 rounded-lg p-3.5 border border-slate-150 flex items-start gap-2.5 shadow-sm">
        <Info className="h-4 w-4 text-[#C5A566] shrink-0 mt-0.5" />
        <div className="leading-relaxed text-left">
          <strong>Aclaración sobre el Tipo de Interés Aplicado:</strong> Para calcular la aportación mensual requerida en el <strong>Esfuerzo Mensual Financiero</strong>, capitalizamos los fondos según la prioridad del objetivo. Las metas con prioridad <strong className="text-red-600">Alta</strong> se capitalizan con el tipo de interés del plan de ahorro sistemático configurado (<strong>{formData.rentabilidadAhorroSistematico || 6}%</strong> anual compuesto). Los objetivos de prioridad <strong className="text-amber-600">Media</strong> o <strong className="text-slate-600">Baja</strong> aplican una tasa prudencial conservadora del <strong>2%</strong> anual compuesto, minimizando riesgos para plazos más cortos.
        </div>
      </div>
    </section>
  );
}
