import { ReactNode, useEffect, useMemo, useState } from "react";
import { initAuth, googleSignIn, logout, sendEmailWithPdf } from "./gmail-auth";
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
import { VerificationContext } from "./components/VerificationContext";
import { Input, NumberInput, SelectInput, Metric, Title } from "./components/FormInputs";
import { QuestionnaireSection, ActiveFormTab } from "./components/QuestionnaireSection";
import { GoalsSection } from "./components/GoalsSection";
import { DiagnosticCardsSection } from "./components/DiagnosticCardsSection";
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

const BrandLogo = ({ className = "h-16 w-14" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left bracket: C-shape bracket with serifs facing right */}
    <path
      d="M 28 10 H 4 V 22 H 14 V 118 H 4 V 130 H 28 Z"
      fill="#ffffff"
      stroke="#002D62"
      strokeWidth="4"
      strokeLinejoin="miter"
    />
    {/* Right bracket: C-shape bracket with serifs facing left */}
    <path
      d="M 92 10 H 116 V 22 H 106 V 118 H 116 V 130 H 92 Z"
      fill="#ffffff"
      stroke="#002D62"
      strokeWidth="4"
      strokeLinejoin="miter"
    />
    {/* Top center pillar */}
    <rect
      x="53"
      y="10"
      width="14"
      height="28"
      fill="#ffffff"
      stroke="#002D62"
      strokeWidth="4"
      strokeLinejoin="miter"
    />
    {/* Bottom center pillar */}
    <rect
      x="53"
      y="102"
      width="14"
      height="28"
      fill="#ffffff"
      stroke="#002D62"
      strokeWidth="4"
      strokeLinejoin="miter"
    />
    {/* Center circle: completely ocher, no orange outline */}
    <circle cx="60" cy="70" r="23" fill="#C5A566" />
  </svg>
);

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

