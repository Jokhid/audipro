export interface AuditQuestions {
  p01: string; // Baja Laboral
  p02: string; // Desgracia Familiar
  p03: string; // Acceso Sanitario
  p04: string; // Motor de la economía
  p05: string; // Jubilación
  p06: string; // Guerra contra la Inflación
  p07: string; // Testamento (Protección legal)
  p08: string; // Acceso familiar (Protección legal)
}

export interface ClientData {
  // Datos personales y de contacto básicos
  nombre: string;
  telefono: string;
  email: string;
  edad: number;
  anosCotizados: number;
  baseCotizacion: number;
  estadoCivil: "Soltero/a" | "Casado/a" | "Divorciado/a" | "Pareja de Hecho" | "Viudo/a";
  numeroHijos: number;
  salarioNetoMensual: number;
  gastosMensuales: number;
  alquilerHipotecaPrestamos: number;
  dineroBanco: number;
  dineroInvertido: number;
  rentabilidadInversion?: number; // Rentabilidad del capital invertido (%)
  ahorroSistematico?: number;     // Planes de ahorro sistemático (€/mes)
  rentabilidadAhorro?: number;    // Rentabilidad del ahorro sistemático (%)
  preguntas: AuditQuestions;
  proyectosMedioPlazo: string;
  objetivosLargoPlazo: string;

  // --- Fase 2: Modelo de datos profesional ampliado ---
  // Datos personales y familiares adicionales
  hijosMenores25: number;
  hijosDependientes: number;
  edadHijos: string; // ej. "8, 12"
  conyugeConIngresos: "Si" | "No" | "Pendiente";
  ingresosConyuge: number;
  dependenciaEconomicaDelCliente: "Alta" | "Media" | "Baja" | "Ninguna";

  // Datos económicos adicionales
  otrosIngresosNetos: number;
  gastoMensualPersonal: number;
  viviendaPrestamosMensual: number;
  gastoMensualTotal?: number; // Calculado
  capacidadAhorroDeclarada: number;
  capacidadAhorroCalculada?: number; // Calculado
  ahorroSistematicoMensual: number;
  rentabilidadAhorroSistematico: number;

  // Datos inmobiliarios
  valorInmuebles: number;
  rentasInmobiliariasMensualesBrutas: number;
  rentasInmobiliariasMensualesNetas: number;
  gastosInmobiliariosMensuales: number;
  impuestosInmobiliariosEstimados: number;
  deudaInmobiliariaPendiente: number;
  rentasInmobiliariasDisponibles: number;
  destinoRentasInmobiliarias: "consumo" | "reinversion" | "mixto" | "desconocido";

  // Datos de deuda
  cuotaHipoteca: number;
  cuotaPrestamos: number;
  cuotaTarjetas: number;
  deudaMensualTotal?: number; // Calculado
  deudaPendienteTotal: number;
  seguroVidaVinculado: "Si" | "No" | "Pendiente";
  capitalSeguroVidaExistente: number;
  capitalSeguroIncapacidadExistente: number;

  // Datos laborales y Seguridad Social
  regimenSeguridadSocial: "General" | "RETA (Autónomos)" | "Otros";
  anosCotizadosActuales: number;
  baseCotizacionActual: number;
  basesCotizacionHistoricasDisponibles: "Si" | "No" | "Pendiente";
  edadJubilacionEstimada: number;
  convenioComplementaBaja: "Si" | "No" | "Pendiente";
  empresaComplementaBaja: "Si" | "No" | "Pendiente";
  seguroPrivadoBaja: "Si" | "No" | "Pendiente";
  subsidioPrivadoDiario: number;
  profesion: string;
  autonomo: boolean;
  contingenciaPreferente: "comun" | "profesional" | "ambas";

  // Datos de orden legal
  tieneTestamento: "Si" | "No" | "Pendiente";
  tienePoderPreventivo: "Si" | "No" | "Pendiente";
  tieneInventarioPatrimonial: "Si" | "No" | "Pendiente";
  familiaConoceDocumentacion: "Si" | "No" | "Pendiente";
  beneficiariosRevisados: "Si" | "No" | "Pendiente";
  protocoloEmergenciaFamiliar: "Si" | "No" | "Pendiente";
}

export interface PrestacionesCalculadas {
  it: number; // Incapacidad Temporal
  ipa: number; // Invalidez Permanente Absoluta
  ipt: number; // Invalidez Permanente Total
  viudedad: number; // Pensión Viudedad
  orfandad: number; // Pensión Orfandad total (para todos los hijos)
  jubilacion: number; // Pensión Jubilación previsible
}

export interface AIAnalysisResult {
  summary: string;
  riskAuditAdvice: {
    incapacidadTemporal: string;
    invalidezAbsoluta: string;
    invalidezTotal: string;
    viudedad: string;
    orfandad: string;
  };
  financialPlanningAdvice: {
    inflationBeatStrategy: string;
    favorableTaxes: string;
    savingsPlan: string;
  };
  actionPlanSteps: Array<{
    step: string;
    priority: "Alta" | "Media" | "Baja";
    impact: string;
    whyNecessary: string;
  }>;
}

