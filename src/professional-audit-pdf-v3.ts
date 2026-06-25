import { jsPDF } from 'jspdf';

const FLAG = '__auditProfessionalPdfV3Installed';
const BLACK = [26, 26, 26] as const;
const SLATE = [15, 23, 42] as const;
const MUTED = [71, 85, 105] as const;
const BORDER = [226, 232, 240] as const;
const LIGHT = [248, 250, 252] as const;
const GOLD = [197, 165, 102] as const;
const RED = [220, 38, 38] as const;
const GREEN = [22, 163, 74] as const;
const ORANGE = [249, 115, 22] as const;

const M = 14;
const W = 182;

interface PageState {
  page: number;
  y: number;
  title: string;
}

// Utility formatting functions
function clean(val: string) { return String(val || '').replace(/\s+/g, ' ').trim(); }
function slug(val: string) { return clean(val).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cliente'; }
function money(val: number) { return `${Math.round(val || 0).toLocaleString('es-ES')} €`; }
function percent(val: number) { return `${Number(val || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`; }

// Page decorations
function pageHeader(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Custom logo mark drawing
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 6, 2, 18, 'F');
  doc.rect(30, 6, 2, 18, 'F');
  doc.rect(21, 6, 2, 7, 'F');
  doc.rect(21, 17, 2, 7, 'F');
  doc.setFillColor(...GOLD);
  doc.circle(22, 15, 3.5, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('JOSÉ CARLOS HIDALGO', 38, 11);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(subtitle.toUpperCase(), 38, 18);
  doc.setTextColor(220, 220, 220);
  doc.text('josecarlos@hilolegal.es | 647 50 60 40', 38, 25);
}

function footer(doc: jsPDF, page: number) {
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Informe de Auditoría Patrimonial Certificada. Confidencial y personalizado.', 14, 287);
  doc.text(`Página ${page}`, 196, 287, { align: 'right' });
}

function newPage(doc: jsPDF, state: PageState, title: string) {
  if (state.page > 1) {
    footer(doc, state.page);
    doc.addPage();
    state.page++;
  }
  state.title = title;
  state.y = 42;
  pageHeader(doc, title);
}

function ensureSpace(doc: jsPDF, state: PageState, needed = 20) {
  if (state.y + needed <= 276) return;
  newPage(doc, state, state.title);
}

function heading(doc: jsPDF, state: PageState, text: string, size = 11) {
  ensureSpace(doc, state, 15);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(...SLATE);
  doc.text(text.toUpperCase(), M, state.y);
  state.y += size * 0.4 + 4;
}

function paragraph(doc: jsPDF, state: PageState, text: string, size = 8.2) {
  const lines = doc.splitTextToSize(clean(text), W) as string[];
  ensureSpace(doc, state, lines.length * 4.2 + 5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...MUTED);
  doc.text(lines, M, state.y);
  state.y += lines.length * 4.2 + 4;
}

function sectionDivider(doc: jsPDF, state: PageState) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, state.y, M + 35, state.y);
  state.y += 6;
}

// Table cell drawers
function drawTable(
  doc: jsPDF,
  state: PageState,
  headers: string[],
  widths: number[],
  rowsData: string[][],
  alignments: ("left" | "right" | "center")[] = []
) {
  ensureSpace(doc, state, 15);
  const startY = state.y;
  let x = M;

  // Header
  doc.setFillColor(...BLACK);
  doc.roundedRect(M, startY, W, 8, 1.5, 1.5, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  
  headers.forEach((h, i) => {
    const align = alignments[i] || 'left';
    const tx = align === 'right' ? x + widths[i] - 3 : align === 'center' ? x + widths[i]/2 : x + 3;
    doc.text(h, tx, startY + 5.5, { align });
    x += widths[i];
  });
  state.y += 8.5;

  // Rows
  rowsData.forEach((row, rowIndex) => {
    ensureSpace(doc, state, 9);
    x = M;
    doc.setFillColor(rowIndex % 2 ? 255 : 248, rowIndex % 2 ? 255 : 250, rowIndex % 2 ? 255 : 252);
    doc.setDrawColor(...BORDER);
    doc.rect(M, state.y, W, 8, 'FD');

    row.forEach((val, i) => {
      const align = alignments[i] || 'left';
      const tx = align === 'right' ? x + widths[i] - 3 : align === 'center' ? x + widths[i]/2 : x + 3;
      doc.setFont('Helvetica', i === 0 ? 'bold' : 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...SLATE);

      // Status styling logic for viabilidad, prioridad, etc.
      if (val === 'Viable' || val === 'Cubierto' || val === 'Alta' || val === 'Bajo' || val === 'Leve') {
        doc.setFont('Helvetica', 'bold');
        if (val === 'Viable' || val === 'Cubierto' || val === 'Bajo' || val === 'Leve') doc.setTextColor(...GREEN);
        if (val === 'Alta') doc.setTextColor(...RED);
      } else if (val === 'Ajustado' || val === 'Media' || val === 'Moderada' || val === 'Pendiente') {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...ORANGE);
      } else if (val === 'No viable' || val === 'Alto' || val === 'Grave' || val === 'Baja') {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...RED);
      }

      const txtLine = doc.splitTextToSize(val, widths[i] - 5).slice(0, 1);
      doc.text(txtLine, tx, state.y + 5.5, { align });
      x += widths[i];
    });
    state.y += 8;
  });
  state.y += 4;
}

