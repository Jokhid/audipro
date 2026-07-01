import { ClientData, PrestacionesCalculadas } from "./types";

export interface Warning {
  type: "critica" | "importante" | "informativa";
  text: string;
}

export function formatCurrency(val: number): string {
  const rounded = Math.round(val || 0);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);
  const str = absVal.toString();
  let result = "";
  let count = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    result = str[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = "." + result;
    }
  }
  return `${isNegative ? "-" : ""}${result} €`;
}

export function formatPercent(val: number): string {
  return `${Number(val).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

export function formatRiskLevel(sev: "grave" | "moderada" | "leve"): string {
  return sev.toUpperCase();
}

// 1. Gasto mensual total
export function calculateMonthlyExpenses(data: ClientData) {
  const personal = Number(data.gastoMensualPersonal !== undefined ? data.gastoMensualPersonal : (data.gastosMensuales || 0));
  
  // Prefer explicitly defined cuotaHipoteca when it is greater than 0, 
  // otherwise fallback to viviendaPrestamosMensual (which represents rent or general housing costs).
  const rentOrMortgage = Number(data.cuotaHipoteca) > 0 
    ? Number(data.cuotaHipoteca) 
    : Number(data.viviendaPrestamosMensual !== undefined ? data.viviendaPrestamosMensual : (data.alquilerHipotecaPrestamos || 0));
    
  const loansAndCards = Number(data.cuotaPrestamos || 0) + Number(data.cuotaTarjetas || 0);
  const housing = rentOrMortgage + loansAndCards;
  const realEstate = Number(data.gastosInmobiliariosMensuales || 0);
  const total = personal + housing;
  return { personal, housing, realEstate, total };
}

// 2. Capacidad real de ahorro
export function calculateRealSavingsCapacity(data: ClientData, rentasNetasDisponibles: number) {
  const gastos = calculateMonthlyExpenses(data).total;
  const ingresosConyuge = data.conyugeConIngresos === "Si" ? Number(data.ingresosConyuge || 0) : 0;
  const ingresosBase = Number(data.salarioNetoMensual || 0) + Number(data.otrosIngresosNetos || 0) + ingresosConyuge;
  
  const sinRentas = Math.max(0, ingresosBase - gastos);
  const conRentas = Math.max(0, ingresosBase + rentasNetasDisponibles - gastos);
  
  // Capacidad prudente: excluye rentas inmobiliarias si destino es desconocido o no reinversion
  const conRentasValidadas = (data.destinoRentasInmobiliarias === "reinversion" || data.destinoRentasInmobiliarias === "mixto") ? conRentas : sinRentas;

  return {
    sinRentas,
    conRentas,
    conRentasValidadas,
    prudente: sinRentas
  };
}

// 3. Ratio de deuda
export function calculateDebtRatios(data: ClientData, rentasNetasDisponibles: number) {
  const deudaMensualTotal = Number(data.cuotaHipoteca || 0) + Number(data.cuotaPrestamos || 0) + Number(data.cuotaTarjetas || 0) || Number(data.viviendaPrestamosMensual || data.alquilerHipotecaPrestamos || 0);
  const salario = Number(data.salarioNetoMensual || 0);
  const ingresosConyuge = data.conyugeConIngresos === "Si" ? Number(data.ingresosConyuge || 0) : 0;
  const baseIngresosReferencia = salario + ingresosConyuge;
  const ingresosTotales = baseIngresosReferencia + rentasNetasDisponibles + Number(data.otrosIngresosNetos || 0);

  const ratioSobreSalario = baseIngresosReferencia > 0 ? deudaMensualTotal / baseIngresosReferencia : 0;
  const ratioSobreIngresosTotales = ingresosTotales > 0 ? deudaMensualTotal / ingresosTotales : 0;

  let diagnostico = "";
  let riesgo: "bajo" | "medio" | "alto" = "bajo";

  if (ratioSobreSalario > 0.35) {
    diagnostico = "Ratio de endeudamiento elevado (superior al 35% de los ingresos ordinarios). Se recomienda amortizar deuda.";
    riesgo = "alto";
  } else if (ratioSobreSalario > 0.20) {
    diagnostico = "Ratio de endeudamiento moderado (entre el 20% y el 35%). Situación controlada pero con margen limitado.";
    riesgo = "medio";
  } else {
    diagnostico = "Ratio de endeudamiento saludable (inferior al 20%). Excelente margen de seguridad financiera.";
    riesgo = "bajo";
  }

  return {
    deudaMensualTotal,
    ratioSobreSalario,
    ratioSobreIngresosTotales,
    diagnostico,
    riesgo
  };
}

// 4. Liquidez / Fondo de emergencia
export function calculateLiquidity(data: ClientData, totalExpenses: number) {
  const dineroBanco = Number(data.dineroBanco || 0);
  const mesesCubiertos = totalExpenses > 0 ? dineroBanco / totalExpenses : 0;

  let nivel: "bajo" | "medio" | "adecuado" | "alto" = "bajo";
  let revisarExceso = false;

  if (mesesCubiertos < 3) {
    nivel = "bajo";
  } else if (mesesCubiertos < 6) {
    nivel = "medio";
  } else if (mesesCubiertos <= 9) {
    nivel = "adecuado";
  } else {
    nivel = "alto";
    revisarExceso = true;
  }

  return {
    dineroBanco,
    mesesCubiertos,
    nivel,
    revisarExceso
  };
}

// 5. Baja laboral (Incapacidad Temporal)
export function calculateTemporaryDisability(data: ClientData, totalExpenses: number) {
  const base = Number(data.baseCotizacion || data.baseCotizacionActual || 2800);
  const tramo60Monto = base * 0.60;
  const tramo75Monto = base * 0.75;

  const tramo60Brecha = Math.max(0, totalExpenses - tramo60Monto);
  const tramo75Brecha = Math.max(0, totalExpenses - tramo75Monto);

  const cobertura60Suficiente = tramo60Brecha === 0;
  const cobertura75Suficiente = tramo75Brecha === 0;

  let diagnostico = "Cobertura insuficiente en el tramo inicial (60%). ";
  if (cobertura75Suficiente && !cobertura60Suficiente) {
    diagnostico = "Cobertura suficiente solo en el tramo del 75%. Existe brecha inicial en contingencia común si no hay complemento de convenio, mejora empresarial o seguro privado.";
  } else if (cobertura75Suficiente && cobertura60Suficiente) {
    diagnostico = "Prestaciones estimadas de la Seguridad Social cubren los gastos mensuales declarados en todos los tramos ordinarios.";
  } else {
    diagnostico = `Déficit de cobertura en ambos tramos ordinarios de baja (brecha de hasta ${formatCurrency(tramo60Brecha)}/mes en el tramo del 60%). Requiere blindaje temporal urgente.`;
  }

  return {
    baseUsada: base,
    tramo60Monto,
    tramo75Monto,
    tramo60Brecha,
    tramo75Brecha,
    cobertura60Suficiente,
    cobertura75Suficiente,
    diagnostico
  };
}

// 6. Incapacidad Permanente
export function calculatePermanentDisability(data: ClientData, totalExpenses: number) {
  const base = Number(data.baseCotizacion || data.baseCotizacionActual || 2800);
  const age = Number(data.edad || 38);

  // IPT (Incapacidad Permanente Total para la profesión habitual)
  const iptMonto = base * 0.55;
  const iptBrecha = Math.max(0, totalExpenses - iptMonto);

  // IPA (Incapacidad Permanente Absoluta para todo trabajo)
  const ipaMonto = base;
  const ipaBrecha = Math.max(0, totalExpenses - ipaMonto);

  const diagnosticoIpt = iptBrecha > 0 
    ? `La Incapacidad Permanente Total para la profesión habitual dejaría un déficit mensual de ${formatCurrency(iptBrecha)} frente a los gastos fijos.`
    : "La cobertura por Incapacidad Permanente Total cubre el nivel de gasto declarado.";

  const diagnosticoIpa = ipaBrecha > 0
    ? `La Incapacidad Permanente Absoluta generaría una brecha de ${formatCurrency(ipaBrecha)} frente a la necesidad fáctica mensual.`
    : "La cobertura por Incapacidad Permanente Absoluta cubre los gastos mensuales actuales.";

  return {
    baseUsada: base,
    iptMonto,
    iptBrecha,
    ipaMonto,
    ipaBrecha,
    diagnosticoIpt,
    diagnosticoIpa
  };
}

// 7. Viudedad y Orfandad
export function calculateSurvivorBenefits(data: ClientData, totalExpenses: number) {
  const base = Number(data.baseCotizacion || data.baseCotizacionActual || 2800);
  const married = data.estadoCivil === "Casado/a" || data.estadoCivil === "Pareja de Hecho";
  const children = typeof data.hijosMenores25 === 'number' ? data.hijosMenores25 : (Number(data.numeroHijos) || 0);

  // Viudedad
  const viudedadMonto = married ? base * 0.52 : 0;
  const viudedadBrechaAislada = Math.max(0, totalExpenses - viudedadMonto);

  // Orfandad (20% por hijo)
  const orfandadMonto = base * 0.20 * children;

  // Escenario familiar conjunto
  const conjuntoMontoSinTope = viudedadMonto + orfandadMonto;
  const conjuntoMonto = Math.min(base, conjuntoMontoSinTope); // Tope legal general al 100% de la base reguladora
  const ingresosConyuge = data.conyugeConIngresos === "Si" ? Number(data.ingresosConyuge || 0) : 0;
  const conjuntoBrechaOSuperavit = (conjuntoMonto + ingresosConyuge) - totalExpenses;
  const esFamiliarCubierto = conjuntoBrechaOSuperavit >= 0;

  return {
    baseUsada: base,
    viudedadMonto,
    viudedadBrechaAislada,
    orfandadMonto,
    conjuntoMonto,
    conjuntoBrechaOSuperavit,
    esFamiliarCubierto
  };
}

// 8. Necesidad de Protección Familiar
export function calculateFamilyProtectionNeed(data: ClientData, conjuntoBrechaOSuperavit: number) {
  const childrenCount = typeof data.hijosMenores25 === 'number' ? data.hijosMenores25 : (Number(data.numeroHijos) || 0);
  const isSingleOrNoPartner = ["Soltero/a", "Viudo/a", "Divorciado/a"].includes(data.estadoCivil);
  const hasNoDependents = childrenCount === 0 && isSingleOrNoPartner;

  if (hasNoDependents) {
    return {
      capitalFamiliarObjetivo: 0,
      segurosExistentes: Number(data.capitalSeguroVidaExistente || 0),
      deficitDeProteccion: 0,
      hasNoDependents: true,
      detalles: {
        deuda: 0,
        transicion: 0,
        educacion: 0,
        rentaNecesaria: 0
      }
    };
  }

  const deudaPendienteTotal = Number(data.deudaPendienteTotal || 0) || Number(data.deudaInmobiliariaPendiente || 0);
  const gastosTransicion = 6000; // Gastos de sepelio, impuestos inmediatos, etc.
  const capitalEducativoHijos = childrenCount * 18000; // Estimar 18k por hijo para estudios superiores
  
  const deficitMensualFamiliar = conjuntoBrechaOSuperavit < 0 ? Math.abs(conjuntoBrechaOSuperavit) : 0;
  const mesesProteccion = 12 * 10; // Proteger 10 años fijos de rentas familiares

  const capitalFamiliarObjetivo = deudaPendienteTotal + gastosTransicion + capitalEducativoHijos + (deficitMensualFamiliar * mesesProteccion);
  const segurosExistentes = Number(data.capitalSeguroVidaExistente || 0);
  const deficitDeProteccion = Math.max(0, capitalFamiliarObjetivo - segurosExistentes);

  return {
    capitalFamiliarObjetivo,
    segurosExistentes,
    deficitDeProteccion,
    hasNoDependents: false,
    detalles: {
      deuda: deudaPendienteTotal,
      transicion: gastosTransicion,
      educacion: capitalEducativoHijos,
      rentaNecesaria: deficitMensualFamiliar * mesesProteccion
    }
  };
}

// 9. Jubilación profesional por escenarios
export interface RetirementScenario {
  name: "Conservador" | "Central" | "Optimista";
  edadActual: number;
  edadJubilacion: number;
  anosHastaJubilacion: number;
  anosCotizadosActuales: number;
  anosCotizadosProyectados: number;
  porcentajeEstimado: number;
  pensionEstimada: number;
  gastoReferencia: number;
  brecha: number;
  capitalNecesario: number;
  fiabilidad: "Baja" | "Media" | "Alta";
  hipotesis: string;
  rentasConsideradas: number;
  otrosIngresos: number;
}

export function calculateRetirementScenarios(data: ClientData, totalExpenses: number): RetirementScenario[] {
  const age = Number(data.edad || 38);
  const yearsCotizados = Number(data.anosCotizados || data.anosCotizadosActuales || 12);
  const base = Number(data.baseCotizacion || data.baseCotizacionActual || 2800);
  
  const targetAge = 67;
  const anosHastaJubilacion = Math.max(0, targetAge - age);
  const anosCotizadosProyectados = yearsCotizados + anosHastaJubilacion;

  // Porcentaje estimado sobre la base reguladora
  const calculateRate = (years: number) => {
    if (years < 15) return 0;
    if (years >= 36.5) return 1.0;
    // de 15 a 36.5 años se cotiza el 50% de la base + un 0.8% adicional por mes o porcentaje lineal hasta llegar al 100%
    return 0.5 + (years - 15) * (0.5 / 21.5);
  };

  const rateCentral = calculateRate(anosCotizadosProyectados);
  
  // En España, la base reguladora se estima dividiendo las bases de cotización de los últimos 25 años por 350 (aprox. el 85.7% de la base mensual actual).
  // La pensión está sujeta al IRPF (estimación del 15% medio de retención para pensiones medias/altas), calculando la pensión neta mensual real.
  const baseReguladora = base * (300 / 350);
  
  const pensionCentralGross = baseReguladora * rateCentral;
  const pensionCentralNet = Math.round(pensionCentralGross * 0.85);

  const anosCotizadosConservador = Math.max(yearsCotizados, Math.round(anosCotizadosProyectados * 0.8));
  const rateConservador = calculateRate(anosCotizadosConservador);
  const pensionConservadorGross = (baseReguladora * 0.85) * rateConservador;
  const pensionConservadorNet = Math.round(pensionConservadorGross * 0.85);

  const pensionOptimistaGross = (baseReguladora * 1.15) * Math.max(1.0, calculateRate(anosCotizadosProyectados + 2));
  const pensionOptimistaNet = Math.round(pensionOptimistaGross * 0.85);

  // El gasto de referencia excluye deudas que se habrán amortizado antes de jubilarse (hipoteca, préstamos, tarjetas)
  // y se basa en una tasa de reemplazo idónea del 85% del salario neto para mantener el nivel de vida, o cubrir holgadamente gastos fijos remanentes.
  const deudasAmortizables = Number(data.cuotaHipoteca || 0) + Number(data.cuotaPrestamos || 0) + Number(data.cuotaTarjetas || 0);
  const coreExpenses = Math.max(0, totalExpenses - deudasAmortizables);
  const salarioNeto = Number(data.salarioNetoMensual || totalExpenses || 2400);
  const gastoReferenciaCentral = Math.max(coreExpenses, Math.round(salarioNeto * 0.85));

  // Rentas inmobiliarias y otros ingresos considerados
  const rentasNetasDisponibles = data.destinoRentasInmobiliarias !== "desconocido" ? Number(data.rentasInmobiliariasMensualesNetas || 0) : 0;
  const rentasConsumibles = (data.destinoRentasInmobiliarias === "consumo" || data.destinoRentasInmobiliarias === "mixto")
    ? rentasNetasDisponibles
    : 0;
  const otrosIngresos = Number(data.otrosIngresosNetos || 0);
  const ingresosExtraJubilacion = rentasConsumibles + otrosIngresos;

  const gastoConservador = Math.round(gastoReferenciaCentral * 1.1);
  const brechaConservador = Math.max(0, gastoConservador - (pensionConservadorNet + ingresosExtraJubilacion));

  const gastoCentral = gastoReferenciaCentral;
  const brechaCentral = Math.max(0, gastoCentral - (pensionCentralNet + ingresosExtraJubilacion));

  const gastoOptimista = Math.round(gastoReferenciaCentral * 1.2);
  const brechaOptimista = Math.max(0, gastoOptimista - (pensionOptimistaNet + ingresosExtraJubilacion));

  return [
    {
      name: "Conservador",
      edadActual: age,
      edadJubilacion: 67,
      anosHastaJubilacion,
      anosCotizadosActuales: yearsCotizados,
      anosCotizadosProyectados: anosCotizadosConservador,
      porcentajeEstimado: rateConservador * 100,
      pensionEstimada: pensionConservadorNet,
      gastoReferencia: gastoConservador,
      brecha: brechaConservador,
      capitalNecesario: brechaConservador * 12 * 23,
      fiabilidad: "Baja",
      hipotesis: "Lagunas de cotización futuras, base de cotización reducida e impacto de la inflación acumulada del 10% en gastos.",
      rentasConsideradas: rentasConsumibles,
      otrosIngresos
    },
    {
      name: "Central",
      edadActual: age,
      edadJubilacion: 67,
      anosHastaJubilacion,
      anosCotizadosActuales: yearsCotizados,
      anosCotizadosProyectados,
      porcentajeEstimado: rateCentral * 100,
      pensionEstimada: pensionCentralNet,
      gastoReferencia: gastoCentral,
      brecha: brechaCentral,
      capitalNecesario: brechaCentral * 12 * 23,
      fiabilidad: "Media",
      hipotesis: "Continuidad laboral manteniendo la base actual, con pensión neta estimada tras un 15% de IRPF medio.",
      rentasConsideradas: rentasConsumibles,
      otrosIngresos
    },
    {
      name: "Optimista",
      edadActual: age,
      edadJubilacion: 67,
      anosHastaJubilacion,
      anosCotizadosActuales: yearsCotizados,
      anosCotizadosProyectados: Math.max(37, anosCotizadosProyectados),
      porcentajeEstimado: Math.max(1.0, rateCentral) * 100,
      pensionEstimada: pensionOptimistaNet,
      gastoReferencia: gastoOptimista,
      brecha: brechaOptimista,
      capitalNecesario: brechaOptimista * 12 * 23,
      fiabilidad: "Alta",
      hipotesis: "Crecimiento profesional y base reguladora un 15% superior, proyectando un nivel de gastos premium (120%).",
      rentasConsideradas: rentasConsumibles,
      otrosIngresos
    }
  ];
}

// 10. Brecha de jubilación ajustada
export function calculateRetirementGap(
  data: ClientData,
  pensionEstimada: number,
  rentasNetasDisponibles: number,
  totalExpenses: number
) {
  // El gasto de referencia en jubilación excluye deudas que se habrán amortizado antes de jubilarse (hipoteca, préstamos, tarjetas)
  const deudasAmortizables = Number(data.cuotaHipoteca || 0) + Number(data.cuotaPrestamos || 0) + Number(data.cuotaTarjetas || 0);
  const coreExpenses = Math.max(0, totalExpenses - deudasAmortizables);
  const salarioNeto = Number(data.salarioNetoMensual || totalExpenses || 2400);
  const gastoJubilacionReferencia = Math.max(coreExpenses, Math.round(salarioNeto * 0.85));

  // Si las rentas inmobiliarias se destinan a reinversión, no reducen la brecha de gasto de jubilación ya que se acumulan en el patrimonio general.
  const rentasConsumibles = (data.destinoRentasInmobiliarias === "consumo" || data.destinoRentasInmobiliarias === "mixto")
    ? rentasNetasDisponibles
    : 0;

  const ingresosJubilacion = pensionEstimada + rentasConsumibles + Number(data.otrosIngresosNetos || 0);
  const brechaMensual = Math.max(0, gastoJubilacionReferencia - ingresosJubilacion);
  const targetCapital = brechaMensual * 12 * 23; // esperanza de vida 90 años fijos

  const age = Number(data.edad || 38);
  const targetAge = 67;
  const yearsToRetirement = Math.max(1, targetAge - age);
  const rentabilidadAnual = Number(data.rentabilidadAhorroSistematico || 6);
  const n = Math.max(1, yearsToRetirement * 12);
  const r = (rentabilidadAnual / 100) / 12;

  let recommendedSaving = targetCapital / n;
  if (r > 0) {
    recommendedSaving = (targetCapital * r) / (Math.pow(1 + r, n) - 1);
  }

  return {
    gastoReferencia: gastoJubilacionReferencia,
    pensionEstimada,
    rentasConsideradas: rentasConsumibles,
    otrosIngresos: Number(data.otrosIngresosNetos || 0),
    brechaMensual,
    añosRetiro: 23,
    capitalObjetivo: targetCapital,
    recommendedSaving
  };
}

// 11. Esfuerzo mensual y objetivos de ahorro (lineal vs financiero)
export function calculateSavingsGoal(capitalObjetivo: number, yearsToRetirement: number, rentabilidadAnual: number) {
  const n = Math.max(1, yearsToRetirement * 12);
  const r = (rentabilidadAnual / 100) / 12;

  const aportacionLineal = capitalObjetivo / n;
  let aportacionFinanciera = aportacionLineal;

  if (r > 0) {
    aportacionFinanciera = (capitalObjetivo * r) / (Math.pow(1 + r, n) - 1);
  }

  return {
    aportacionLineal,
    aportacionFinanciera,
    ahorroRecomendado: aportacionFinanciera
  };
}

// 12. Puntuaciones de seguridad (Fase 12)
export function calculateSecurityScores(data: ClientData, metrics: any) {
  const clampScore = (v: number) => Math.min(10, Math.max(0, Math.round(v)));

  // Fondo de emergencia
  const meses = metrics.liquidity.mesesCubiertos;
  const fondo = clampScore(meses < 2 ? 2 : meses < 3 ? 4 : meses < 6 ? 7 : 10);

  // Baja laboral (Incapacidad Temporal)
  let bajaBase = data.preguntas.p01 === "Si" ? 10 : data.preguntas.p01 === "Parcialmente" ? 6 : 2;
  if (data.convenioComplementaBaja === "Si" || data.empresaComplementaBaja === "Si" || data.seguroPrivadoBaja === "Si") {
    bajaBase += 2;
  }
  if (data.autonomo || data.regimenSeguridadSocial === "RETA (Autónomos)") {
    bajaBase -= 1; // autónomos tienen mayor vulnerabilidad estructural
  }
  // Si las prestaciones públicas en el tramo más desfavorable (60%) cubren plenamente los gastos fijos, la seguridad es absoluta (10/10)
  if (metrics.temporaryDisability && metrics.temporaryDisability.tramo60Brecha === 0) {
    bajaBase = 10;
  } else if (metrics.temporaryDisability && metrics.temporaryDisability.tramo75Brecha === 0) {
    bajaBase = Math.max(bajaBase, 8);
  }
  const baja = clampScore(bajaBase);

  // Incapacidad Permanente
  const iptGap = metrics.disability.iptBrecha;
  const ipaGap = metrics.disability.ipaBrecha;
  let incapacidadBase = 10;
  if (iptGap > 500) incapacidadBase -= 4;
  else if (iptGap > 0) incapacidadBase -= 2;
  if (ipaGap > 500) incapacidadBase -= 3;
  if (data.capitalSeguroIncapacidadExistente > 0) incapacidadBase += 2;
  const incapacidad = clampScore(incapacidadBase);

  // Protección familiar
  const defProteccion = metrics.familyNeed.deficitDeProteccion;
  let familiaBase = 10;
  const isSingleOrNoPartner = ["Soltero/a", "Viudo/a", "Divorciado/a"].includes(data.estadoCivil);
  const childrenCountScore = typeof data.hijosMenores25 === 'number' ? data.hijosMenores25 : (Number(data.numeroHijos) || 0);
  const hasNoDependents = childrenCountScore === 0 && isSingleOrNoPartner;

  if (hasNoDependents) {
    familiaBase = 10;
  } else {
    const hasChildren = childrenCountScore > 0;
    if (hasChildren) {
      if (defProteccion > 150000) familiaBase = 2;
      else if (defProteccion > 50000) familiaBase = 5;
      else if (defProteccion > 0) familiaBase = 7;
    } else {
      if (defProteccion > 50000) familiaBase = 6;
    }
    if (data.preguntas.p02 === "Si") familiaBase = Math.max(familiaBase, 8);
  }
  const familia = clampScore(familiaBase);

  // Deuda / Apalancamiento
  const ratioDeuda = metrics.debt.ratioSobreSalario;
  let deudaBase = 10;
  if (ratioDeuda > 0.45) deudaBase = 1;
  else if (ratioDeuda > 0.35) deudaBase = 3;
  else if (ratioDeuda > 0.20) deudaBase = 6;
  else if (ratioDeuda > 0.10) deudaBase = 8;
  const deuda = clampScore(deudaBase);

  // Jubilación
  const gapJub = metrics.retirementGap.brechaMensual;
  let jubilacionBase = 10;
  if (gapJub > 1500) jubilacionBase = 2;
  else if (gapJub > 800) jubilacionBase = 5;
  else if (gapJub > 0) jubilacionBase = 7;
  if (data.preguntas.p05 === "Si") jubilacionBase = Math.max(jubilacionBase, 8);
  const jubilacion = clampScore(jubilacionBase);

  // Patrimonio e Inflación
  let inflacionBase = data.preguntas.p06 === "Si" ? 10 : 3;
  if (Number(data.dineroInvertido || 0) > Number(data.dineroBanco || 0)) inflacionBase += 2;
  if (Number(data.rentabilidadInversion || 0) > 4) inflacionBase += 1;

  // Ajustes basados en la realidad patrimonial y rentas
  const projectedTotal = metrics?.estate?.projectedTotal || 0;
  const capitalObjetivo = metrics?.retirementGap?.capitalObjetivo || 0;

  if (projectedTotal >= 2000000) {
    inflacionBase = Math.max(inflacionBase, 10);
  } else if (projectedTotal >= 1000000) {
    inflacionBase = Math.max(inflacionBase, 9);
  } else if (projectedTotal >= 500000) {
    inflacionBase = Math.max(inflacionBase, 8);
  } else if (projectedTotal >= 250000) {
    inflacionBase = Math.max(inflacionBase, 6);
  }

  // Si supera su capital objetivo de jubilación por al menos el 110% (1.10), alcanza el 10/10
  if (capitalObjetivo > 0 && projectedTotal >= capitalObjetivo * 1.1) {
    inflacionBase = Math.max(inflacionBase, 10);
  } else if (capitalObjetivo > 0 && projectedTotal >= capitalObjetivo) {
    inflacionBase = Math.max(inflacionBase, 8);
  }

  const inflacion = clampScore(inflacionBase);

  // Orden legal y sucesorio
  let legalCount = 0;
  if (data.tieneTestamento === "Si") legalCount += 2;
  if (data.tienePoderPreventivo === "Si") legalCount += 1.5;
  if (data.tieneInventarioPatrimonial === "Si") legalCount += 1.5;
  if (data.familiaConoceDocumentacion === "Si") legalCount += 2;
  if (data.beneficiariosRevisados === "Si") legalCount += 1.5;
  if (data.protocoloEmergenciaFamiliar === "Si") legalCount += 1.5;
  const legal = clampScore(legalCount);

  // Global score (0-10)
  const globalScore = Math.round((fondo + baja + incapacidad + familia + deuda + jubilacion + inflacion + legal) / 8);

  return {
    fondo,
    baja,
    incapacidad,
    familia,
    deuda,
    jubilacion,
    inflacion,
    legal,
    globalScore
  };
}

// 13. Validaciones de consistencia de Fase 4
export function validateReportConsistency(data: ClientData): Warning[] {
  const warnings: Warning[] = [];

  // 1. Ratio de deuda
  const ratioDeuda = Number(data.salarioNetoMensual) > 0 ? (Number(data.cuotaHipoteca || 0) + Number(data.cuotaPrestamos || 0) + Number(data.cuotaTarjetas || 0) || Number(data.viviendaPrestamosMensual || data.alquilerHipotecaPrestamos || 0)) / Number(data.salarioNetoMensual) : 0;
  if (ratioDeuda < 0.35 && data.preguntas.p04 === "No") {
    // Si no supera el 35% pero la pregunta o alguna regla marca deuda como crítica, advertencia
  }

  // 2. Rentas inmobiliarias brute vs net
  if (Number(data.rentasInmobiliariasMensualesBrutas || 0) > 0 && Number(data.rentasInmobiliariasMensualesNetas || 0) === 0) {
    warnings.push({
      type: "importante",
      text: "Confirmar si las rentas inmobiliarias son brutas o netas. Se ha utilizado estimación neta conservadora."
    });
  }

  // 3. Capacidad de ahorro vs rentas
  if (Number(data.rentasInmobiliariasMensualesBrutas || data.rentasInmobiliariasMensualesNetas || 0) > 0) {
    warnings.push({
      type: "informativa",
      text: "La capacidad de ahorro ordinaria se calcula con salario. Confirmar si las rentas inmobiliarias están disponibles para ahorro sistemático, consumo corriente o amortización acelerada."
    });
  }

  // 4. Cotización inferior a 15 años
  const cotizados = Number(data.anosCotizados || data.anosCotizadosActuales || 0);
  if (cotizados < 15) {
    warnings.push({
      type: "critica",
      text: "El cliente ha cotizado menos de 15 años. Actualmente no existe un derecho ordinario consolidado a la pensión contributiva de jubilación en España."
    });
  }

  // 5. Jubilación proyectada como escenario
  if (Math.max(0, 67 - Number(data.edad || 38)) > 0) {
    warnings.push({
      type: "informativa",
      text: "La pensión de jubilación proyectada es una estimación sujeta a continuidad laboral de años futuros y no representa un derecho consolidado cierto."
    });
  }

  // 6. Baja laboral tramo 60% vs 75%
  const base = Number(data.baseCotizacion || data.baseCotizacionActual || 2800);
  const totalGasto = calculateMonthlyExpenses(data).total;
  if (base * 0.75 >= totalGasto && base * 0.60 < totalGasto) {
    warnings.push({
      type: "importante",
      text: "Baja laboral: Cobertura parcial. Suficiente solo en el tramo ordinario del 75% (a partir del día 21). Existe una brecha inicial importante en contingencia común."
    });
  }

  // 7. Familia conjunta
  const hasChildrenWarn = (typeof data.hijosMenores25 === 'number' ? data.hijosMenores25 : (Number(data.numeroHijos) || 0)) > 0;
  if (hasChildrenWarn && (data.estadoCivil === "Casado/a" || data.estadoCivil === "Pareja de Hecho")) {
    warnings.push({
      type: "informativa",
      text: "Análisis conjunto de viudedad y orfandad activado: la estimación del subsidio familiar suma ambas coberturas públicas bajo el límite del 100% de la base reguladora."
    });
  }

  // 8. Destino de rentas inmobiliarias en proyección
  if (Number(data.rentasInmobiliariasMensualesBrutas || data.rentasInmobiliariasMensualesNetas || 0) > 0 && data.destinoRentasInmobiliarias === "desconocido") {
    warnings.push({
      type: "importante",
      text: "Destino de rentas inmobiliarias desconocido. No se sumarán automáticamente al patrimonio proyectado a los 67 años por prudencia técnica."
    });
  }

  // 9. Rentabilidad y cálculo lineal vs financiero
  if (Number(data.rentabilidadInversion || 0) > 0 || Number(data.rentabilidadAhorro || 0) > 0) {
    warnings.push({
      type: "informativa",
      text: "La proyección patrimonial asume rentabilidad compuesto constante. La rentabilidad real fluctuará y no está garantizada."
    });
  }

  // 10. Datos pendientes de validar
  const pendingFields: string[] = [];
  if (data.convenioComplementaBaja === "Pendiente") pendingFields.push("Convenio de baja laboral");
  if (data.empresaComplementaBaja === "Pendiente") pendingFields.push("Mejora empresarial por IT");
  if (data.seguroPrivadoBaja === "Pendiente") pendingFields.push("Seguros privados de baja o vida");
  if (data.tieneTestamento === "Pendiente") pendingFields.push("Testamento o voluntades");
  if (data.deudaPendienteTotal === 0 && (Number(data.cuotaHipoteca || 0) > 0 || Number(data.cuotaPrestamos || 0) > 0)) {
    pendingFields.push("Saldo de deuda pendiente total");
  }

  if (pendingFields.length > 0) {
    warnings.push({
      type: "importante",
      text: `Datos pendientes de verificar por el asesor: ${pendingFields.join(", ")}.`
    });
  }

  return warnings;
}

// 14. Generar plan de acción priorizado
export function generateActionPlan(data: ClientData, metrics: any) {
  const steps: Array<{
    step: string;
    priority: "Alta" | "Media" | "Baja";
    impact: string;
    whyNecessary: string;
  }> = [];

  // Urgentes / Alta Prioridad
  if (metrics.liquidity.mesesCubiertos < 3) {
    steps.push({
      step: "Constitución de Fondo de Emergencia Primario",
      priority: "Alta",
      impact: "Creación de red de seguridad inmediata líquida de al menos 3 a 6 meses de gastos.",
      whyNecessary: "Evita tener que recurrir a deuda rápida o malvender inversiones ante un imprevisto básico."
    });
  }

  const isAutonomo = data.regimenSeguridadSocial === "RETA (Autónomos)";

  if (isAutonomo && (metrics.temporaryDisability.tramo60Brecha > 0 || metrics.temporaryDisability.tramo75Brecha > 0)) {
    steps.push({
      step: "Contratación de Seguro de Subsidio por Incapacidad Temporal",
      priority: "Alta",
      impact: "Cobertura de la brecha de ingresos mensuales en caso de baja médica prolongada.",
      whyNecessary: `La baja de la S.S. deja un déficit mensual de hasta ${formatCurrency(metrics.temporaryDisability.tramo60Brecha)}/mes que desequilibraría el hogar.`
    });
  }

  if (metrics.familyNeed.deficitDeProteccion > 20000) {
    steps.push({
      step: "Aseguramiento de Capital Familiar Objetivo (Vida)",
      priority: "Alta",
      impact: `Garantiza un capital exento de ${formatCurrency(metrics.familyNeed.deficitDeProteccion)} en caso de desgracia familiar.`,
      whyNecessary: "Permite amortizar deudas pendientes, costear estudios de los hijos y dar estabilidad financiera de transición al cónyuge."
    });
  }

  // Importantes / Media Prioridad
  if (metrics.retirementGap.brechaMensual > 0) {
    steps.push({
      step: "Planificación Sistemática de la Brecha de Jubilación",
      priority: "Media",
      impact: `Acumulación del capital objetivo de ${formatCurrency(metrics.retirementGap.capitalObjetivo)} mediante ahorro periódico indexado.`,
      whyNecessary: `La pensión pública estimada deja una brecha mensual de ${formatCurrency(metrics.retirementGap.brechaMensual)} hasta la esperanza de vida de 90 años.`
    });
  }

  if (data.tieneTestamento !== "Si" || data.tienePoderPreventivo !== "Si") {
    steps.push({
      step: "Formalización de Testamento Abierto y Poder Preventivo Notarial",
      priority: "Media",
      impact: "Optimización y simplificación absoluta del proceso legal de sucesión o incapacidad de gestión.",
      whyNecessary: "Evita litigios costosos, bloqueos de cuentas bancarias de forma inmediata y demoras judiciales críticas para los herederos."
    });
  }

  // Optimización / Baja Prioridad
  if (metrics.liquidity.mesesCubiertos > 9) {
    steps.push({
      step: "Canalización de Exceso de Liquidez Improductiva",
      priority: "Baja",
      impact: "Inversión de capital ocioso en carteras diversificadas para batir la inflación anual.",
      whyNecessary: "El dinero en cuenta corriente pierde poder adquisitivo real debido al efecto silencioso de la inflación."
    });
  }

  if (data.tieneInventarioPatrimonial !== "Si" || data.familiaConoceDocumentacion !== "Si") {
    steps.push({
      step: "Redacción del Protocolo Documental de Emergencia Familiar",
      priority: "Baja",
      impact: "Centralización de claves, pólizas de seguros, inventario de bienes y contactos de asesores.",
      whyNecessary: "La planificación pierde un 80% de eficacia práctica si en momentos de máxima crisis familiar nadie sabe dónde está la información."
    });
  }

  return steps;
}
