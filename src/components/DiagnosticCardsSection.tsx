import { ReactNode } from "react";
import { BarChart3, Info } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ClientData } from "../types";
import { formatCurrency, formatPercent } from "../audit-calculations";

interface DiagnosticCardsSectionProps {
  scores: {
    baja: number;
    familia: number;
    fondo: number;
    deuda: number;
    jubilacion: number;
    inflacion: number;
    legal: number;
  };
  renderThermometer: (score: number) => ReactNode;
  formData: ClientData;
  temporaryDisability: any;
  familyNeed: any;
  survivorBenefits: any;
  liquidity: any;
  debt: any;
  centralScenario: any;
  retirementGap: any;
  metrics: any;
  expenses: { total: number };
  excessProjectionData: any[];
}

export function DiagnosticCardsSection({
  scores,
  renderThermometer,
  formData,
  temporaryDisability,
  familyNeed,
  survivorBenefits,
  liquidity,
  debt,
  centralScenario,
  retirementGap,
  metrics,
  expenses,
  excessProjectionData,
}: DiagnosticCardsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-[#C5A566]" />
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Lectura Profesional del Diagnóstico</h2>
          <p className="text-xs text-slate-500">Evaluación exhaustiva de los 7 pilares patrimoniales y de protección familiar</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tarjeta 1: Protección de Ingresos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">1. Protección de Ingresos (Baja laboral)</h3>
              <p className="text-xs text-slate-500">Incapacidad Temporal en contingencias comunes</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.baja >= 8 ? "bg-emerald-50 text-emerald-700" : scores.baja >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.baja}/10</span>
          </div>
          {renderThermometer(scores.baja)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-400 block font-medium">Prestación 60% / 75%</span>
              <strong className="text-slate-800">{formatCurrency(temporaryDisability.tramo60Monto)} / {formatCurrency(temporaryDisability.tramo75Monto)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Impacto Económico</span>
              <strong className="text-red-600">Déficit inicial de {formatCurrency(temporaryDisability.tramo60Brecha)}/mes</strong>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> {formData.regimenSeguridadSocial === "RETA (Autónomos)" 
              ? "Cobertura suficiente solo en el tramo del 75%. Se recomienda subsidio privado de baja laboral para complementar los primeros 20 días." 
              : "Bajo el Régimen General, las bajas por enfermedad están cubiertas mediante pago delegado por la empresa, por lo que no es de aplicación necesaria un subsidio privado de baja laboral."}
          </p>
          <div className="mt-1.5 text-[11px] text-slate-800 bg-yellow-100/60 p-2.5 border-l-2 border-yellow-500 rounded-r leading-relaxed">
            <strong>¿Por qué se sugiere esto?</strong> {formData.regimenSeguridadSocial === "RETA (Autónomos)" 
              ? `Durante los primeros 3 días de baja por enfermedad común, el trabajador no percibe subsidio público. Del día 4 al 20, la Seguridad Social solo cubre el 60% de la base reguladora (un déficit de ${formatCurrency(temporaryDisability.tramo60Brecha)}/mes frente a tus gastos fijos de ${formatCurrency(expenses.total)}/mes). El seguro de subsidio privado cubre esta brecha crítica inicial para evitar tener que recurrir a tus ahorros de emergencia durante convalecencias.`
              : `En el Régimen General, las contingencias comunes e incapacidad temporal están cubiertas mayormente por el empleador y el sistema público de cotización delegada, haciendo innecesaria la contratación de un complemento de subsidio privado ordinario.`}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-red-500 font-bold uppercase">Alta</strong></span>
            <span>Origen: SS España</span>
          </div>
        </div>

        {/* Tarjeta 2: Protección Familiar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">2. Protección Familiar (Decesos)</h3>
              <p className="text-xs text-slate-500">
                {familyNeed.hasNoDependents ? "No aplica (sin cargas familiares)" : "Escenario conjunto de viudedad y orfandad"}
              </p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.familia >= 8 ? "bg-emerald-50 text-emerald-700" : scores.familia >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.familia}/10</span>
          </div>
          {renderThermometer(scores.familia)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-400 block font-medium">Pensión Familiar Conjunta</span>
              <strong className="text-slate-800">
                {familyNeed.hasNoDependents ? "No aplica" : `${formatCurrency(survivorBenefits.conjuntoMonto)} / mes`}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Déficit de Protección</span>
              <strong className={familyNeed.deficitDeProteccion > 0 ? "text-red-600" : "text-emerald-600"}>
                {familyNeed.hasNoDependents ? "No aplica" : `${formatCurrency(familyNeed.deficitDeProteccion)} objetivo`}
              </strong>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> {familyNeed.hasNoDependents 
              ? "No se requiere cobertura de protección familiar al no declarar cónyuge ni hijos dependientes menores de 25 años."
              : survivorBenefits.conjuntoBrechaOSuperavit >= 0 
                ? "Subsidio mensual cubierto por escenario familiar conjunto. Ajustar seguros para cubrir deudas." 
                : `Existe un déficit familiar. Se recomienda capital de vida de ${formatCurrency(familyNeed.deficitDeProteccion)}.`}
          </p>
          <div className="mt-1.5 text-[11px] text-slate-800 bg-yellow-100/60 p-2.5 border-l-2 border-yellow-500 rounded-r leading-relaxed">
            {familyNeed.hasNoDependents ? (
              <span>
                <strong>Información:</strong> No se calcula ni recomienda ningún capital objetivo de protección familiar de decesos al estar en estado civil <strong>{formData.estadoCivil}</strong> y declarar <strong>{formData.hijosMenores25}</strong> hijos menores de 25 años a su cargo.
              </span>
            ) : (
              <>
                <strong>¿Cómo se calcula y por qué se sugiere?</strong> El capital objetivo recomendado de <strong>{formatCurrency(familyNeed.capitalFamiliarObjetivo)}</strong> se calcula sumando:
                <span className="block mt-1 pl-2 border-l border-slate-200">
                  • Amortización de deudas pendientes: <strong>{formatCurrency(familyNeed.detalles.deuda)}</strong> (para que tu familia no herede deudas).<br />
                  • Gastos de transición inmediata y sepelio: <strong>{formatCurrency(familyNeed.detalles.transicion)}</strong>.<br />
                  • Educación de tus <strong>{formData.hijosMenores25}</strong> hijos menores: <strong>{formatCurrency(familyNeed.detalles.educacion)}</strong> (estimando {formatCurrency(18000)} por hijo para estudios superiores).<br />
                  • Protección de rentas familiares: <strong>{formatCurrency(familyNeed.detalles.rentaNecesaria)}</strong> (cubre la brecha mensual de vida multiplicada por 120 meses / 10 años).
                </span>
                Al restar tu seguro de vida existente de <strong>{formatCurrency(formData.capitalSeguroVidaExistente)}</strong>, resulta un déficit de protección de <strong>{formatCurrency(familyNeed.deficitDeProteccion)}</strong> que sugerimos cubrir.
                {formData.conyugeConIngresos === "Si" && (
                  <div className="mt-1.5 pt-1 border-t border-yellow-200/50 text-[10px] text-emerald-800 font-bold">
                    Nota: Se han integrado los ingresos declarados del cónyuge ({formatCurrency(formData.ingresosConyuge)}/mes) dentro de la subsistencia conjunta, reduciendo la brecha mensual y el déficit de protección familiar.
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-emerald-600 font-bold uppercase">{familyNeed.hasNoDependents ? "Baja / No aplica" : "Media-Alta"}</strong></span>
            <span>Análisis: {familyNeed.hasNoDependents ? "Sin dependientes familiares" : "Viudedad + Orfandad (Tope 100%)"}</span>
          </div>
        </div>

        {/* Tarjeta 3: Liquidez */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">3. Reserva de Liquidez</h3>
              <p className="text-xs text-slate-500">Disponibilidad líquida frente a emergencias</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.fondo >= 8 ? "bg-emerald-50 text-emerald-700" : scores.fondo >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.fondo}/10</span>
          </div>
          {renderThermometer(scores.fondo)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-400 block font-medium">Fondo de Emergencia</span>
              <strong className="text-slate-800">{formatCurrency(liquidity.dineroBanco)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Meses de Gastos Cubiertos</span>
              <strong className="text-slate-800">{liquidity.mesesCubiertos.toFixed(1)} meses</strong>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> {liquidity.mesesCubiertos < 6 
              ? "Construir de forma prioritaria una reserva equivalente a 6-9 meses de gasto fijo." 
              : "Excelente colchón de seguridad. Vigile el exceso de liquidez no invertido."}
          </p>
          <div className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 border-l-2 border-blue-400 rounded-r leading-relaxed">
            <strong>¿Por qué se sugiere esto?</strong> Un fondo de reserva de entre 6 y 9 meses de gastos fijos (rango sugerido: <strong>{formatCurrency(expenses.total * 6)}</strong> - <strong>{formatCurrency(expenses.total * 9)}</strong>) asegura que puedas afrontar crisis empresariales, desempleo o accidentes sobrevenidos sin endeudarte de forma perjudicial ni tener que liquidar de forma prematura otras inversiones a largo plazo.
          </div>
          {liquidity.mesesCubiertos > 9 && (
            <div className="mt-3 p-3.5 bg-white border border-[#C5A566]/30 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-start gap-2">
                <Info className="h-4.5 w-4.5 text-[#C5A566] shrink-0 mt-0.5" />
                <div className="text-left text-xs">
                  <h4 className="font-bold text-[#A8833F] uppercase tracking-wider text-[10.5px]">Optimización de Exceso de Liquidez</h4>
                  <p className="mt-1 text-slate-700 leading-relaxed font-medium">
                    Tu fondo de emergencia de <strong>{formatCurrency(liquidity.dineroBanco)}</strong> supera los 9 meses de gastos cubiertos (máximo recomendado: <strong>{formatCurrency(expenses.total * 9)}</strong>). 
                    Dispones de un excedente parado de <strong className="text-emerald-700">{formatCurrency(liquidity.dineroBanco - expenses.total * 9)}</strong>.
                  </p>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Se recomienda encarecidamente <strong>canalizar e invertir el exceso de ahorro en herramientas con rentabilidad</strong> para batir la inflación silenciosa. 
                    A continuación puedes ver la proyección a 20 años comparando este dinero inactivo frente a una rentabilidad estimada del <strong>6% anual compuesto</strong>:
                  </p>
                </div>
              </div>

              <div className="mt-2.5 bg-white p-3 rounded-lg border border-amber-200/40 shadow-xs">
                <div className="h-36 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={excessProjectionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorParado" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInvertido" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPoderAdquisitivo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} tickFormatter={(v) => `${Math.round(v/1000)}k€`} />
                      <Tooltip 
                        formatter={(value: any) => [`${formatCurrency(Number(value))}`, ""]}
                        contentStyle={{ background: "#ffffff", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                      />
                      <Legend verticalAlign="top" height={20} iconSize={8} />
                      <Area type="monotone" name="Dinero Parado (0%)" dataKey="parado" stroke="#94a3b8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorParado)" />
                      <Area type="monotone" name="Poder Adquisitivo (-2.5% Inflación)" dataKey="poderAdquisitivo" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPoderAdquisitivo)" />
                      <Area type="monotone" name="Proyección (6%)" dataKey="invertido" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInvertido)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-1 italic leading-tight">
                  Al cabo de 20 años, tus {formatCurrency(liquidity.dineroBanco - expenses.total * 9)} invertidos se convertirían en{" "}
                  <strong className="text-emerald-600 font-bold">{formatCurrency(Math.round((liquidity.dineroBanco - expenses.total * 9) * Math.pow(1.06, 20)))}</strong>, multiplicando tu capital ocioso.
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-slate-500 font-bold uppercase">Baja</strong></span>
            <span>Nivel: {liquidity.nivel.toUpperCase()}</span>
          </div>
        </div>

        {/* Tarjeta 4: Deuda */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">4. Apalancamiento y Deuda</h3>
              <p className="text-xs text-slate-500">Ratios de endeudamiento sobre salario e ingresos</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.deuda >= 8 ? "bg-emerald-50 text-emerald-700" : scores.deuda >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.deuda}/10</span>
          </div>
          {renderThermometer(scores.deuda)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-400 block font-medium">Cuota mensual / Deuda pendiente</span>
              <strong className="text-slate-800">{formatCurrency(debt.deudaMensualTotal)} / {formatCurrency(formData.deudaPendienteTotal)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Ratio sobre salario ordinario</span>
              <strong className="text-slate-800">{formatPercent(debt.ratioSobreSalario * 100)}</strong>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> {debt.ratioSobreSalario > 0.35 
              ? "Alerta de endeudamiento alto. Considere amortizar cuota antes de contratar nuevos activos." 
              : "Ratio saludable por debajo del límite prudente del 35%."}
          </p>
          <div className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 border-l-2 border-indigo-400 rounded-r leading-relaxed">
            <strong>¿Por qué se sugiere esto?</strong> Las recomendaciones financieras y reguladoras aconsejan no comprometer más del 35% de tus ingresos ordinarios netos en el servicio de la deuda mensual. En tu caso, la cuota es de <strong>{formatCurrency(debt.deudaMensualTotal)}</strong> sobre unos ingresos familiares de referencia de <strong>{formatCurrency(formData.salarioNetoMensual + (formData.conyugeConIngresos === "Si" ? formData.ingresosConyuge : 0))}</strong> (que incluye {formData.conyugeConIngresos === "Si" ? `el salario neto del cliente y los ingresos del cónyuge de ${formatCurrency(formData.ingresosConyuge)}/mes` : "el salario neto del cliente"}). Mantener este ratio de endeudamiento familiar en <strong>{formatPercent(debt.ratioSobreSalario * 100)}</strong> asegura la total sostenibilidad de las finanzas del hogar a largo plazo.
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-slate-500 font-bold uppercase">Baja</strong></span>
            <span>Riesgo: {debt.riesgo.toUpperCase()}</span>
          </div>
        </div>

        {/* Tarjeta 5: Jubilación */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">5. Planificación de Jubilación</h3>
              <p className="text-xs text-slate-500">Pensiones públicas y brecha de retiro</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.jubilacion >= 8 ? "bg-emerald-50 text-emerald-700" : scores.jubilacion >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.jubilacion}/10</span>
          </div>
          {renderThermometer(scores.jubilacion)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-400 block font-medium">Pensión Central Estimada</span>
              <strong className="text-slate-800">{formatCurrency(centralScenario.pensionEstimada)} / mes</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Brecha Mensual de Retiro</span>
              <strong className="text-slate-800">{formatCurrency(retirementGap.brechaMensual)} / mes</strong>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> Se requiere un capital previsor de {formatCurrency(retirementGap.capitalObjetivo)} para compensar la brecha mensual estimada.
          </p>
          <div className="mt-1.5 text-[11px] text-slate-800 bg-yellow-100/60 p-2.5 border-l-2 border-yellow-500 rounded-r leading-relaxed">
            <strong>¿Por qué se sugiere esto?</strong> La jubilación pública cubrirá <strong>{formatCurrency(retirementGap.pensionEstimada)}/mes</strong>, generando una brecha de <strong>{formatCurrency(retirementGap.brechaMensual)}/mes</strong> frente a tus necesidades fácticas. Para cubrir este desfase durante más de 20 años de retiro, es vital acumular <strong>{formatCurrency(retirementGap.capitalObjetivo)}</strong> a los 67 años, lo cual se logra de forma cómoda y sistemática ahorrando <strong>{formatCurrency(retirementGap.recommendedSaving)}/mes</strong> en planes eficientes con interés compuesto.
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-[#F97316] font-bold uppercase">Media</strong></span>
            <span>Tasa reguladora: {formatPercent(centralScenario.porcentajeEstimado)}</span>
          </div>
        </div>

        {/* Tarjeta 6: Patrimonio */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">6. Patrimonio y Rentas Inmobiliarias</h3>
              <p className="text-xs text-slate-500">Crecimiento de capital contra la inflación</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.inflacion >= 8 ? "bg-emerald-50 text-emerald-700" : scores.inflacion >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.inflacion}/10</span>
          </div>
          {renderThermometer(scores.inflacion)}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
            <div>
              <span className="text-slate-400 block font-medium">Patrimonio Proyectado 67 años</span>
              <strong className="text-slate-800">{formatCurrency(metrics.estate.projectedTotal)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Flujo Renta Inmobiliaria Neto</span>
              <strong className="text-slate-800">{formatCurrency(formData.rentasInmobiliariasMensualesNetas)} / mes</strong>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> {formData.destinoRentasInmobiliarias === "desconocido" 
              ? "Alerta: Destino de rentas inmobiliarias sin verificar. No se consideran rentas en proyección por prudencia."
              : "Patrimonio bien encaminado gracias al flujo inmobiliario e interés compuesto de planes de ahorro."}
          </p>
          <div className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 border-l-2 border-emerald-500 rounded-r leading-relaxed">
            <strong>¿Por qué se sugiere esto?</strong> Las rentas inmobiliarias de <strong>{formatCurrency(formData.rentasInmobiliariasMensualesNetas)}/mes</strong> son un activo pasivo extraordinario. Si se reinvierten de manera sistemática, potencian drásticamente el crecimiento de tu patrimonio neto proyectado (estimado en <strong>{formatCurrency(metrics.estate.projectedTotal)}</strong>). Tener patrimonio diversificado es la mejor defensa frente a la inflación económica.
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-slate-500 font-bold uppercase">Baja</strong></span>
            <span>Destino de Rentas: {formData.destinoRentasInmobiliarias.toUpperCase()}</span>
          </div>
        </div>

        {/* Tarjeta 7: Legal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase text-[#C5A566]">7. Orden Legal y Sucesorio</h3>
              <p className="text-xs text-slate-500">Blindaje legal familiar e instrumental patrimonial</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
              scores.legal >= 8 ? "bg-emerald-50 text-emerald-700" : scores.legal >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
            }`}>Puntuación: {scores.legal}/10</span>
          </div>
          {renderThermometer(scores.legal)}
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong>Recomendación:</strong> Falta testamento, inventario patrimonial, poder preventivo y protocolo familiar de contingencia. Se recomienda ordenar notarialmente estas actas urgentemente.
          </p>
          <div className="mt-1.5 text-[11px] text-slate-800 bg-yellow-100/60 p-2.5 border-l-2 border-yellow-500 rounded-r leading-relaxed">
            <strong>¿Por qué se sugiere esto?</strong> La ausencia de testamento o poder preventivo expone a la familia a un proceso costoso y lento de declaración de herederos judiciales, bloqueo de cuentas corrientes y posibles sobrecostes impositivos. Formalizar estas actas notariales cuesta menos de 150 € y otorga blindaje sucesorio y de representación legal inmediato.
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Prioridad: <strong className="text-[#F97316] font-bold uppercase">Media</strong></span>
            <span>Sucesorio: Insuficiente</span>
          </div>
        </div>
      </div>
    </section>
  );
}