// -------------------------------------------------------------
// MAIN GENERATOR
// -------------------------------------------------------------
async function generatePdf() {
  const dataContainer = (window as any).currentAuditData;
  if (!dataContainer) {
    throw new Error('No se encontró el modelo de datos de la auditoría. Recarga y vuelve a intentarlo.');
  }

  const { formData, projects, metrics, scores, warnings, actionPlan, retirementScenarios } = dataContainer;
  const clientName = formData.nombre || 'Cliente';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const state: PageState = { page: 1, y: 42, title: '' };

  // ==========================================
  // PAGE 1: PORTADA PREMIUM (Fase 13.1)
  // ==========================================
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, 210, 297, 'F');

  // Gold side margin accents
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 6, 297, 'F');
  doc.rect(204, 0, 6, 297, 'F');

  // Central decorative grid
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(20, 110, 190, 110);
  doc.line(20, 220, 190, 220);

  // Big geometric shield
  doc.setFillColor(35, 35, 35);
  doc.roundedRect(60, 40, 90, 45, 4, 4, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.roundedRect(60, 40, 90, 45, 4, 4, 'D');

  // Custom visual brand inside shield
  doc.setFillColor(255, 255, 255);
  doc.rect(82, 50, 4, 25, 'F');
  doc.rect(124, 50, 4, 25, 'F');
  doc.rect(98, 50, 4, 10, 'F');
  doc.rect(98, 65, 4, 10, 'F');
  doc.circle(105, 62.5, 9, 'F');
  doc.setFillColor(...GOLD);
  doc.circle(105, 62.5, 6, 'F');

  // Titles
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(255, 255, 255);
  doc.text('AUDITORÍA PATRIMONIAL', 105, 135, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(...GOLD);
  doc.text('INFORME ESTRATÉGICO PROFESIONAL', 105, 146, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 180, 180);
  doc.text('PREVISIÓN SOCIAL • BLINDAJE FAMILIAR • JUBILACIÓN • ORDEN SUCESORIO', 105, 155, { align: 'center' });

  // Client Details Card
  doc.setFillColor(28, 28, 28);
  doc.roundedRect(25, 175, 160, 36, 3, 3, 'F');
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.4);
  doc.roundedRect(25, 175, 160, 36, 3, 3, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('DATOS DE LA CONSULTORÍA', 32, 183);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(220, 220, 220);
  doc.text(`CLIENTE: ${clientName.toUpperCase()}`, 32, 191);
  doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-ES')}`, 32, 197);
  doc.text(`TIPO DE INFORME: Auditoría de Seguridad Financiera de Alto Impacto`, 32, 203);

  // Adviser stamp
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('JOSÉ CARLOS HIDALGO', 105, 238, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('Consultor de Previsión Social e Intermediario Hipotecario Certificado', 105, 244, { align: 'center' });
  doc.setTextColor(150, 150, 150);
  doc.text('Email: josecarlos@hilolegal.es   |   Teléfono: 647 50 60 40', 105, 250, { align: 'center' });

  // Seal of Quality
  doc.setFillColor(28, 28, 28);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.circle(105, 269, 10, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text('CERTIFICADA', 105, 268.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setTextColor(...GOLD);
  doc.text('PREMIUM', 105, 271.5, { align: 'center' });

  // ==========================================
  // PAGE 2: RESUMEN EJECUTIVO (Fase 13.2)
  // ==========================================
  newPage(doc, state, 'Resumen Ejecutivo y Fotografía Inicial');
  heading(doc, state, '1. RESUMEN EJECUTIVO Y CALIFICACIÓN GLOBAL');
  paragraph(doc, state, 'La calificación sintética de seguridad mide la robustez de las finanzas personales frente a sucesos sobrevenidos como bajas médicas prolongadas, fallecimiento familiar, sobreapalancamiento o brechas de retiro.');
  sectionDivider(doc, state);

  // Big Score Card
  ensureSpace(doc, state, 24);
  const scoreY = state.y;
  doc.setFillColor(...BLACK);
  doc.roundedRect(M, scoreY, 60, 20, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('SEGURIDAD GLOBAL', M + 4, scoreY + 6);
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(`${scores.globalScore} / 10`, M + 4, scoreY + 16);

  // Summary box
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M + 65, scoreY, 117, 20, 2, 2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.text('RECOMENDACIÓN GENERAL DEL ASESOR:', M + 69, scoreY + 5.5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  const recTxt = `Con un puntaje global de ${scores.globalScore}/10, la planificación patrimonial de ${clientName} presenta áreas de vulnerabilidad crítica en protección por baja laboral y cobertura familiar que deben reforzarse con prioridad alta.`;
  doc.text(doc.splitTextToSize(recTxt, 110), M + 69, scoreY + 10);
  state.y += 24;

  // 3 Risks & 3 Priorities
  heading(doc, state, 'RIESGOS CRÍTICOS Y PRIORIDADES', 9.5);
  const infoY = state.y;
  // Left: Risks
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(M, infoY, 88, 30, 2, 2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...RED);
  doc.text('TRES RIESGOS PRINCIPALES IDENTIFICADOS', M + 4, infoY + 5.5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...BLACK);
  doc.text(`1. Déficit inicial en baja temporal de ${money(metrics.temporaryDisability.tramo60Brecha)}/mes.`, M + 4, infoY + 11);
  doc.text(`2. Ausencia de actas legales críticas (Testamento e Inventario).`, M + 4, infoY + 16);
  doc.text(`3. Brecha de jubilación fáctica acumulada de ${money(metrics.retirementGap.capitalObjetivo)}.`, M + 4, infoY + 21);

  // Right: Priorities
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(153, 246, 228);
  doc.roundedRect(M + 94, infoY, 88, 30, 2, 2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN);
  doc.text('TRES PRIORIDADES RECOMENDADAS', M + 98, infoY + 5.5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...BLACK);
  doc.text('1. Contratar seguro de subsidio por incapacidad temporal.', M + 98, infoY + 11);
  doc.text('2. Formalizar testamento abierto y poder preventivo notarial.', M + 98, infoY + 16);
  doc.text(`3. Incrementar el ahorro sistemático a ${money(metrics.retirementGap.recommendedSaving)}/mes.`, M + 98, infoY + 21);
  state.y += 34;

  // Client data table
  heading(doc, state, 'DATOS RECOPILADOS DEL CLIENTE', 9.5);
  const clientRows = [
    ['Nombre del cliente', clientName, 'Verificado', 'Identificación básica'],
    ['Edad actual / Años cotizados', `${formData.edad} años / ${formData.anosCotizadosActuales} años`, 'Verificado', 'Determina tramo regulador jubilación'],
    ['Base de cotización declarada', money(formData.baseCotizacionActual), 'Verificado', 'Base de cálculo prestaciones públicas'],
    ['Estado civil / Hijos menores', `${formData.estadoCivil} / ${formData.hijosMenores25} hijos`, 'Verificado', 'Afecta coberturas familiares directas'],
    ['Salario Neto Ordinario', `${money(formData.salarioNetoMensual)} / mes`, 'Verificado', 'Límite de capacidad familiar fáctica'],
    ['Dinero en Banco (Líquido)', money(formData.dineroBanco), 'Verificado', 'Colchón primario de emergencias'],
    ['Patrimonio Inmobiliario', money(formData.valorInmuebles), 'Verificado', 'Valor de tasación de activos fijos'],
    ['Destino de Rentas Inmobiliarias', formData.destinoRentasInmobiliarias.toUpperCase(), 'Pendiente', 'Afecta proyección de jubilación prudente']
  ];
  drawTable(doc, state, ['DATO DE LA AUDITORÍA', 'VALOR REGISTRADO', 'ESTADO', 'OBSERVACIÓN DEL ASESOR'], [50, 42, 25, 65], clientRows);

  // ==========================================
  // PAGE 3: FOTOGRAFÍA FINANCIERA & OBJETIVOS (Fase 13.5 & 13.6)
  // ==========================================
  newPage(doc, state, 'Fotografía Financiera y Objetivos');
  heading(doc, state, '2. FOTOGRAFÍA FINANCIERA ACTUAL');
  paragraph(doc, state, 'Análisis de la cuenta de resultados personales de la unidad familiar, apalancamiento, excedentes líquidos recurrentes y optimización del colchón de reserva.');
  sectionDivider(doc, state);

  const finRows = [
    ['Ingresos ordinarios y pasivos', `Salario: ${money(formData.salarioNetoMensual)} | Pasivos: ${money(formData.rentasInmobiliariasMensualesNetas)}`, 'Flujo estable', 'Excluye otros ingresos variables'],
    ['Gastos mensuales fijos', money(metrics.expenses.total), 'Verificado', `Personal: ${money(metrics.expenses.personal)} | Deuda: ${money(metrics.expenses.housing)}`],
    ['Capacidad de ahorro fáctica', money(metrics.savingsCapacity.sinRentas), 'Verificado', 'Salario neto ordinario menos gastos totales'],
    ['Fondo de Emergencia Líquido', `${money(formData.dineroBanco)} (${metrics.liquidity.mesesCubiertos.toFixed(1)} meses)`, 'Adecuado', 'Suficiente para imprevistos corrientes'],
    ['Apalancamiento de Deuda', `${money(metrics.debt.deudaMensualTotal)} / mes`, 'Controlado', `Ratio de endeudamiento del ${percent(metrics.debt.ratioSobreSalario * 100)}`],
    ['Dinero invertido activo', money(formData.dineroInvertido), 'Verificado', `Rentabilidad histórica estimada: ${percent(formData.rentabilidadInversion ?? 5)}`]
  ];
  drawTable(doc, state, ['PARÁMETRO FINANCIERO', 'VALOR / COBERTURA', 'DIAGNÓSTICO', 'NOTAS TÉCNICAS'], [50, 40, 25, 67], finRows);

  // Objectives table
  heading(doc, state, '3. OBJETIVOS Y PROYECTOS DE CAPITALIZACIÓN');
  paragraph(doc, state, 'Cada objetivo se analiza bajo la teoría de ahorro compuesto financiero constante. Si la capacidad de ahorro es inferior a la aportación financiera requerida, el proyecto se marca como ajustado.');

  const objRows = projects.map((p: any) => {
    const years = Number(p.years || 1);
    const target = Number(p.target || 0);
    // Lineal vs financiera
    const r = 0.05 / 12; // 5% standard assumed
    const lineal = target / (years * 12);
    const financiera = (target * r) / (Math.pow(1 + r, years * 12) - 1);
    return [
      p.name,
      money(target),
      `${years} años`,
      `${money(lineal)}/mes`,
      `${money(financiera)}/mes`,
      p.status === "Viable" ? "Viable" : "Ajustado"
    ];
  });
  
  drawTable(
    doc,
    state,
    ['PROYECTO', 'CAPITAL', 'PLAZO', 'APORT. LINEAL', 'APORT. FINANCIERA', 'ESTADO'],
    [50, 25, 20, 28, 34, 25],
    objRows,
    ['left', 'right', 'center', 'right', 'right', 'center']
  );

  // ==========================================
  // PAGE 4: AUDITORÍA PREVISIÓN SOCIAL (Fase 13.7 & 13.8)
  // ==========================================
  newPage(doc, state, 'Auditoría de Previsión Social');
  heading(doc, state, '4. AUDITORÍA DE PREVISIÓN SOCIAL (SEGURIDAD SOCIAL)');
  paragraph(doc, state, 'Las prestaciones públicas de la Seguridad Social española estimadas para cada contingencia del trabajador, comparadas frente al nivel fáctico de gastos familiares declarados.');
  sectionDivider(doc, state);

  const prevRows = [
    ['Baja Laboral (enfermedad común, tramo 60%)', money(metrics.temporaryDisability.tramo60Monto), money(metrics.expenses.total), `-${money(metrics.temporaryDisability.tramo60Brecha)}`, 'Media', 'Contratar subsidio privado'],
    ['Baja Laboral (accidentes, tramo 75%)', money(metrics.temporaryDisability.tramo75Monto), money(metrics.expenses.total), `-${money(metrics.temporaryDisability.tramo75Brecha)}`, 'Media', 'Suficiente solo en tramo largo'],
    ['Invalidez Permanente Total habitual (IPT)', money(metrics.disability.iptMonto), money(metrics.expenses.total), `-${money(metrics.disability.iptBrecha)}`, 'Baja', 'Revisar capital por invalidez'],
    ['Invalidez Permanente Absoluta total (IPA)', money(metrics.disability.ipaMonto), money(metrics.expenses.total), `-${money(metrics.disability.ipaBrecha)}`, 'Media', 'Cubierto parcialmente'],
    ['Pensión de Viudedad (cónyuge computable)', money(metrics.survivorBenefits.viudedadMonto), money(metrics.expenses.total), `-${money(metrics.survivorBenefits.viudedadBrechaAislada)}`, 'Baja', 'Requiere seguro de vida'],
    ['Pensión de Orfandad (todos los hijos)', money(metrics.survivorBenefits.orfandadMonto), 'N/A', 'N/A', 'Media', 'Subsidio complementario de estudios'],
    ['Pensión de Jubilación Ordinaria previsible', money(metrics.retirementGap.pensionEstimada), money(metrics.expenses.total), `-${money(metrics.retirementGap.brechaMensual)}`, 'Media', 'Planificar ahorro indexado']
  ];
  drawTable(
    doc,
    state,
    ['CONTINGENCIA S.S.', 'ESTIMACIÓN', 'GASTO REF.', 'BRECHA MENSUAL', 'FIABILIDAD', 'ACCIÓN RECOMENDADA'],
    [50, 24, 22, 28, 20, 38],
    prevRows,
    ['left', 'right', 'right', 'right', 'center', 'left']
  );

  // Fallecimiento y protección familiar
  heading(doc, state, 'PROTECCIÓN FAMILIAR Y SEGUROS DE VIDA', 9.5);
  paragraph(doc, state, 'Análisis de liquidez sucesoria en caso de fallecimiento para asegurar la cancelación de deudas, gastos de transición obligatorios y educación superior para herederos dependientes.');

  const famRows = [
    ['Deuda pendiente acumulada (amortización)', money(formData.deudaPendienteTotal), 'Impuestos y transición sucesoria', money(6000)],
    ['Fondo educativo estimado para hijos', money(formData.hijosMenores25 * 18000), 'Déficit familiar acumulado (10 años)', money(Math.abs(metrics.survivorBenefits.conjuntoBrechaOSuperavit < 0 ? metrics.survivorBenefits.conjuntoBrechaOSuperavit : 0) * 12 * 10)],
    ['CAPITAL OBJETIVO RECOMENDADO', money(metrics.familyNeed.capitalFamiliarObjetivo), 'Seguros de vida vigentes', money(formData.capitalSeguroVidaExistente)],
    ['DÉFICIT NETO DE PROTECCIÓN', money(metrics.familyNeed.deficitDeProteccion), 'Diagnóstico de protección familiar', metrics.familyNeed.deficitDeProteccion > 0 ? "VULNERABLE" : "PROTEGIDO"]
  ];
  drawTable(doc, state, ['CONCEPTO DE LIQUIDEZ', 'VALOR', 'AJUSTE SUCESORIO', 'IMPORTE'], [50, 32, 60, 40], famRows);

  // ==========================================
  // PAGE 5: PLANIFICACIÓN DE JUBILACIÓN (Fase 13.9 & 13.10)
  // ==========================================
  newPage(doc, state, 'Estudio Jubilación y Patrimonio Proyectado');
  heading(doc, state, '5. PLANIFICACIÓN DE JUBILACIÓN (TRES ESCENARIOS)');
  paragraph(doc, state, 'Tres proyecciones matemáticas considerando estabilidad de bases de cotización, lagunas normativas y continuidad del flujo inmobiliario pasivo.');
  sectionDivider(doc, state);

  const scenRows = (retirementScenarios || []).map((s: any) => [
    s.name,
    money(s.pensionEstimada),
    money(formData.rentasInmobiliariasMensualesNetas),
    money(s.gastoReferencia),
    `-${money(s.brecha)}`,
    money(s.capitalNecesario),
    money(s.capitalNecesario / Math.max(1, s.anosHastaJubilacion * 12))
  ]);
  drawTable(
    doc,
    state,
    ['ESCENARIO', 'PENSIÓN S.S.', 'RENTAS INMOB.', 'GASTO REF.', 'BRECHA MENSUAL', 'CAPITAL NECESARIO', 'AHORRO RECOM.'],
    [24, 25, 25, 22, 28, 33, 25],
    scenRows,
    ['left', 'right', 'right', 'right', 'right', 'right', 'right']
  );

  // Proyección a los 67 años
  heading(doc, state, 'PROYECCIÓN DEL PATRIMONIO INTEGRAL A LOS 67 AÑOS', 9.5);
  paragraph(doc, state, 'Proyección a largo plazo sumando liquidez bancaria, crecimiento de capitales invertidos y capitalizaciones periódicas mediante ahorro sistemático indexado.');

  const projRows = [
    ['Dinero en banco (mantenimiento líquido)', money(formData.dineroBanco), 'Colchón fáctico inmune al interés compuesto'],
    ['Dinero invertido proyectado (Interés compuesto)', money(metrics.estate.projectedInvested), `Rentabilidad del ${percent(formData.rentabilidadInversion ?? 5)} anual acumulada`],
    ['Ahorro sistemático acumulado', money(metrics.estate.projectedSaving), `Planes mensuales de ${money(formData.ahorroSistematicoMensual)} al ${percent(formData.rentabilidadAhorroSistematico ?? 6)}`],
    ['Rentas inmobiliarias acumuladas', money(metrics.estate.projectedRents), `Rentas netas percibidas hasta la edad de 67 años (${formData.destinoRentasInmobiliarias.toUpperCase()})`],
    ['Inversiones inmobiliarias de tasación', money(formData.valorInmuebles), 'Valor actual constante del inmueble declarados'],
    ['PROYECCIÓN TOTAL DE PATRIMONIO JUBILADO', money(metrics.estate.projectedTotal), 'Flujo pasivo e instrumental acumulado de retiro']
  ];
  drawTable(doc, state, ['COMPONENTE PATRIMONIAL', 'VALOR PROYECTADO', 'HIPÓTESIS Y COMENTARIOS'], [60, 42, 80], projRows);

  // ==========================================
  // PAGE 6: NIVELES DE SEGURIDAD & PLAN DE ACCIÓN (Fase 13.11 & 13.12)
  // ==========================================
  newPage(doc, state, 'Plan de Acción y Cierre Profesional');
  heading(doc, state, '6. NIVELES DE SEGURIDAD POR ÁREAS DE AUDITORÍA');
  paragraph(doc, state, 'Sintetiza la puntuación asignada a cada área clave y la recomendación o medida de blindaje fáctico requerida.');
  sectionDivider(doc, state);

  const areaRows = [
    ['Fondo de Emergencia / Liquidez', `${scores.fondo}/10`, 'Colchón de seguridad líquido adecuado para transiciones.', 'Mantener liquidez controlada'],
    ['Baja Laboral (Incapacidad Temporal)', `${scores.baja}/10`, 'Brecha inicial considerable en tramo del 60% por contingencia común.', 'Contratar subsidio privado'],
    ['Incapacidad Permanente total/absoluta', `${scores.incapacidad}/10`, 'Déficit mensual superior a los 500 € frente a gastos corrientes.', 'Contratar seguro de incapacidad'],
    ['Protección Familiar (Sucesos)', `${scores.familia}/10`, `Existe un déficit de protección de vida de ${money(metrics.familyNeed.deficitDeProteccion)}.`, 'Asegurar capital familiar objetivo'],
    ['Apalancamiento de Deuda', `${scores.deuda}/10`, `Ratio del ${percent(metrics.debt.ratioSobreSalario * 100)} dentro del límite saludable del 35%.`, 'Sin acción requerida inmediata'],
    ['Previsión de Jubilación de Retiro', `${scores.jubilacion}/10`, `Brecha de jubilación fáctica de ${money(metrics.retirementGap.brechaMensual)}/mes.`, 'Suscribir plan de ahorro indexado'],
    ['Patrimonio / Inflación', `${scores.inflacion}/10`, 'Inversiones acumuladas mitigan parcialmente el impacto inflacionario.', 'Revisar carteras diversificadas'],
    ['Orden Legal e Instrumental', `${scores.legal}/10`, 'Ausencia de testamento e inventario, lo que eleva el riesgo de herederos.', 'Formalizar actas notariales']
  ];
  drawTable(doc, state, ['ÁREA DE AUDITORÍA', 'PUNTOS', 'DIAGNÓSTICO ESTRATÉGICO', 'ACCIÓN RECOMENDADA'], [50, 18, 74, 40], areaRows);

  // Action plan (Urgentes, Importantes, Optimización)
  heading(doc, state, '7. PLAN DE ACCIÓN PRIORIZADO DEL CLIENTE', 9.5);
  
  const actRows = (actionPlan || []).map((step: any) => [
    step.step,
    step.priority,
    step.impact,
    step.whyNecessary
  ]);
  drawTable(
    doc,
    state,
    ['MEDIDA / ACCIÓN RECOMENDADA', 'PRIORIDAD', 'IMPACTO ESPERADO', 'JUSTIFICACIÓN TÉCNICA'],
    [52, 22, 54, 54],
    actRows
  );

  // Box for Warnings
  if (warnings.length > 0) {
    ensureSpace(doc, state, 22);
    const boxY = state.y;
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(M, boxY, W, 18, 2, 2, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text('ADVERTENCIAS Y ALERTAS PENDIENTES DE VALIDAR:', M + 4, boxY + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 53, 4);
    const wTexts = warnings.slice(0, 2).map((w: any) => `* [${(w.type || 'ALERTA').toUpperCase()}] ${w.text || ''}`).join('   ');
    doc.text(doc.splitTextToSize(wTexts, W - 8), M + 4, boxY + 10);
    state.y += 22;
  }

  // Closing
  heading(doc, state, 'CIERRE PROFESIONAL Y NOTA METODOLÓGICA', 8.5);
  paragraph(doc, state, 'Este diagnóstico representa una foto matemática rigurosa basada en el modelo legal y de previsión de la Seguridad Social de España. Para corregir las brechas identificadas, ordenar su patrimonio o formalizar los complementos de ahorro de jubilación, puede ponerse en contacto con José Carlos Hidalgo en josecarlos@hilolegal.es o en el teléfono 647 50 60 40.');

  footer(doc, state.page);
  doc.save(`informe-auditoria-profesional-${slug(clientName)}.pdf`);
}

function buttonBusy(button: HTMLButtonElement, busy: boolean) {
  if (busy) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.style.opacity = '0.72';
    button.innerHTML = '<span>Generando informe profesional PDF...</span>';
  } else {
    button.disabled = false;
    button.style.opacity = '';
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
  }
}

function isPdfButton(target: EventTarget | null) {
  const element = target instanceof Element ? target : null;
  const button = element?.closest('button') as HTMLButtonElement | null;
  if (!button) return null;
  const text = button.innerText || button.textContent || '';
  const id = button.id || '';
  return (/descargar.*pdf/i.test(text) || id === 'download-professional-pdf') ? button : null;
}

function install() {
  const win = window as typeof window & { [FLAG]?: boolean };
  if (win[FLAG]) return;
  win[FLAG] = true;
  document.addEventListener('click', async (event) => {
    const button = isPdfButton(event.target);
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      buttonBusy(button, true);
      await generatePdf();
    } catch (error) {
      console.error(error);
      window.alert('No se pudo generar el informe profesional. Revisa los datos y vuelve a intentarlo.');
    } finally {
      buttonBusy(button, false);
    }
  }, true);
}

install();