export default function App() {
  const [formData, setFormData] = useState<ClientData>(initialClientData);
  const [verifiedZeros, setVerifiedZeros] = useState<Record<string, boolean>>({});
  
  const [gmailUser, setGmailUser] = useState<any>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGmailUser(user);
        setGmailToken(token);
      },
      () => {
        setGmailUser(null);
        setGmailToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSendEmailClick = () => {
    setRecipientEmail(formData.email || "");
    setEmailStatus(null);
    setIsEmailModalOpen(true);
  };

  const handleGmailLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGmailUser(result.user);
        setGmailToken(result.accessToken);
      }
    } catch (err: any) {
      console.error("Login to Gmail failed", err);
      let errMsg = "No se pudo conectar con Gmail. Por favor, inténtelo de nuevo.";
      
      if (err.code === "auth/unauthorized-domain") {
        errMsg = `Dominio no autorizado: El dominio de Vercel (${window.location.hostname}) no está autorizado en tu proyecto de Firebase. Debes añadirlo en Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
      } else if (err.code === "auth/popup-closed-by-user") {
        errMsg = "La ventana de inicio de sesión se cerró antes de completar el proceso. Inténtalo de nuevo.";
      } else if (err.code === "auth/popup-blocked") {
        errMsg = "El navegador bloqueó la ventana emergente de inicio de sesión. Por favor, permite las ventanas emergentes para este sitio.";
      } else if (err.message) {
        errMsg = `Error de autenticación: ${err.message} (${err.code || 'unknown'})`;
      }
      
      setEmailStatus({
        type: "error",
        message: errMsg
      });
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailToken) return;
    if (!recipientEmail) {
      setEmailStatus({
        type: "error",
        message: "Por favor, introduzca una dirección de correo válida."
      });
      return;
    }

    setIsEmailSending(true);
    setEmailStatus(null);

    try {
      const generatePdfFn = (window as any).generatePdf;
      if (!generatePdfFn) {
        throw new Error("El generador de PDF no está inicializado. Recarga e inténtalo de nuevo.");
      }
      
      const doc = await generatePdfFn(false);
      const base64Pdf = doc.output("base64");

      await sendEmailWithPdf(gmailToken, recipientEmail, formData.nombre || "Cliente", base64Pdf);

      setEmailStatus({
        type: "success",
        message: `La auditoría ha sido enviada con éxito a ${recipientEmail}.`
      });
    } catch (err: any) {
      console.error("Error sending email", err);
      setEmailStatus({
        type: "error",
        message: err.message || "Ocurrió un error al enviar el correo. Por favor, inténtelo de nuevo."
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleGmailLogout = async () => {
    await logout();
    setGmailUser(null);
    setGmailToken(null);
  };

  const toggleVerifiedZero = (label: string) => {
    setVerifiedZeros(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const clearVerifiedZero = (label: string) => {
    setVerifiedZeros(prev => {
      if (prev[label]) {
        const copy = { ...prev };
        delete copy[label];
        return copy;
      }
      return prev;
    });
  };

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

  const excessProjectionData = useMemo(() => {
    const maxAllowedReserva = expenses.total * 9;
    const excess = Math.max(0, liquidity.dineroBanco - maxAllowedReserva);
    if (excess <= 0) return [];
    
    const data = [];
    for (let year = 0; year <= 20; year += 5) {
      data.push({
        year: `Año ${year}`,
        parado: Math.round(excess),
        invertido: Math.round(excess * Math.pow(1.06, year)),
        poderAdquisitivo: Math.round(excess / Math.pow(1.025, year))
      });
    }
    return data;
  }, [expenses.total, liquidity.dineroBanco]);

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
      if (field === "hijosMenores25") {
        next.numeroHijos = Number(value);
        next.hijosDependientes = Number(value);
      }
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

  const isSingleAndChildless = (formData.estadoCivil === "Soltero/a") && (formData.hijosMenores25 === 0);

  // Recharts Benefit vs Expenses data
  const benefitBarData = [
    { name: "Baja temporal", Prestacion: Math.round(temporaryDisability.tramo60Monto), Gastos: Math.round(expenses.total) },
    { name: "Inv. Profesional (IPT)", Prestacion: Math.round(permanentDisability.iptMonto), Gastos: Math.round(expenses.total) },
    { name: "Inv. Absoluta (IPA)", Prestacion: Math.round(permanentDisability.ipaMonto), Gastos: Math.round(expenses.total) },
    ...(isSingleAndChildless ? [] : [
      { name: "Prest. Familiares", Prestacion: Math.round(survivorBenefits.viudedadMonto + survivorBenefits.orfandadMonto), Gastos: Math.round(expenses.total) }
    ]),
    { name: "Jubilación", Prestacion: Math.round(centralScenario.pensionEstimada), Gastos: Math.round(expenses.total) }
  ];

  return (
    <VerificationContext.Provider value={{ verifiedZeros, toggleVerifiedZero, clearVerifiedZero }}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. BRAND HEADER */}
      <header className="sticky top-0 z-50 bg-[#1A1A1A] text-white border-b border-white/10 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-16 w-14 flex-shrink-0" />
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

        {/* 1. CUESTIONARIO PROFESIONAL AUDITADO (ANCHO COMPLETO) */}
        <QuestionnaireSection 
          formData={formData}
          updateField={updateField}
          updateQuestion={updateQuestion}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expenses={expenses}
          savingsCapacity={savingsCapacity}
        />

        {/* 2. OBJETIVOS Y PROYECTOS DE CAPITALIZACIÓN (ANCHO COMPLETO) */}
        <GoalsSection 
          formData={formData}
          draftGoal={draftGoal}
          setDraftGoal={setDraftGoal}
          addGoal={addGoal}
          removeGoal={removeGoal}
          goalRows={goalRows}
          savingsCapacity={savingsCapacity}
          totalMonthlyGoalAhorro={totalMonthlyGoalAhorro}
          totalMonthlyGoalLineal={totalMonthlyGoalLineal}
          globalGoalStatusDetail={globalGoalStatusDetail}
        />

        {/* 3. LECTURA PROFESIONAL DEL DIAGNÓSTICO (7 TARJETAS) */}
        <DiagnosticCardsSection 
          scores={scores}
          renderThermometer={renderThermometer}
          formData={formData}
          temporaryDisability={temporaryDisability}
          familyNeed={familyNeed}
          survivorBenefits={survivorBenefits}
          liquidity={liquidity}
          debt={debt}
          centralScenario={centralScenario}
          retirementGap={retirementGap}
          metrics={metrics}
          expenses={expenses}
          excessProjectionData={excessProjectionData}
        />

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

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                {/* Keep existing button exact text for backward compatible handlers if any */}
                <button 
                  id="download-professional-pdf"
                  className="flex-1 flex items-center justify-center gap-2 rounded bg-[#C5A566] py-3.5 text-xs font-black uppercase text-white tracking-wider hover:bg-[#A8833F] transition-colors shadow-md"
                >
                  <Download className="h-4 w-4" /> Descargar informe PDF
                </button>
                <button 
                  type="button"
                  id="send-professional-email"
                  onClick={handleSendEmailClick}
                  className="flex-1 flex items-center justify-center gap-2 rounded border border-[#C5A566] py-3.5 text-xs font-black uppercase text-[#C5A566] hover:bg-[#C5A566] hover:text-white transition-colors tracking-wider shadow-md"
                >
                  <Mail className="h-4 w-4" /> Enviar por email
                </button>
              </div>
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
                      s.riesgo === "Bajo" ? "bg-emerald-100 text-emerald-800" :
                      s.riesgo === "Medio" ? "bg-yellow-300 text-black font-semibold shadow-sm" : "bg-red-100 text-red-800"
                    }`}>Riesgo: {s.riesgo}</span>
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

          <div className="bg-amber-50 border border-amber-200 text-white text-xs rounded-lg p-4 space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Info className="h-4 w-4 text-white" /> ¿Por qué se eleva el Gasto de Referencia en Jubilación?
            </p>
            <p className="leading-relaxed">
              En planificación patrimonial profesional, presupuestar la jubilación basándose únicamente en el gasto actual de supervivencia básica (por ejemplo, 1.600 €) es un error crítico. El <strong>gasto de referencia</strong> se calcula aplicando una <strong>tasa de reemplazo idónea del 85% de tus ingresos netos ordinarios actuales</strong> (o tus gastos fijos netos de deudas que ya se habrán amortizado antes de jubilarte, lo que sea mayor).
            </p>
            <p className="leading-relaxed">
              Durante el retiro, disponer de mucho más tiempo libre incrementa de forma natural las necesidades y el presupuesto destinado a ocio, viajes, actividades sociales y cobertura de salud para el cuidado de la dependencia. Además, los escenarios de estrés <strong>Conservador (+10%)</strong> y <strong>Optimista (+20%)</strong> actúan como un margen de seguridad esencial frente a la pérdida acumulada de poder adquisitivo por inflación a lo largo de más de 23 años de jubilación.
            </p>
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
            <BrandLogo className="h-16 w-14 flex-shrink-0" />
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

      {/* GMAIL SEND MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#1A1A1A] border border-[#C5A566]/30 text-white rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-[#C5A566]/10 rounded-full blur-2xl pointer-events-none" />
            
            <button 
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-[#C5A566]" />
              <h3 className="text-md font-black uppercase tracking-wider text-white">Enviar Auditoría por Email</h3>
            </div>

            {!gmailUser ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Para enviar de forma segura la auditoría en formato PDF a tu cliente a través de tu cuenta corporativa, conecta tu Gmail.
                </p>
                <div className="flex justify-center">
                  <button 
                    type="button"
                    onClick={handleGmailLogin}
                    className="gsi-material-button text-xs font-semibold"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper flex items-center justify-center">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">Sign in with Google</span>
                    </div>
                  </button>
                </div>
                {emailStatus?.type === "error" && (
                  <p className="text-xs text-red-400 mt-2">{emailStatus.message}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSendEmailSubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                  <span>Conectado como: <strong className="text-white">{gmailUser.email}</strong></span>
                  <button type="button" onClick={handleGmailLogout} className="text-[#C5A566] hover:underline">Cerrar sesión</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold block">Para:</label>
                  <input 
                    type="email" 
                    required
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="email@cliente.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C5A566]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold block">Asunto:</label>
                  <input 
                    type="text" 
                    disabled
                    value="Auditoría de riesgos financieros y patrimoniales"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold block">Mensaje (con PDF adjunto):</label>
                  <textarea 
                    disabled
                    rows={4}
                    value={`A continuación te adjunto tu auditoría. Quedo a tu disposición para cualquier duda o solventar los riesgos detectados.\n\nUn cordial saludo.`}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-400 cursor-not-allowed resize-none leading-relaxed"
                  />
                </div>

                {emailStatus && (
                  <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                    emailStatus.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    {emailStatus.message}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEmailModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-wider text-slate-300 py-3 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isEmailSending}
                    className="flex-1 bg-[#C5A566] hover:bg-[#A8833F] text-xs font-black uppercase tracking-wider text-white py-3 rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    {isEmailSending ? (
                      <>
                        <span className="animate-pulse">Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" /> Enviar por Gmail
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
    </VerificationContext.Provider>
  );
}
