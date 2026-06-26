import { ReactNode, useEffect, useMemo, useState } from "react";
import { 
  AlertTriangle, 
  BarChart3, 
  Download, 
  FileText, 
  Mail, 
  Phone, 
  Shield, 
  TrendingUp, 
  UserRound, 
  Briefcase, 
  Scale, 
  Clock, 
  Coins, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle as QuestionIcon,
  ChevronRight,
  Info
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  PolarAngleAxis, 
  PolarGrid, 
  PolarRadiusAxis, 
  Radar, 
  RadarChart, 
  ReferenceLine, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { motion } from "motion/react";
import { ClientData, PrestacionesCalculadas } from "./types";
import {
  formatCurrency,
  formatPercent,
  calculateMonthlyExpenses,
  calculateRealSavingsCapacity,
  calculateDebtRatios,
  calculateLiquidity,
  calculateTemporaryDisability,
  calculatePermanentDisability,
  calculateSurvivorBenefits,
  calculateFamilyProtectionNeed,
  calculateRetirementScenarios,
  calculateRetirementGap,
  calculateSavingsGoal,
  calculateSecurityScores,
  validateReportConsistency,
  generateActionPlan,
  Warning
} from "./audit-calculations";

const brand = { 
  black: "#1A1A1A", 
  navy: "#0F172A", 
  gold: "#C5A566", 
  goldDark: "#A8833F", 
  orange: "#F97316", 
  red: "#DC2626", 
  green: "#16A34A" 
};

const logoSvg = encodeURIComponent(`<svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="8" width="18" height="124" fill="#fff"/><rect x="95" y="8" width="18" height="124" fill="#fff"/><rect x="52" y="86" width="16" height="46" fill="#fff"/><circle cx="60" cy="70" r="27" fill="#C5A566"/></svg>`);
const brandLogo = `data:image/svg+xml;charset=utf-8,${logoSvg}`;

const initialClientData: ClientData = {
  // Básicos (manteniendo compatibilidad)
  nombre: "Carlos Gómez", 
  telefono: "647 50 60 40", 
  email: "cliente@email.com", 
  edad: 38, 
  anosCotizados: 12, 
  baseCotizacion: 2800,
  estadoCivil: "Casado/a", 
  numeroHijos: 2, 
  salarioNetoMensual: 2400, 
  gastosMensuales: 1200, 
  alquilerHipotecaPrestamos: 750,
  dineroBanco: 9000, 
  dineroInvertido: 4000, 
  rentabilidadInversion: 5, 
  ahorroSistematico: 150, 
  rentabilidadAhorro: 6,
  preguntas: { 
    p01: "No", 
    p02: "No", 
    p03: "No", 
    p04: "Si", 
    p05: "No", 
    p06: "No", 
    p07: "No", 
    p08: "No" 
  },
  proyectosMedioPlazo: "Comprar un coche familiar en 3 años (18.000 EUR)",
  objetivosLargoPlazo: "Crear un fondo de jubilación privado para compensar la pensión pública.",

  // Fase 2 ampliada: Personales y familiares
  hijosMenores25: 2,
  hijosDependientes: 2,
  edadHijos: "8, 12",
  conyugeConIngresos: "Si",
  ingresosConyuge: 1500,
  dependenciaEconomicaDelCliente: "Media",

  // Económicos
  otrosIngresosNetos: 0,
  gastoMensualPersonal: 1200,
  viviendaPrestamosMensual: 750,
  capacidadAhorroDeclarada: 150,
  ahorroSistematicoMensual: 150,
  rentabilidadAhorroSistematico: 6,

  // Inmobiliarios
  valorInmuebles: 180000,
  rentasInmobiliariasMensualesBrutas: 3000,
  rentasInmobiliariasMensualesNetas: 2400,
  gastosInmobiliariosMensuales: 300,
  impuestosInmobiliariosEstimados: 300,
  deudaInmobiliariaPendiente: 0,
  rentasInmobiliariasDisponibles: 2400,
  destinoRentasInmobiliarias: "desconocido",

  // Deudas
  cuotaHipoteca: 750,
  cuotaPrestamos: 0,
  cuotaTarjetas: 0,
  deudaPendienteTotal: 125000,
  seguroVidaVinculado: "Si",
  capitalSeguroVidaExistente: 50000,
  capitalSeguroIncapacidadExistente: 0,

  // Laboral y Seguridad Social
  regimenSeguridadSocial: "General",
  anosCotizadosActuales: 12,
  baseCotizacionActual: 2800,
  basesCotizacionHistoricasDisponibles: "Pendiente",
  edadJubilacionEstimada: 67,
  convenioComplementaBaja: "Pendiente",
  empresaComplementaBaja: "Pendiente",
  seguroPrivadoBaja: "No",
  subsidioPrivadoDiario: 0,
  profesion: "Responsable Administrativo",
  autonomo: false,
  contingenciaPreferente: "comun",

  // Legal
  tieneTestamento: "No",
  tienePoderPreventivo: "No",
  tieneInventarioPatrimonial: "No",
  familiaConoceDocumentacion: "No",
  beneficiariosRevisados: "Pendiente",
  protocoloEmergenciaFamiliar: "No"
};

type ActiveFormTab = "personal" | "economico" | "deuda" | "seguridad" | "patrimonio" | "legal";

export default function App() {
  const [formData, setFormData] = useState<ClientData>(initialClientData);
  const [activeTab, setActiveTab] = useState<ActiveFormTab>("personal");
  const [goals, setGoals] = useState<Array<{ id: number; name: string; target: number; years: number; priority: "Alta" | "Media" | "Baja" }>>([
    { id: 1, name: "Comprar coche familiar", target: 18000, years: 3, priority: "Media" },
    { id: 2, name: "Fondo de jubilación", target: 72000, years: 29, priority: "Alta" }
  ]);
  const [draftGoal, setDraftGoal] = useState({ name: "Coche familiar", target: 18000, years: 3, priority: "Media" as "Alta" | "Media" | "Baja" });

  // 1. Calculations via custom engine
  const rentasNetas = formData.destinoRentasInmobiliarias !== "desconocido" ? formData.rentasInmobiliariasMensualesNetas : 0;
  
  const expenses = useMemo(() => calculateMonthlyExpenses(formData), [formData]);
  const savingsCapacity = useMemo(() => calculateRealSavingsCapacity(formData, rentasNetas), [formData, rentasNetas]);
  const debt = useMemo(() => calculateDebtRatios(formData, rentasNetas), [formData, rentasNetas]);
  const liquidity = useMemo(() => calculateLiquidity(formData, expenses.total), [formData, expenses.total]);
  const temporaryDisability = useMemo(() => calculateTemporaryDisability(formData, expenses.total), [formData, expenses.total]);
  const permanentDisability = useMemo(() => calculatePermanentDisability(formData, expenses.total), [formData, expenses.total]);
  const survivorBenefits = useMemo(() => calculateSurvivorBenefits(formData, expenses.total), [formData, expenses.total]);
  const familyNeed = useMemo(() => calculateFamilyProtectionNeed(formData, survivorBenefits.conjuntoBrechaOSuperavit), [formData, survivorBenefits.conjuntoBrechaOSuperavit]);
  const retirementScenarios = useMemo(() => calculateRetirementScenarios(formData, expenses.total), [formData, expenses.total]);
  
  // Scenarios selection: Central as principal
  const centralScenario = retirementScenarios.find(s => s.name === "Central")!;
  const retirementGap = useMemo(() => calculateRetirementGap(formData, centralScenario.pensionEstimada, rentasNetas, expenses.total), [formData, centralScenario.pensionEstimada, rentasNetas, expenses.total]);

  // Aggregate Metrics object
  const metrics = useMemo(() => ({
    expenses,
    savingsCapacity,
    debt,
    liquidity,
    temporaryDisability,
    disability: permanentDisability,
    survivorBenefits,
    familyNeed,
    retirementScenarios,
    retirementGap,
    realEstateInvestments: formData.valorInmuebles,
    estate: {
      realEstateRents: formData.rentasInmobiliariasMensualesNetas,
      adjustedExpenses: expenses.total - rentasNetas,
      retirementPension: centralScenario.pensionEstimada,
      retirementGap: retirementGap.brechaMensual,
      projectedInvested: formData.dineroInvertido * Math.pow(1 + (formData.rentabilidadInversion || 5)/100, Math.max(0, 67 - formData.edad)),
      projectedSaving: (formData.rentabilidadAhorro || 6) > 0 ? (formData.ahorroSistematico || 150) * 12 * ((Math.pow(1 + (formData.rentabilidadAhorro || 6)/100, Math.max(0, 67 - formData.edad)) - 1) / ((formData.rentabilidadAhorro || 6)/100)) : (formData.ahorroSistematico || 150) * 12 * Math.max(0, 67 - formData.edad),
      projectedRents: (formData.destinoRentasInmobiliarias === "reinversion" || formData.destinoRentasInmobiliarias === "mixto") ? formData.rentasInmobiliariasMensualesNetas * 12 * Math.max(0, 67 - formData.edad) : 0,
      projectedTotal: 0 // Will compute dynamically
    }
  }), [formData, expenses, savingsCapacity, debt, liquidity, temporaryDisability, permanentDisability, survivorBenefits, familyNeed, retirementScenarios, retirementGap, rentasNetas, centralScenario]);

  metrics.estate.projectedTotal = formData.dineroBanco + metrics.estate.projectedInvested + metrics.estate.projectedSaving + metrics.estate.projectedRents + formData.valorInmuebles;

  const scores = useMemo(() => calculateSecurityScores(formData, metrics), [formData, metrics]);
  const warnings = useMemo(() => validateReportConsistency(formData), [formData]);
  const actionPlan = useMemo(() => generateActionPlan(formData, metrics), [formData, metrics]);

  const renderThermometer = (score: number) => {
    const percentage = Math.min(100, Math.max(0, score * 10));
    return (
      <div className="space-y-1 py-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-tight uppercase">
          <span className="text-red-500 font-black">Vulnerable</span>
          <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Nivel: <strong className={score >= 8 ? "text-emerald-600" : score >= 5 ? "text-amber-500" : "text-red-500"}>{score}/10</strong>
          </span>
          <span className="text-emerald-500 font-black">Protegido</span>
        </div>
        <div className="relative h-2 w-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 rounded-full overflow-visible">
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center"
            style={{ left: `calc(${percentage}% - 7px)` }}
          >
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
          </div>
        </div>
      </div>
    );
  };



  // Syncing basic fields when expanded changes
  const updateField = (field: keyof ClientData, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Sync basic compatibility fields
      if (field === "gastoMensualPersonal") next.gastosMensuales = Number(value);
      if (field === "viviendaPrestamosMensual") {
        next.alquilerHipotecaPrestamos = Number(value);
        next.cuotaHipoteca = Number(value);
      }
      if (field === "cuotaHipoteca") {
        next.viviendaPrestamosMensual = Number(value);
        next.alquilerHipotecaPrestamos = Number(value);
      }
      if (field === "anosCotizadosActuales") next.anosCotizados = Number(value);
      if (field === "baseCotizacionActual") next.baseCotizacion = Number(value);
      if (field === "ahorroSistematicoMensual") next.ahorroSistematico = Number(value);
      if (field === "rentabilidadAhorroSistematico") next.rentabilidadAhorro = Number(value);
      return next;
    });
  };

  const updateQuestion = (field: keyof ClientData["preguntas"], value: string) => {
    setFormData(prev => ({
      ...prev,
      preguntas: { ...prev.preguntas, [field]: value }
    }));
  };

  // Goals table row computing
  const goalRows = useMemo(() => {
    return goals.map(goal => {
      const { aportacionLineal, aportacionFinanciera } = calculateSavingsGoal(
        goal.target,
        goal.years,
        goal.priority === "Alta" ? Number(formData.rentabilidadAhorroSistematico || 6) : 2 // lower risk for short/medium objectives
      );
      const isViable = savingsCapacity.sinRentas >= aportacionFinanciera;
      return {
        ...goal,
        aportacionLineal,
        aportacionFinanciera,
        viable: isViable ? "Viable" : "Ajustado",
        color: isViable ? "emerald" : "orange"
      };
    });
  }, [goals, savingsCapacity, formData]);

  const totalMonthlyGoalAhorro = goalRows.reduce((sum, g) => sum + g.aportacionFinanciera, 0);
  const totalMonthlyGoalLineal = goalRows.reduce((sum, g) => sum + g.aportacionLineal, 0);
  const globalGoalStatus = savingsCapacity.sinRentas >= totalMonthlyGoalAhorro ? "Viable" : "Ajustado";

  const globalGoalStatusDetail = useMemo(() => {
    if (totalMonthlyGoalAhorro === 0) return { label: "Sin objetivos", color: "slate" };
    const ratio = savingsCapacity.sinRentas / totalMonthlyGoalAhorro;
    if (ratio >= 1.0) {
      return { label: "Viable", color: "green" };
    } else if (ratio >= 0.7) {
      return { label: "Ajustado", color: "yellow" };
    } else {
      return { label: "Inviable", color: "red" };
    }
  }, [savingsCapacity.sinRentas, totalMonthlyGoalAhorro]);

  // Exposing to global scope for professional-audit-pdf-v3 integration
  useEffect(() => {
    (window as any).currentAuditData = {
      formData,
      projects: goalRows,
      metrics,
      scores,
      warnings,
      actionPlan,
      retirementScenarios,
    };
  }, [formData, goalRows, metrics, scores, warnings, actionPlan, retirementScenarios]);

  // Recharts projections
  const projectionChartData = useMemo(() => {
    const years = Math.max(15, 67 - formData.edad);
    const optimisticScenario = retirementScenarios.find(s => s.name === "Optimista");
    const capitalOptimista = optimisticScenario ? optimisticScenario.capitalNecesario : 0;

    return Array.from({ length: years + 1 }, (_, i) => {
      const currentAge = formData.edad + i;
      const invRate = (formData.rentabilidadInversion || 5) / 100;
      const savRate = (formData.rentabilidadAhorroSistematico || 6) / 100;
      const annualSaving = (formData.ahorroSistematicoMensual || 150) * 12;

      const savingAcc = savRate > 0 
        ? annualSaving * ((Math.pow(1 + savRate, i) - 1) / savRate)
        : annualSaving * i;
      
      const invAcc = formData.dineroInvertido * Math.pow(1 + invRate, i);
      const rentsAcc = (formData.destinoRentasInmobiliarias === "reinversion" || formData.destinoRentasInmobiliarias === "mixto")
        ? formData.rentasInmobiliariasMensualesNetas * 12 * i
        : 0;

      const total = formData.dineroBanco + invAcc + savingAcc + rentsAcc;
      return {
        edad: currentAge,
        "Patrimonio Financiero": Math.round(total),
        "Ahorro Acumulado": Math.round(savingAcc),
        "Capital Objetivo": Math.round(retirementGap.capitalObjetivo),
        "Capital Objetivo Optimista": Math.round(capitalOptimista)
      };
    });
  }, [formData, retirementGap, retirementScenarios]);

  // Quality assessment (Bloque Calidad del Diagnóstico)
  const dataQuality = useMemo(() => {
    const fields = [
      formData.nombre, formData.telefono, formData.email, formData.edad, formData.anosCotizadosActuales,
      formData.baseCotizacionActual, formData.salarioNetoMensual, formData.gastoMensualPersonal,
      formData.viviendaPrestamosMensual, formData.dineroBanco, formData.dineroInvertido,
      formData.rentasInmobiliariasMensualesNetas, formData.deudaPendienteTotal, formData.capitalSeguroVidaExistente
    ];
    const filledCount = fields.filter(f => f !== null && f !== 0 && f !== "").length;
    const completeness = Math.round((filledCount / fields.length) * 100);

    const pendingList: string[] = [];
    if (formData.basesCotizacionHistoricasDisponibles === "Pendiente") pendingList.push("Bases históricas");
    if (formData.convenioComplementaBaja === "Pendiente") pendingList.push("Convenio de baja");
    if (formData.empresaComplementaBaja === "Pendiente") pendingList.push("Mejora de empresa");
    if (formData.destinoRentasInmobiliarias === "desconocido") pendingList.push("Destino de rentas");
    if (formData.beneficiariosRevisados === "Pendiente") pendingList.push("Revisión de beneficiarios");

    let reliability: "Alta" | "Media" | "Baja" = "Alta";
    if (completeness < 60 || pendingList.length > 3) {
      reliability = "Baja";
    } else if (completeness < 85 || pendingList.length > 0) {
      reliability = "Media";
    }

    return { completeness, pendingList, reliability };
  }, [formData]);

  const addGoal = () => {
    setGoals(prev => [...prev, { id: Date.now(), ...draftGoal }]);
  };

  const removeGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Recharts Radar data
  const radarData = [
    { subject: "Liquidez", score: scores.fondo * 10 },
    { subject: "Baja Laboral", score: scores.baja * 10 },
    { subject: "Incapacidad", score: scores.incapacidad * 10 },
    { subject: "Familias", score: scores.familia * 10 },
    { subject: "Deuda", score: scores.deuda * 10 },
    { subject: "Jubilación", score: scores.jubilacion * 10 },
    { subject: "Patrimonio", score: scores.inflacion * 10 },
    { subject: "Sucesorio", score: scores.legal * 10 }
  ];

  // Recharts Benefit vs Expenses data
  const benefitBarData = [
    { name: "Baja temporal", Prestacion: Math.round(temporaryDisability.tramo60Monto), Gastos: Math.round(expenses.total) },
    { name: "Inv. Profesional (IPT)", Prestacion: Math.round(permanentDisability.iptMonto), Gastos: Math.round(expenses.total) },
    { name: "Inv. Absoluta (IPA)", Prestacion: Math.round(permanentDisability.ipaMonto), Gastos: Math.round(expenses.total) },
    { name: "Viudedad", Prestacion: Math.round(survivorBenefits.viudedadMonto), Gastos: Math.round(expenses.total) },
    { name: "Orfandad", Prestacion: Math.round(survivorBenefits.orfandadMonto), Gastos: Math.round(expenses.total) },
    { name: "Jubilación", Prestacion: Math.round(centralScenario.pensionEstimada), Gastos: Math.round(expenses.total) }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#1A1A1A] text-white border-b border-white/10 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A566]">Auditoría Patrimonial y de Previsión Familiar</p>
              <h1 className="text-xl font-black text-white sm:text-2xl">JOSÉ CARLOS HIDALGO</h1>
              <p className="text-xs text-white/70">Consultoría Estratégica, Previsión Social e Hipotecaria</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-white/80 sm:items-end">
            <a className="flex items-center gap-2 hover:text-[#C5A566] transition-colors" href="mailto:josecarlos@hilolegal.es">
              <Mail className="h-4 w-4 text-[#C5A566]" /> josecarlos@hilolegal.es
            </a>
            <a className="flex items-center gap-2 hover:text-[#C5A566] transition-colors" href="tel:647506040">
              <Phone className="h-4 w-4 text-[#C5A566]" /> 647 50 60 40
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 space-y-8">
        
        {/* FASE 5.1: BLOQUE INICIAL DE CALIDAD DEL DIAGNÓSTICO */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <Shield className="h-6 w-6 text-[#C5A566]" />
            <div>
              <h2 className="text-lg font-black text-slate-900">Control de Calidad del Diagnóstico Financiero</h2>
              <p className="text-xs text-slate-500">Garantía de rigor y prudencia técnica del modelo de datos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Gauge */}
            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datos Suficientes</span>
              <span className="text-4xl font-black text-slate-900 mt-2">{dataQuality.completeness}%</span>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#C5A566] h-2 rounded-full" style={{ width: `${dataQuality.completeness}%` }} />
              </div>
            </div>

            {/* Reliability */}
            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fiabilidad del Informe</span>
              <span className={`text-xl font-black mt-2 px-3 py-1 rounded ${
                dataQuality.reliability === "Alta" ? "bg-emerald-100 text-emerald-800" :
                dataQuality.reliability === "Media" ? "bg-yellow-300 text-black font-semibold" : "bg-red-100 text-red-800"
              }`}>{dataQuality.reliability}</span>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                {dataQuality.reliability === "Alta" ? "Cálculos de alta precisión" : "Requiere validar algunas variables críticas"}
              </p>
            </div>

            {/* Pending validations */}
            <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Datos pendientes de verificar por el asesor:</span>
              {dataQuality.pendingList.length > 0 ? (
                <ul className="space-y-1.5">
                  {dataQuality.pendingList.map(item => (
                    <li key={item} className="text-xs flex items-center gap-2 text-slate-700 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      {item} <span className="text-[10px] text-black bg-yellow-300 px-1 rounded font-semibold">Pendiente</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> ¡Todos los datos clave han sido verificados!
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                *Riesgos no verificables todavía: Se asume continuidad de base sin lagunas de cotización reales.
              </p>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN GRID FOR TARJETAS DIAGNÓSTICO & FORMS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 7 TARGETAS DE DIAGNÓSTICO (FASE 5.6) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-[#C5A566]" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Lectura Profesional del Diagnóstico</h2>
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
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
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
                    ? `Durante los primeros 3 days de baja por enfermedad común, el trabajador no percibe subsidio público. Del día 4 al 20, la Seguridad Social solo cubre el 60% de la base reguladora (un déficit de ${formatCurrency(temporaryDisability.tramo60Brecha)}/mes frente a tus gastos fijos de ${formatCurrency(expenses.total)}/mes). El seguro de subsidio privado cubre esta brecha crítica inicial para evitar tener que recurrir a tus ahorros de emergencia durante convalecencias.`
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
                    <p className="text-xs text-slate-500">Escenario conjunto de viudedad y orfandad</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
                    scores.familia >= 8 ? "bg-emerald-50 text-emerald-700" : scores.familia >= 5 ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-50 text-red-700"
                  }`}>Puntuación: {scores.familia}/10</span>
                </div>
                {renderThermometer(scores.familia)}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
                  <div>
                    <span className="text-slate-400 block font-medium">Pensión Familiar Conjunta</span>
                    <strong className="text-slate-800">{formatCurrency(survivorBenefits.conjuntoMonto)} / mes</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Déficit de Protección</span>
                    <strong className={familyNeed.deficitDeProteccion > 0 ? "text-red-600" : "text-emerald-600"}>
                      {formatCurrency(familyNeed.deficitDeProteccion)} objetivo
                    </strong>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Recomendación:</strong> {survivorBenefits.conjuntoBrechaOSuperavit >= 0 
                    ? "Subsidio mensual cubierto por escenario familiar conjunto. Ajustar seguros para cubrir deudas." 
                    : `Existe un déficit familiar. Se recomienda capital de vida de ${formatCurrency(familyNeed.deficitDeProteccion)}.`}
                </p>
                <div className="mt-1.5 text-[11px] text-slate-800 bg-yellow-100/60 p-2.5 border-l-2 border-yellow-500 rounded-r leading-relaxed">
                  <strong>¿Cómo se calcula y por qué se sugiere?</strong> El capital objetivo recomendado de <strong>{formatCurrency(familyNeed.capitalFamiliarObjetivo)}</strong> se calcula sumando:
                  <span className="block mt-1 pl-2 border-l border-slate-200">
                    • Amortización de deudas pendientes: <strong>{formatCurrency(familyNeed.detalles.deuda)}</strong> (para que tu familia no herede deudas).<br />
                    • Gastos de transición inmediata y sepelio: <strong>{formatCurrency(familyNeed.detalles.transicion)}</strong>.<br />
                    • Educación de tus <strong>{formData.hijosMenores25}</strong> hijos menores: <strong>{formatCurrency(familyNeed.detalles.educacion)}</strong> (estimando {formatCurrency(18000)} por hijo para estudios superiores).<br />
                    • Protección de rentas familiares: <strong>{formatCurrency(familyNeed.detalles.rentaNecesaria)}</strong> (cubre la brecha mensual de vida multiplicada por 120 meses / 10 años).
                  </span>
                  Al restar tu seguro de vida existente de <strong>{formatCurrency(formData.capitalSeguroVidaExistente)}</strong>, resulta un déficit de protección de <strong>{formatCurrency(familyNeed.deficitDeProteccion)}</strong> que sugerimos cubrir.
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Prioridad: <strong className="text-[#F97316] font-bold uppercase">Media-Alta</strong></span>
                  <span>Análisis: Viudedad + Orfandad (Tope 100%)</span>
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
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
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
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
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
                  <strong>¿Por qué se sugiere esto?</strong> Las recomendaciones financieras y reguladoras aconsejan no comprometer más del 35% de tus ingresos ordinarios netos en el servicio de la deuda mensual (cuota de <strong>{formatCurrency(debt.deudaMensualTotal)}</strong> sobre salario neto de <strong>{formatCurrency(formData.salarioNetoMensual)}</strong>). Mantener este ratio en <strong>{formatPercent(debt.ratioSobreSalario * 100)}</strong> asegura la sostenibilidad financiera global a largo plazo.
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
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
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
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
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

          {/* RIGHT: TABS CUESTIONARIO CON MICROTEXTOS DIDÁCTICOS (FASE 5.2 & 5.3 & 5.4) */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-5 w-5 text-[#C5A566]" />
              <h2 className="text-md font-black text-slate-900 uppercase">Cuestionario Profesional Auditado</h2>
            </div>

            {/* Tab navigation */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-lg text-xs font-bold">
              <button onClick={() => setActiveTab("personal")} className={`px-2.5 py-1.5 rounded-md transition ${activeTab === "personal" ? "bg-[#C5A566] text-white" : "text-slate-600 hover:bg-slate-200"}`}>Personal</button>
              <button onClick={() => setActiveTab("economico")} className={`px-2.5 py-1.5 rounded-md transition ${activeTab === "economico" ? "bg-[#C5A566] text-white" : "text-slate-600 hover:bg-slate-200"}`}>Economía</button>
              <button onClick={() => setActiveTab("deuda")} className={`px-2.5 py-1.5 rounded-md transition ${activeTab === "deuda" ? "bg-[#C5A566] text-white" : "text-slate-600 hover:bg-slate-200"}`}>Deuda</button>
              <button onClick={() => setActiveTab("seguridad")} className={`px-2.5 py-1.5 rounded-md transition ${activeTab === "seguridad" ? "bg-[#C5A566] text-white" : "text-slate-600 hover:bg-slate-200"}`}>Seguridad</button>
              <button onClick={() => setActiveTab("patrimonio")} className={`px-2.5 py-1.5 rounded-md transition ${activeTab === "patrimonio" ? "bg-[#C5A566] text-white" : "text-slate-600 hover:bg-slate-200"}`}>Patrimonio</button>
              <button onClick={() => setActiveTab("legal")} className={`px-2.5 py-1.5 rounded-md transition ${activeTab === "legal" ? "bg-[#C5A566] text-white" : "text-slate-600 hover:bg-slate-200"}`}>Legal</button>
            </div>

            <div className="space-y-4">
              
              {/* TAB 1: PERSONAL & FAMILIAR */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
                    <p className="font-bold">¿Por qué preguntamos esto?</p>
                    <p className="mt-1 text-white/90">La edad, estado civil y número de hijos definen el tramo impositivo, los derechos automáticos a pensión de viudedad/orfandad y la necesidad de capital familiar garantizado.</p>
                  </div>
                  <Input label="Nombre del Cliente" value={formData.nombre} onChange={v => updateField("nombre", v)} />
                  <Input label="Teléfono" value={formData.telefono} onChange={v => updateField("telefono", v)} />
                  <Input label="Email" value={formData.email} onChange={v => updateField("email", v)} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Edad Actual" value={formData.edad} onChange={v => updateField("edad", v)} />
                    <SelectInput 
                      label="Estado Civil" 
                      value={formData.estadoCivil} 
                      options={["Soltero/a","Casado/a","Divorciado/a","Pareja de Hecho","Viudo/a"]} 
                      onChange={v => updateField("estadoCivil", v)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Hijos menores de 25" value={formData.hijosMenores25} onChange={v => updateField("hijosMenores25", v)} />
                    <Input label="Edades de Hijos" value={formData.edadHijos} onChange={v => updateField("edadHijos", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SelectInput 
                      label="Cónyuge con ingresos" 
                      value={formData.conyugeConIngresos} 
                      options={["Si", "No", "Pendiente"]} 
                      onChange={v => updateField("conyugeConIngresos", v)} 
                    />
                    <NumberInput label="Ingresos del Cónyuge" value={formData.ingresosConyuge} onChange={v => updateField("ingresosConyuge", v)} />
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
                  <NumberInput label="Salario Neto Mensual (€)" value={formData.salarioNetoMensual} onChange={v => updateField("salarioNetoMensual", v)} />
                  <NumberInput label="Otros Ingresos Netos (€)" value={formData.otrosIngresosNetos} onChange={v => updateField("otrosIngresosNetos", v)} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Gasto Mensual Personal (€)" value={formData.gastoMensualPersonal} onChange={v => updateField("gastoMensualPersonal", v)} />
                    <NumberInput label="Alquiler o Cuota Hipoteca (€)" value={formData.viviendaPrestamosMensual} onChange={v => updateField("viviendaPrestamosMensual", v)} />
                  </div>

                  <div className="bg-slate-50 p-3 rounded text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gastos Mensuales Totales:</span>
                      <strong className="text-slate-800">{formatCurrency(expenses.total)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacidad Ahorro (Sin Rentas):</span>
                      <strong className="text-emerald-700">{formatCurrency(savingsCapacity.sinRentas)} / mes</strong>
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
                  
                  <div className="grid grid-cols-3 gap-2">
                    <NumberInput label="Hipoteca (€)" value={formData.cuotaHipoteca} onChange={v => updateField("cuotaHipoteca", v)} />
                    <NumberInput label="Préstamos (€)" value={formData.cuotaPrestamos} onChange={v => updateField("cuotaPrestamos", v)} />
                    <NumberInput label="Tarjetas (€)" value={formData.cuotaTarjetas} onChange={v => updateField("cuotaTarjetas", v)} />
                  </div>

                  <NumberInput label="Deuda Pendiente Total (€)" value={formData.deudaPendienteTotal} onChange={v => updateField("deudaPendienteTotal", v)} />

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
                    <SelectInput 
                      label="Régimen S.S." 
                      value={formData.regimenSeguridadSocial} 
                      options={["General", "RETA (Autónomos)", "Otros"]} 
                      onChange={v => updateField("regimenSeguridadSocial", v)} 
                    />
                    <NumberInput label="Base de Cotización (€)" value={formData.baseCotizacionActual} onChange={v => updateField("baseCotizacionActual", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Años Cotizados" value={formData.anosCotizadosActuales} onChange={v => updateField("anosCotizadosActuales", v)} />
                    <SelectInput 
                      label="Bases Históricas" 
                      value={formData.basesCotizacionHistoricasDisponibles} 
                      options={["Si", "No", "Pendiente"]} 
                      onChange={v => updateField("basesCotizacionHistoricasDisponibles", v)} 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
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
                </div>
              )}

              {/* TAB 5: PATRIMONIO E INVERSION */}
              {activeTab === "patrimonio" && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#C5A566] text-white text-xs rounded border border-[#C5A566]/20 shadow-sm">
                    <p className="font-bold">Análisis Inmobiliario Prudente</p>
                    <p className="mt-1 text-white/90">Si el destino de las rentas inmobiliarias es desconocido, por prudencia, no se acumulan como patrimonio proyectado de jubilación, tratándolo únicamente como flujo pasivo potencial.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Dinero en Banco (€)" value={formData.dineroBanco} onChange={v => updateField("dineroBanco", v)} />
                    <NumberInput label="Dinero Invertido (€)" value={formData.dineroInvertido} onChange={v => updateField("dineroInvertido", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Rentabilidad Inversión (%)" value={formData.rentabilidadInversion ?? 0} onChange={v => updateField("rentabilidadInversion", v)} />
                    <NumberInput label="Ahorro Sistemático (€)" value={formData.ahorroSistematicoMensual} onChange={v => updateField("ahorroSistematicoMensual", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Rentabilidad Ahorro Sist. (%)" value={formData.rentabilidadAhorroSistematico} onChange={v => updateField("rentabilidadAhorroSistematico", v)} />
                    <NumberInput label="Valor Inmuebles (€)" value={formData.valorInmuebles} onChange={v => updateField("valorInmuebles", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Renta Inmueble Bruta (€)" value={formData.rentasInmobiliariasMensualesBrutas} onChange={v => updateField("rentasInmobiliariasMensualesBrutas", v)} />
                    <NumberInput label="Renta Inmueble Neta (€)" value={formData.rentasInmobiliariasMensualesNetas} onChange={v => updateField("rentasInmobiliariasMensualesNetas", v)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SelectInput 
                      label="Destino de Rentas" 
                      value={formData.destinoRentasInmobiliarias} 
                      options={["consumo", "reinversion", "mixto", "desconocido"]} 
                      onChange={v => updateField("destinoRentasInmobiliarias", v)} 
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

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
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

        </div>

        {/* FASE 5.5: RESUMEN PREVIO ANTES DE DESCARGAR EL INFORME PREMIUM */}
        <section className="bg-[#1A1A1A] text-white border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-[#C5A566]" />
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Previsualización de la Auditoría Patrimonial</h2>
                  <p className="text-xs text-slate-400">Puntajes, prioridades del plan y estado general del cliente</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                <div className="border border-white/10 p-3 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Seguridad Global</span>
                  <strong className="text-[#C5A566] text-xl font-black">{scores.globalScore}/10</strong>
                </div>
                <div className="border border-white/10 p-3 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Ahorro Mensual</span>
                  <strong className="text-emerald-400 text-sm font-black">{formatCurrency(savingsCapacity.conRentasValidadas)}</strong>
                </div>
                <div className="border border-white/10 p-3 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Déficit Jubilación</span>
                  <strong className="text-slate-200 text-sm font-black">{formatCurrency(retirementGap.brechaMensual)}/mes</strong>
                </div>
                <div className="border border-white/10 p-3 rounded bg-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Reserva de Emergencia</span>
                  <strong className="text-slate-200 text-sm font-black">{formatCurrency(liquidity.dineroBanco)}</strong>
                </div>
              </div>

              {/* Warning Messages */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-black text-[#C5A566] tracking-wider block">Validaciones de Consistencia Técnicas:</span>
                <div className="max-h-32 overflow-y-auto space-y-1 bg-black/30 p-3 rounded border border-white/5">
                  {warnings.length > 0 ? (
                    warnings.map((w, idx) => (
                      <p key={idx} className="text-xs flex items-start gap-2 leading-relaxed text-slate-300">
                        <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                          w.type === "critica" ? "text-red-500" : w.type === "importante" ? "text-amber-500" : "text-blue-400"
                        }`} />
                        <span>[{w.type.toUpperCase()}] {w.text}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-400">Cálculos perfectamente validados y sin contradicciones lógicas.</p>
                  )}
                </div>
              </div>
            </div>

            {/* DOWNLOAD BLOCK */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-center text-center space-y-4">
              <div>
                <span className="text-[#C5A566] text-[10px] font-black uppercase tracking-widest block">Informe de Auditoría Completa</span>
                <h3 className="text-md font-black text-white mt-1">Descarga del Informe de Auditoría</h3>
                <p className="text-xs text-slate-400 mt-2">PDF de diseño profesional con escenarios macroeconómicos, orden sucesorio y diagnóstico formal del asesor.</p>
              </div>

              {/* Keep existing button exact text for backward compatible handlers if any */}
              <button 
                id="download-professional-pdf"
                className="w-full flex items-center justify-center gap-2 rounded bg-[#C5A566] py-3.5 text-xs font-black uppercase text-white tracking-wider hover:bg-[#A8833F] transition-colors shadow-md"
              >
                <Download className="h-4 w-4" /> Descargar informe PDF
              </button>
            </div>

          </div>
        </section>

        {/* GOALS SECTION (FASE 9: ESFUERZO MENSUAL Y OBJETIVOS DE AHORRO) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-[#C5A566]" />
            <h2 className="text-lg font-black text-slate-900">Objetivos y Proyectos de Capitalización</h2>
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

        {/* FASE 7: JUBILACIÓN POR ESCENARIOS (CONSERVADOR, CENTRAL, OPTIMISTA) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-[#C5A566]" />
            <h2 className="text-lg font-black text-slate-900">Escenarios de Jubilación Pública y Brechas de Retiro</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {retirementScenarios.map(s => (
              <div key={s.name} className="border border-slate-200 rounded-lg p-5 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-slate-900 text-sm uppercase text-[#C5A566]">{s.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      s.fiabilidad === "Alta" ? "bg-emerald-100 text-emerald-800" :
                      s.fiabilidad === "Media" ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-100 text-red-800"
                    }`}>Fiabilidad: {s.fiabilidad}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">{s.hipotesis}</p>
                  
                  <div className="space-y-1.5 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Años cotizados proyectados:</span>
                      <strong className="text-slate-800">{s.anosCotizadosProyectados} años</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Porcentaje regulador:</span>
                      <strong className="text-slate-800">{formatPercent(s.porcentajeEstimado)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Pensión estimada:</span>
                      <strong className="text-slate-900 font-bold">{formatCurrency(s.pensionEstimada)} / mes</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Gasto de referencia:</span>
                      <strong className="text-slate-900">{formatCurrency(s.gastoReferencia)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Brecha mensual:</span>
                      <strong className="text-red-600 font-bold">{formatCurrency(s.brecha)} / mes</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 text-xs bg-white p-3 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Capital Necesario (90 años)</span>
                  <strong className="text-slate-900 text-sm font-black block mt-0.5">{formatCurrency(s.capitalNecesario)}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-100/60 border border-yellow-300 text-slate-800 text-xs rounded-lg p-4 space-y-1">
            <p className="font-bold text-black flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Nota Metodológica Obligatoria:
            </p>
            <p className="leading-relaxed">
              La pensión pública de jubilación proyectada no es un derecho consolidado actual. Depende de cotizaciones futuras, bases reguladoras, edad legal, posibles lagunas y normativa vigente en la fecha de jubilación. Cálculos expresados en euros actuales.
            </p>
          </div>
        </section>

        {/* CHARTS CONTAINER (FASE 15) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Projections Area */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase text-[#C5A566] tracking-wide">Proyección de Patrimonio a la Jubilación</h3>
            <p className="text-xs text-slate-500">Crecimiento estimado del capital contra el objetivo real hasta la jubilación</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionChartData}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
                  <XAxis dataKey="edad" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={v => formatCurrency(Number(v))} />
                  <Legend />
                  <Area dataKey="Patrimonio Financiero" name="Patrimonio Proyectado" stroke={brand.gold} fill={brand.gold} fillOpacity={0.15} />
                  <Area dataKey="Ahorro Acumulado" name="Plan de Ahorro Acumulado" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.05} />
                  <Line dataKey="Capital Objetivo" name="Línea Capital Objetivo Central" stroke={brand.orange} strokeDasharray="6 6" dot={false} strokeWidth={1.5} />
                  <Line dataKey="Capital Objetivo Optimista" name="Línea Capital Objetivo Optimista" stroke={brand.red} strokeDasharray="4 4" dot={false} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed italic">
              Patrimonio proyectado a la jubilación: {formatCurrency(metrics.estate.projectedTotal)}. Incluye inversiones inmobiliarias si su destino es reinversión.
            </p>
          </div>

          {/* Chart 2: Benefits vs Expenses */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase text-[#C5A566] tracking-wide">Prestaciones S.S. vs Gasto Familiar Requerido</h3>
            <p className="text-xs text-slate-500">Comparativa directa de la renta estimada por contingencia frente a la necesidad mensual real</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benefitBarData}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={v => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="Prestacion" name="Prestación Estimada" fill={brand.gold} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="Gastos" name="Gasto de Referencia" stroke={brand.red} strokeWidth={2} dot={false} />
                  <ReferenceLine y={expenses.total} stroke={brand.red} strokeDasharray="4 4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed italic">
              Un déficit por debajo de la línea de gasto de referencia representa una brecha fáctica que desequilibrará las finanzas del hogar.
            </p>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-6 mt-16 border-t border-white/10 shadow-inner">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={brandLogo} alt="Logo" className="h-16 w-14 object-contain" />
            <div>
              <p className="text-lg font-black text-white">JOSÉ CARLOS HIDALGO</p>
              <p className="text-xs text-white/50">Consultor Financiero Registrado e Intermediario Hipotecario</p>
              <p className="text-[10px] text-slate-500 max-w-md mt-2 leading-relaxed">
                Este informe utiliza estimaciones matemáticas conformes a la legislación fiscal y de previsión social española vigente a {new Date().getFullYear()}. Su carácter es meramente didáctico e informativo.
              </p>
            </div>
          </div>
          <div className="text-sm text-white/70 space-y-1">
            <p className="font-bold text-[#C5A566]">Contacto Directo:</p>
            <p>josecarlos@hilolegal.es</p>
            <p>647 50 60 40</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Title({ icon, text }: { icon: ReactNode; text: string }) { 
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
      {icon}
      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{text}</h2>
    </div>
  ); 
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { 
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

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { 
  const isPending = value === 0;
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
        <span>{label}</span>
        <span className={`text-[9px] px-1 rounded font-bold ${isPending ? "bg-yellow-300 text-black font-semibold" : "bg-emerald-100 text-emerald-700"}`}>
          {isPending ? "Pendiente" : "Verificado"}
        </span>
      </span>
      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#C5A566] focus:ring-1 focus:ring-[#C5A566]" type="number" value={value} onChange={e=>onChange(Number(e.target.value))}/>
    </label>
  ); 
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { 
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

function Metric({ label, value }: { label: string; value: string }) { 
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1.5 text-md font-black text-slate-800">{value}</p>
    </div>
  ); 
}
