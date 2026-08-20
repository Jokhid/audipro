import { FileText } from "lucide-react";
import { ClientData } from "../types";
import { formatCurrency } from "../audit-calculations";
import { Input, NumberInput, SelectInput } from "./FormInputs";

export type ActiveFormTab = "personal" | "economico" | "deuda" | "seguridad" | "patrimonio" | "legal";

interface QuestionnaireSectionProps {
  formData: ClientData;
  updateField: (field: keyof ClientData, value: any) => void;
  updateQuestion: (field: keyof ClientData["preguntas"], value: string) => void;
  activeTab: ActiveFormTab;
  setActiveTab: (tab: ActiveFormTab) => void;
  expenses: { total: number };
  savingsCapacity: { sinRentas: number };
}

export function QuestionnaireSection({
  formData,
  updateField,
  updateQuestion,
  activeTab,
  setActiveTab,
  expenses,
  savingsCapacity,
}: QuestionnaireSectionProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <FileText className="h-5 w-5 text-[#C5A566]" />
        <div>
          <h2 className="text-md font-black text-slate-900 uppercase">Cuestionario Profesional Auditado</h2>
          <p className="text-xs text-slate-500">Rellena o actualiza los datos del cliente para recalcular inmediatamente toda la auditoría</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-lg text-xs font-bold">
        <button 
          onClick={() => setActiveTab("personal")} 
          className={`px-4 py-2 rounded-md transition ${activeTab === "personal" ? "bg-[#C5A566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
          1. Personal y Familiar
        </button>
        <button 
          onClick={() => setActiveTab("economico")} 
          className={`px-4 py-2 rounded-md transition ${activeTab === "economico" ? "bg-[#C5A566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
          2. Economía y Gastos
        </button>
        <button 
          onClick={() => setActiveTab("deuda")} 
          className={`px-4 py-2 rounded-md transition ${activeTab === "deuda" ? "bg-[#C5A566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
          3. Deuda y Seguros
        </button>
        <button 
          onClick={() => setActiveTab("seguridad")} 
          className={`px-4 py-2 rounded-md transition ${activeTab === "seguridad" ? "bg-[#C5A566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
          4. Seguridad Social y Régimen
        </button>
        <button 
          onClick={() => setActiveTab("patrimonio")} 
          className={`px-4 py-2 rounded-md transition ${activeTab === "patrimonio" ? "bg-[#C5A566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
          5. Patrimonio e Inversión
        </button>
        <button 
          onClick={() => setActiveTab("legal")} 
          className={`px-4 py-2 rounded-md transition ${activeTab === "legal" ? "bg-[#C5A566] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
          6. Legal y Sucesorio
        </button>
      </div>

      <div className="space-y-4">
        {/* TAB 1: PERSONAL & FAMILIAR */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
              <p className="font-bold">¿Por qué preguntamos esto?</p>
              <p className="mt-1 text-white/90">La edad, estado civil y número de hijos definen el tramo impositivo, los derechos automáticos a pensión de viudedad/orfandad y la necesidad de capital familiar garantizado.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Nombre del Cliente" value={formData.nombre} onChange={v => updateField("nombre", v)} />
              <Input label="Teléfono" value={formData.telefono} onChange={v => updateField("telefono", v)} />
              <Input label="Email" value={formData.email} onChange={v => updateField("email", v)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Edad Actual" value={formData.edad} onChange={v => updateField("edad", v)} />
              <SelectInput 
                label="Estado Civil" 
                value={formData.estadoCivil} 
                options={["Soltero/a","Casado/a","Divorciado/a","Pareja de Hecho","Viudo/a"]} 
                onChange={v => updateField("estadoCivil", v)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="Hijos menores de 25" 
                value={formData.hijosMenores25 === 0 ? "No" : String(formData.hijosMenores25)} 
                options={["No", "1", "2", "3", "4", "5", "6"]} 
                onChange={v => {
                  const num = v === "No" ? 0 : Number(v);
                  updateField("hijosMenores25", num);
                }} 
              />
              <Input label="Edades de Hijos" value={formData.edadHijos} onChange={v => updateField("edadHijos", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="Cónyuge con ingresos" 
                value={formData.conyugeConIngresos} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("conyugeConIngresos", v)} 
              />
              <NumberInput label="Ingresos del Cónyuge (€)" value={formData.ingresosConyuge} onChange={v => updateField("ingresosConyuge", v)} />
            </div>
          </div>
        )}

        {/* TAB 2: ECONOMICOS */}
        {activeTab === "economico" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
              <p className="font-bold">¿Cómo afecta al diagnóstico?</p>
              <p className="mt-1 text-white/90">Define la capacidad neta de ahorro fáctica de la unidad familiar. Si el gasto real es superior al ingreso base, existe riesgo inminente de descapitalización.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Salario Neto Mensual (€)" value={formData.salarioNetoMensual} onChange={v => updateField("salarioNetoMensual", v)} />
              <NumberInput label="Otros Ingresos Netos (€)" value={formData.otrosIngresosNetos} onChange={v => updateField("otrosIngresosNetos", v)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Gasto Mensual Personal (€)" value={formData.gastoMensualPersonal} onChange={v => updateField("gastoMensualPersonal", v)} />
              <NumberInput label="Alquiler o Cuota Hipoteca (€)" value={formData.viviendaPrestamosMensual} onChange={v => updateField("viviendaPrestamosMensual", v)} />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-xs space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Gastos Mensuales Totales:</span>
                <strong className="text-slate-800 text-sm">{formatCurrency(expenses.total)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Capacidad Ahorro (Sin Rentas):</span>
                <strong className="text-emerald-700 text-sm">{formatCurrency(savingsCapacity.sinRentas)} / mes</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEUDA */}
        {activeTab === "deuda" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
              <p className="font-bold">¿Qué ocurre si falta este dato?</p>
              <p className="mt-1 text-white/90">Si falta la deuda pendiente, el cálculo del "Capital Familiar Objetivo" de protección de fallecimiento aparecerá como pendiente de validar, subestimando la necesidad de vida.</p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                HIPOTECA, PRÉSTAMOS Y TARJETAS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberInput label="Hipoteca (€)" value={formData.cuotaHipoteca} onChange={v => updateField("cuotaHipoteca", v)} />
                <NumberInput label="Préstamos (€)" value={formData.cuotaPrestamos} onChange={v => updateField("cuotaPrestamos", v)} />
                <NumberInput label="Tarjetas (€)" value={formData.cuotaTarjetas} onChange={v => updateField("cuotaTarjetas", v)} />
              </div>
            </div>

            <NumberInput label="Deuda Pendiente Total (€)" value={formData.deudaPendienteTotal} onChange={v => updateField("deudaPendienteTotal", v)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="¿Seguro de Vida Vinculado?" 
                value={formData.seguroVidaVinculado} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("seguroVidaVinculado", v)} 
              />
              <NumberInput label="Capital Asegurado Existente (€)" value={formData.capitalSeguroVidaExistente} onChange={v => updateField("capitalSeguroVidaExistente", v)} />
            </div>
          </div>
        )}

        {/* TAB 4: PREVISIÓN SOCIAL */}
        {activeTab === "seguridad" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
              <p className="font-bold">Rigor Técnico de Prestaciones</p>
              <p className="mt-1 text-white/90">La Seguridad Social de España calcula IT y Jubilación basándose en bases reguladoras reales, cotizaciones e hipótesis que requieren revisión pormenorizada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="Régimen S.S." 
                value={formData.regimenSeguridadSocial} 
                options={["General", "RETA (Autónomos)", "Otros"]} 
                onChange={v => updateField("regimenSeguridadSocial", v)} 
              />
              <NumberInput label="Base de Cotización (€)" value={formData.baseCotizacionActual} onChange={v => updateField("baseCotizacionActual", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Años Cotizados" value={formData.anosCotizadosActuales} onChange={v => updateField("anosCotizadosActuales", v)} />
              <SelectInput 
                label="Bases Históricas" 
                value={formData.basesCotizacionHistoricasDisponibles} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("basesCotizacionHistoricasDisponibles", v)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectInput 
                label="Convenio IT" 
                value={formData.convenioComplementaBaja} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("convenioComplementaBaja", v)} 
              />
              <SelectInput 
                label="Mejora de Empresa" 
                value={formData.empresaComplementaBaja} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("empresaComplementaBaja", v)} 
              />
              <SelectInput 
                label="Seguro Privado" 
                value={formData.seguroPrivadoBaja} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("seguroPrivadoBaja", v)} 
              />
            </div>

            <div className="mt-4 border-t border-slate-200/60 pt-4">
              <details className="group border border-slate-200/80 rounded-lg bg-slate-50/50 overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-slate-50">
                <summary className="flex justify-between items-center p-3 font-bold text-xs text-slate-700 uppercase tracking-wide select-none">
                  <span>¿Cómo se calcula la Base Reguladora (B.R.)?</span>
                  <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                </summary>
                <div className="p-3 border-t border-slate-200/60 text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    La <strong>Base Reguladora (B.R.)</strong> es el eje técnico que determina la cuantía final de cada subsidio o pensión pública en España:
                  </p>
                  <div className="space-y-2 pl-1.5 border-l-2 border-[#C5A566]/60">
                    <div>
                      <strong className="text-slate-800 block font-semibold">1. Incapacidad Temporal (Baja Laboral):</strong>
                      <span>Para enfermedad común, se divide la base de cotización de contingencias comunes del mes previo por 30 (salario mensual). En contingencia profesional, se descuentan las horas extras y se promedian las del año anterior.</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block font-semibold">2. Incapacidad Permanente (Invalidez):</strong>
                      <span>En contingencia común, resulta del promedio ponderado (actualizado por inflación) de las bases de cotización de los últimos años (de 8 a 24 años según edad). En accidente de trabajo, se calcula sobre salarios reales anuales previos.</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block font-semibold">3. Pensión de Viudedad:</strong>
                      <span>Si el causante estaba activo, se divide por 28 la suma de las bases de cotización de 24 meses ininterrumpidos de los últimos 15 años.</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block font-semibold">4. Pensión de Jubilación:</strong>
                      <span>Es el cociente de dividir entre 350 las bases de cotización de los últimos 25 años (300 meses). Las bases antiguas (salvo los 2 últimos años) se actualizan con el IPC.</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* TAB 5: PATRIMONIO E INVERSION */}
        {activeTab === "patrimonio" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
              <p className="font-bold">Análisis Inmobiliario Prudente</p>
              <p className="mt-1 text-white/90">Si el destino de las rentas inmobiliarias es desconocido, por prudencia, no se acumulan como patrimonio proyectado de jubilación, tratándolo únicamente como flujo pasivo potencial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Dinero en Banco (€)" value={formData.dineroBanco} onChange={v => updateField("dineroBanco", v)} />
              <NumberInput label="Dinero Invertido (€)" value={formData.dineroInvertido} onChange={v => updateField("dineroInvertido", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Rentabilidad Inversión (%)" value={formData.rentabilidadInversion ?? 0} onChange={v => updateField("rentabilidadInversion", v)} />
              <NumberInput label="Ahorro Sistemático (€)" value={formData.ahorroSistematicoMensual} onChange={v => updateField("ahorroSistematicoMensual", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Rentabilidad Ahorro Sist. (%)" value={formData.rentabilidadAhorroSistematico} onChange={v => updateField("rentabilidadAhorroSistematico", v)} />
              <NumberInput label="Valor Inmuebles (€)" value={formData.valorInmuebles} onChange={v => updateField("valorInmuebles", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Renta Inmueble Bruta (€)" value={formData.rentasInmobiliariasMensualesBrutas} onChange={v => updateField("rentasInmobiliariasMensualesBrutas", v)} />
              <NumberInput label="Renta Inmueble Neta (€)" value={formData.rentasInmobiliariasMensualesNetas} onChange={v => updateField("rentasInmobiliariasMensualesNetas", v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="Destino de Rentas" 
                value={formData.destinoRentasInmobiliarias} 
                options={["consumo", "reinversion", "mixto", "desconocido"]} 
                onChange={v => updateField("destinoRentasInmobiliarias", v)} 
              />
              <SelectInput 
                label="Estrategia Activa vs Inflación" 
                value={formData.preguntas.p06} 
                options={["Si", "No"]} 
                onChange={v => updateQuestion("p06", v)} 
              />
            </div>
          </div>
        )}

        {/* TAB 6: LEGAL Y SUCESORIO */}
        {activeTab === "legal" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
              <p className="font-bold">El valor de la Sucesión</p>
              <p className="mt-1 text-white/90">Un plan financiero sin testamento o protocolo documental pierde eficacia ante situaciones sobrevenidas, forzando congelaciones de cuentas corrientes y gastos imprevistos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="¿Tiene Testamento?" 
                value={formData.tieneTestamento} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("tieneTestamento", v)} 
              />
              <SelectInput 
                label="¿Poder Preventivo?" 
                value={formData.tienePoderPreventivo} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("tienePoderPreventivo", v)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="¿Inventario Patrimonial?" 
                value={formData.tieneInventarioPatrimonial} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("tieneInventarioPatrimonial", v)} 
              />
              <SelectInput 
                label="¿Familia conoce claves/pólizas?" 
                value={formData.familiaConoceDocumentacion} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("familiaConoceDocumentacion", v)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput 
                label="¿Beneficiarios Revisados?" 
                value={formData.beneficiariosRevisados} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("beneficiariosRevisados", v)} 
              />
              <SelectInput 
                label="¿Protocolo Emergencia?" 
                value={formData.protocoloEmergenciaFamiliar} 
                options={["Si", "No", "Pendiente"]} 
                onChange={v => updateField("protocoloEmergenciaFamiliar", v)} 
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
