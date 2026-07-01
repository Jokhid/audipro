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
function money(val: number) {
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
function percent(val: number) { return `${Number(val || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`; }

// Page decorations
function drawLogoSymbol(doc: jsPDF, x: number, y: number, size: number) {
  const s = size / 30.0; // scale factor based on 30mm width
  
  // Pillars/brackets: pure white
  doc.setFillColor(255, 255, 255);
  
  // Left bracket (shaped like [ )
  // Stem
  doc.rect(x + 1.75 * s, y + 2.0 * s, 4.5 * s, 31.0 * s, 'F');
  // Top serif
  doc.rect(x - 1.0 * s, y + 2.0 * s, 7.25 * s, 4.0 * s, 'F');
  // Bottom serif
  doc.rect(x - 1.0 * s, y + 29.0 * s, 7.25 * s, 4.0 * s, 'F');

  // Right bracket (shaped like ] )
  // Stem
  doc.rect(x + 23.75 * s, y + 2.0 * s, 4.5 * s, 31.0 * s, 'F');
  // Top serif
  doc.rect(x + 23.75 * s, y + 2.0 * s, 7.25 * s, 4.0 * s, 'F');
  // Bottom serif
  doc.rect(x + 23.75 * s, y + 29.0 * s, 7.25 * s, 4.0 * s, 'F');

  // Center top pillar
  doc.rect(x + 13.0 * s, y + 2.0 * s, 4.0 * s, 7.5 * s, 'F');

  // Center bottom pillar
  doc.rect(x + 13.0 * s, y + 25.5 * s, 4.0 * s, 7.5 * s, 'F');
  
  // Center circle: ocher gold (197, 165, 102)
  doc.setFillColor(197, 165, 102);
  doc.setDrawColor(197, 165, 102);
  doc.setLineWidth(0.65 * s);
  doc.circle(x + 15.0 * s, y + 17.5 * s, 6.75 * s, 'FD');

  // Reset draw settings
  doc.setLineWidth(1.0);
  doc.setDrawColor(0, 0, 0);
}

function pageHeader(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, 210, 30, 'F');

  // Draw scaled logo symbol on the left side of the header (reduced size by 25% from 16 to 12)
  drawLogoSymbol(doc, 14, 9, 12);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('JOSÉ CARLOS HIDALGO', 32, 13);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(subtitle.toUpperCase(), 32, 20);

  // Email and phone contact on the right side of the header
  doc.setTextColor(220, 220, 220);
  doc.text('josecarlos@hilolegal.es   |   647 50 60 40', 196, 16.5, { align: 'right' });
}

function footer(doc: jsPDF, page: number) {
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Informe de Auditoría Patrimonial. Confidencial y personalizado.', 14, 287);
  doc.text(`Página ${page}`, 196, 287, { align: 'right' });
}

function newPage(doc: jsPDF, state: PageState, title: string) {
  if (state.page > 1) {
    footer(doc, state.page);
  }
  doc.addPage();
  state.page++;
  state.title = title;
  state.y = 42;
  pageHeader(doc, title);
}

function ensureSpace(doc: jsPDF, state: PageState, needed = 20) {
  if (state.y + needed <= 276) return;
  newPage(doc, state, state.title);
}

function heading(doc: jsPDF, state: PageState, text: string, size = 11) {
  if (state.y > 45) {
    state.y += 6; // Espaciado anterior
  }
  ensureSpace(doc, state, 18);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(...SLATE);
  doc.text(text.toUpperCase(), M, state.y);
  state.y += size * 0.4 + 8; // Espaciado posterior
}

function paragraph(doc: jsPDF, state: PageState, text: string, size = 8.2) {
  const lines = doc.splitTextToSize(clean(text), W) as string[];
  ensureSpace(doc, state, lines.length * 4.2 + 9);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...MUTED);
  doc.text(lines, M, state.y);
  state.y += lines.length * 4.2 + 8;
}

function sectionDivider(doc: jsPDF, state: PageState) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, state.y, M + 35, state.y);
  state.y += 6;
}

// Native Vector Chart for benefits
function drawVectorChart(
  doc: jsPDF,
  state: PageState,
  title: string,
  categories: string[],
  values: number[],
  referenceValue: number,
  referenceLabel: string
) {
  ensureSpace(doc, state, 82);
  state.y += 10; // Espaciado anterior
  const chartY = state.y;
  const chartH = 38;
  const chartW = 150;
  const chartX = M + 15;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(title.toUpperCase(), M, chartY);

  // Background box
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M, chartY + 10, W, chartH + 11, 1.5, 1.5, 'FD');

  // Axes and Grid
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.2);
  
  const maxValue = Math.max(...values, referenceValue, 1000);
  const scale = (val: number) => (val / maxValue) * (chartH - 8);

  // Reference lines
  for (let i = 0; i <= 4; i++) {
    const gridY = chartY + 10 + chartH - (i * (chartH - 8)) / 4;
    doc.line(chartX, gridY, chartX + chartW, gridY);
    
    // Y-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...MUTED);
    doc.text(money((maxValue * i) / 4), chartX - 2, gridY + 1.5, { align: 'right' });
  }

  // Draw bars
  const numBars = categories.length;
  const barSpacing = chartW / numBars;
  const barWidth = barSpacing * 0.45;

  categories.forEach((cat, index) => {
    const val = values[index];
    const h = scale(val);
    const bx = chartX + index * barSpacing + (barSpacing - barWidth) / 2;
    const by = chartY + 10 + chartH - h;

    // Fill bar based on reference comparison
    if (val < referenceValue) {
      doc.setFillColor(...RED);
    } else {
      doc.setFillColor(...GREEN);
    }
    doc.rect(bx, by, barWidth, h, 'F');

    // Label on top of bar
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...SLATE);
    doc.text(money(val), bx + barWidth / 2, by - 1, { align: 'center' });

    // X-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...BLACK);
    const textLines = doc.splitTextToSize(cat, barSpacing - 2) as string[];
    textLines.forEach((line, lineIdx) => {
      doc.text(line, bx + barWidth / 2, chartY + 10 + chartH + 3.2 + (lineIdx * 2.8), { align: 'center' });
    });
  });

  // Reference line (expenses)
  const refY = chartY + 10 + chartH - scale(referenceValue);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.6);
  doc.line(chartX, refY, chartX + chartW, refY);

  // Label for reference line
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...ORANGE);
  doc.text(`${referenceLabel}: ${money(referenceValue)}`, chartX + chartW - 2, refY - 1, { align: 'right' });

  state.y += chartH + 28; // Espaciado posterior
}

// Stacked Bar Chart for scenarios
function drawRetirementChart(
  doc: jsPDF,
  state: PageState,
  title: string,
  scenarios: { name: string; pension: number; rents: number }[],
  referenceValue: number
) {
  ensureSpace(doc, state, 84);
  state.y += 10; // Espaciado anterior
  const chartY = state.y;
  const chartH = 38;
  const chartW = 150;
  const chartX = M + 15;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(title.toUpperCase(), M, chartY);

  // Background box
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M, chartY + 10, W, chartH + 15, 1.5, 1.5, 'FD');

  // Axes and Grid
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.2);

  const maxValue = Math.max(...scenarios.map(s => s.pension + s.rents), referenceValue, 1000);
  const scale = (val: number) => (val / maxValue) * (chartH - 8);

  // Reference lines
  for (let i = 0; i <= 4; i++) {
    const gridY = chartY + 10 + chartH - (i * (chartH - 8)) / 4;
    doc.line(chartX, gridY, chartX + chartW, gridY);

    // Y-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...MUTED);
    doc.text(money((maxValue * i) / 4), chartX - 2, gridY + 1.5, { align: 'right' });
  }

  // Draw stacked bars
  const numBars = scenarios.length;
  const barSpacing = chartW / numBars;
  const barWidth = barSpacing * 0.45;

  scenarios.forEach((scen, index) => {
    const pHeight = scale(scen.pension);
    const rHeight = scale(scen.rents);
    const bx = chartX + index * barSpacing + (barSpacing - barWidth) / 2;

    // Stacked bars: bottom is pension, top is rents
    const py = chartY + 10 + chartH - pHeight;
    doc.setFillColor(...GOLD);
    doc.rect(bx, py, barWidth, pHeight, 'F');

    let ry = py;
    if (scen.rents > 0) {
      ry = py - rHeight;
      doc.setFillColor(71, 85, 105);
      doc.rect(bx, ry, barWidth, rHeight, 'F');
    }

    // Total value label
    const totalVal = scen.pension + scen.rents;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...SLATE);
    doc.text(money(totalVal), bx + barWidth / 2, ry - 1, { align: 'center' });

    // X-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...BLACK);
    doc.text(scen.name.toUpperCase(), bx + barWidth / 2, chartY + 10 + chartH + 3.5, { align: 'center' });
  });

  // Reference line (expenses)
  const refY = chartY + 10 + chartH - scale(referenceValue);
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.6);
  doc.line(chartX, refY, chartX + chartW, refY);

  // Label for reference line
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...RED);
  doc.text(`Gasto de Referencia: ${money(referenceValue)}`, chartX + chartW - 2, refY - 1, { align: 'right' });

  // Legend at bottom
  const legendY = chartY + 10 + chartH + 8;
  doc.setFillColor(...GOLD);
  doc.rect(M + 25, legendY, 3, 3, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...MUTED);
  doc.text('Pensión Previsible S.S.', M + 30, legendY + 2.4);

  doc.setFillColor(71, 85, 105);
  doc.rect(M + 75, legendY, 3, 3, 'F');
  doc.text('Rentas Inmobiliarias Netas', M + 80, legendY + 2.4);

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.line(M + 125, legendY + 1.5, M + 130, legendY + 1.5);
  doc.text('Gasto Mensual de Referencia', M + 132, legendY + 2.4);

  state.y += chartH + 28; // Espaciado posterior
}

function drawPatrimonioProyectadoChart(
  doc: jsPDF,
  state: PageState,
  title: string,
  edadActual: number,
  dineroBanco: number,
  dineroInvertido: number,
  rentabilidadInversion: number,
  rentabilidadAhorroSistematico: number,
  ahorroSistematicoMensual: number,
  destinoRentasInmobiliarias: string,
  rentasInmobiliariasMensualesNetas: number,
  capitalObjetivo: number,
  capitalObjetivoOptimista: number
) {
  ensureSpace(doc, state, 84);
  state.y += 10; // Espaciado anterior
  const chartY = state.y;
  const chartH = 38;
  const chartW = 150;
  const chartX = M + 15;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(title.toUpperCase(), M, chartY);

  // Background box
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M, chartY + 10, W, chartH + 15, 1.5, 1.5, 'FD');

  // Axes and Grid
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.2);

  const targetAge = Math.max(67, edadActual + 15);
  const yearsTotal = targetAge - edadActual;
  const step = Math.max(1, Math.floor(yearsTotal / 3));
  
  const sampleAges = [
    edadActual,
    edadActual + step,
    edadActual + 2 * step,
    targetAge
  ];

  const points = sampleAges.map(age => {
    const i = age - edadActual;
    const invRate = (rentabilidadInversion || 5) / 100;
    const savRate = (rentabilidadAhorroSistematico || 6) / 100;
    const annualSaving = (ahorroSistematicoMensual || 150) * 12;

    const savingAcc = savRate > 0 
      ? annualSaving * ((Math.pow(1 + savRate, i) - 1) / savRate)
      : annualSaving * i;
    
    const invAcc = (dineroInvertido || 0) * Math.pow(1 + invRate, i);
    const rentsAcc = (destinoRentasInmobiliarias === "reinversion" || destinoRentasInmobiliarias === "mixto")
      ? (rentasInmobiliariasMensualesNetas || 0) * 12 * i
      : 0;

    const total = (dineroBanco || 0) + invAcc + savingAcc + rentsAcc;
    return {
      age,
      patrimonioTotal: Math.round(total),
      ahorroSistematico: Math.round(savingAcc)
    };
  });

  const maxValue = Math.max(...points.map(p => p.patrimonioTotal), capitalObjetivo, capitalObjetivoOptimista, 50000);
  const scale = (val: number) => (val / maxValue) * (chartH - 8);

  // Reference lines
  for (let i = 0; i <= 4; i++) {
    const gridY = chartY + 10 + chartH - (i * (chartH - 8)) / 4;
    doc.line(chartX, gridY, chartX + chartW, gridY);

    // Y-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...MUTED);
    doc.text(money((maxValue * i) / 4), chartX - 2, gridY + 1.5, { align: 'right' });
  }

  // Draw bars
  const numBars = points.length;
  const barSpacing = chartW / numBars;
  const barWidth = barSpacing * 0.45;

  points.forEach((pt, index) => {
    const totalHeight = scale(pt.patrimonioTotal);
    const savingHeight = scale(pt.ahorroSistematico);
    const bx = chartX + index * barSpacing + (barSpacing - barWidth) / 2;

    const ty = chartY + 10 + chartH - totalHeight;
    doc.setFillColor(...GOLD);
    doc.rect(bx, ty, barWidth, totalHeight, 'F');

    if (pt.ahorroSistematico > 0) {
      const sy = chartY + 10 + chartH - savingHeight;
      doc.setFillColor(59, 130, 246);
      doc.rect(bx, sy, barWidth, savingHeight, 'F');
    }

    // Total label
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...SLATE);
    doc.text(money(pt.patrimonioTotal), bx + barWidth / 2, ty - 1, { align: 'center' });

    // X-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...BLACK);
    doc.text(`Edad ${pt.age}`, bx + barWidth / 2, chartY + 10 + chartH + 3.5, { align: 'center' });
  });

  // Reference line (Capital Objetivo Central)
  const refY = chartY + 10 + chartH - scale(capitalObjetivo);
  doc.setDrawColor(249, 115, 22); // Orange
  doc.setLineWidth(0.3);
  const dashW = 3;
  for (let lx = chartX; lx < chartX + chartW; lx += dashW * 2) {
    doc.line(lx, refY, Math.min(lx + dashW, chartX + chartW), refY);
  }

  // Label for central reference line
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(249, 115, 22);
  doc.text(`Cap. Central: ${money(capitalObjetivo)}`, chartX + chartW - 2, refY - 1.5, { align: 'right' });

  // Reference line (Capital Objetivo Optimista)
  const refYOpt = chartY + 10 + chartH - scale(capitalObjetivoOptimista);
  doc.setDrawColor(...RED); // Red
  doc.setLineWidth(0.3);
  for (let lx = chartX; lx < chartX + chartW; lx += dashW * 1.5) {
    doc.line(lx, refYOpt, Math.min(lx + dashW, chartX + chartW), refYOpt);
  }

  // Label for optimistic reference line
  doc.setTextColor(...RED);
  doc.text(`Cap. Optimista: ${money(capitalObjetivoOptimista)}`, chartX + chartW - 2, refYOpt - 1.5, { align: 'right' });

  // Legend at bottom
  const legendY = chartY + 10 + chartH + 8;
  doc.setFillColor(...GOLD);
  doc.rect(M + 5, legendY, 3, 3, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...MUTED);
  doc.text('Patrimonio Proyectado', M + 10, legendY + 2.4);

  doc.setFillColor(59, 130, 246);
  doc.rect(M + 45, legendY, 3, 3, 'F');
  doc.text('Ahorro Acumulado', M + 50, legendY + 2.4);

  doc.setFillColor(249, 115, 22); // Orange
  doc.rect(M + 85, legendY, 3, 0.6, 'F');
  doc.text('Cap. Central', M + 90, legendY + 2.4);

  doc.setFillColor(...RED); // Red
  doc.rect(M + 120, legendY, 3, 0.6, 'F');
  doc.text('Cap. Optimista', M + 125, legendY + 2.4);

  state.y += chartH + 28; // Espaciado posterior
}

function drawExcessLiquidityChart(
  doc: jsPDF,
  state: PageState,
  title: string,
  excessValue: number
) {
  ensureSpace(doc, state, 84);
  state.y += 10; // Espaciado anterior
  const chartY = state.y;
  const chartH = 38;
  const chartW = 150;
  const chartX = M + 15;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(title.toUpperCase(), M, chartY);

  // Background box
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M, chartY + 10, W, chartH + 15, 1.5, 1.5, 'FD');

  // Axes and Grid
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.2);

  const sampleYears = [0, 5, 10, 15, 20];
  const points = sampleYears.map(year => {
    const parado = excessValue;
    const invertido = Math.round(excessValue * Math.pow(1.06, year));
    const poderAdquisitivo = Math.round(excessValue / Math.pow(1.025, year));
    return {
      year,
      parado,
      invertido,
      poderAdquisitivo
    };
  });

  const maxValue = Math.max(...points.map(p => p.invertido), 1000);
  const scale = (val: number) => (val / maxValue) * (chartH - 8);

  // Reference lines
  for (let i = 0; i <= 4; i++) {
    const gridY = chartY + 10 + chartH - (i * (chartH - 8)) / 4;
    doc.line(chartX, gridY, chartX + chartW, gridY);

    // Y-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(...MUTED);
    doc.text(money((maxValue * i) / 4), chartX - 2, gridY + 1.5, { align: 'right' });
  }

  // Draw side-by-side bars for each Year point
  const numPoints = points.length;
  const spacing = chartW / numPoints;
  const totalBarWidth = spacing * 0.6;
  const singleBarWidth = totalBarWidth / 2;

  const linePoints: { x: number; y: number; val: number }[] = [];

  points.forEach((pt, index) => {
    const xBase = chartX + index * spacing + (spacing - totalBarWidth) / 2;

    // Bar 1: Dinero parado (gray/slate)
    const paradoHeight = scale(pt.parado);
    const pX = xBase;
    const pY = chartY + 10 + chartH - paradoHeight;
    doc.setFillColor(156, 163, 175); // Gray-400
    doc.rect(pX, pY, singleBarWidth - 0.5, paradoHeight, 'F');

    // Bar 2: Invertido (emerald green)
    const invertidoHeight = scale(pt.invertido);
    const iX = xBase + singleBarWidth;
    const iY = chartY + 10 + chartH - invertidoHeight;
    doc.setFillColor(...GREEN); // Emerald green
    doc.rect(iX, iY, singleBarWidth - 0.5, invertidoHeight, 'F');

    // Label for Invertido on top
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.0);
    doc.setTextColor(...SLATE);
    doc.text(money(pt.invertido), iX + (singleBarWidth / 2), iY - 1, { align: 'center' });

    // Collect line point (center of the year section)
    const xCenter = xBase + totalBarWidth / 2;
    const poderHeight = scale(pt.poderAdquisitivo);
    const pPowerY = chartY + 10 + chartH - poderHeight;
    linePoints.push({ x: xCenter, y: pPowerY, val: pt.poderAdquisitivo });

    // X-axis label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...BLACK);
    doc.text(`Año ${pt.year}`, xBase + (totalBarWidth / 2), chartY + 10 + chartH + 3.5, { align: 'center' });
  });

  // Draw red line representing purchasing power (-2.5% inflation)
  doc.setDrawColor(220, 38, 38); // Red
  doc.setLineWidth(0.6);
  for (let i = 0; i < linePoints.length - 1; i++) {
    const p1 = linePoints[i];
    const p2 = linePoints[i + 1];
    doc.line(p1.x, p1.y, p2.x, p2.y);
  }

  // Draw red dots on line points and text labels
  linePoints.forEach((p) => {
    doc.setFillColor(220, 38, 38);
    doc.circle(p.x, p.y, 0.8, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.setTextColor(185, 28, 28); // Dark red
    doc.text(money(p.val), p.x, p.y + 2.8, { align: 'center' });
  });

  // Legend at bottom
  const legendY = chartY + 10 + chartH + 8;
  doc.setFillColor(156, 163, 175);
  doc.rect(M + 5, legendY, 3, 3, 'F');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(...MUTED);
  doc.text('Dinero Parado (0% rentabilidad)', M + 9, legendY + 2.4);

  doc.setFillColor(220, 38, 38);
  doc.rect(M + 58, legendY, 3, 3, 'F');
  doc.text('Poder Adquisitivo (Inflación 2.5%)', M + 62, legendY + 2.4);

  doc.setFillColor(...GREEN);
  doc.rect(M + 115, legendY, 3, 3, 'F');
  doc.text('Inversión Proyectada al 6% anual', M + 119, legendY + 2.4);

  state.y += chartH + 28; // Espaciado posterior
}

// Table cell drawers
function drawTable(
  doc: jsPDF,
  state: PageState,
  headers: string[],
  widths: number[],
  rowsData: string[][],
  alignments: ("left" | "right" | "center")[] = [],
  uniformRowHeight = false
) {
  ensureSpace(doc, state, 15);
  const startY = state.y;
  let x = M;

  // Header
  doc.setFillColor(...BLACK);
  doc.roundedRect(M, startY, W, 7.5, 1.2, 1.2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  
  headers.forEach((h, i) => {
    const align = alignments[i] || 'left';
    const tx = align === 'right' ? x + widths[i] - 3 : align === 'center' ? x + widths[i]/2 : x + 3;
    doc.text(h, tx, startY + 5.0, { align });
    x += widths[i];
  });
  state.y += 8.0;

  // Pre-calculate line splitting and maxLines for each row, and find global maximum lines if uniformRowHeight is true
  let absoluteMaxLines = 1;
  const processedRows = rowsData.map(row => {
    const cellLines = row.map((val, i) => {
      const lines = doc.splitTextToSize(val, widths[i] - 4);
      return lines.slice(0, 2); // Limit to maximum of 2 lines as requested
    });
    const maxLines = Math.max(...cellLines.map(lines => lines.length), 1);
    if (maxLines > absoluteMaxLines) {
      absoluteMaxLines = maxLines;
    }
    return { cellLines, maxLines };
  });

  // Rows
  processedRows.forEach(({ cellLines, maxLines }, rowIndex) => {
    const linesToUse = uniformRowHeight ? absoluteMaxLines : maxLines;
    const rowHeight = 4.0 + (linesToUse * 3.5);

    ensureSpace(doc, state, rowHeight + 1.0);
    x = M;
    doc.setFillColor(rowIndex % 2 ? 255 : 248, rowIndex % 2 ? 255 : 250, rowIndex % 2 ? 255 : 252);
    doc.setDrawColor(...BORDER);
    doc.rect(M, state.y, W, rowHeight, 'FD');

    const row = rowsData[rowIndex];
    row.forEach((val, i) => {
      const align = alignments[i] || 'left';
      const tx = align === 'right' ? x + widths[i] - 3 : align === 'center' ? x + widths[i]/2 : x + 3;
      doc.setFont('Helvetica', i === 0 ? 'bold' : 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(...SLATE);

      if (val === 'Viable' || val === 'Cubierto' || val === 'Alta' || val === 'Bajo' || val === 'Leve' || val === 'PROTEGIDO' || (val === 'Baja' && headers[i] === 'PRIORIDAD')) {
        doc.setFont('Helvetica', 'bold');
        if (val === 'Viable' || val === 'Cubierto' || val === 'Bajo' || val === 'Leve' || val === 'PROTEGIDO' || (val === 'Baja' && headers[i] === 'PRIORIDAD')) doc.setTextColor(...GREEN);
        if (val === 'Alta') {
          if (headers[i] === 'FIABILIDAD') {
            doc.setTextColor(...GREEN);
          } else {
            doc.setTextColor(...RED);
          }
        }
      } else if (val === 'Ajustado' || val === 'Media' || val === 'Moderada' || val === 'Pendiente' || val === 'ALERTA') {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...ORANGE);
      } else if (val === 'No viable' || val === 'Alto' || val === 'Grave' || (val === 'Baja' && headers[i] !== 'PRIORIDAD') || val === 'VULNERABLE') {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...RED);
      }

      const lines = cellLines[i];
      lines.forEach((lineText, lineIdx) => {
        doc.text(lineText, tx, state.y + 5.0 + (lineIdx * 3.5), { align });
      });
      x += widths[i];
    });
    state.y += rowHeight;
  });
  state.y += 3.5;
}

function drawCoverLogo(doc: jsPDF, x: number, y: number) {
  // Rounded background container in deep corporate navy, matching the app's brand identity
  doc.setFillColor(13, 27, 42);
  doc.roundedRect(x - 4, y - 2, 38, 39, 3, 3, 'F');

  // Draw scaled logo symbol at scale size = 30 (which is 1:1 scale)
  drawLogoSymbol(doc, x, y, 30);
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
  // PAGE 1: PORTADA PROFESIONAL (FONDO CLARO)
  // ==========================================
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Gold side margin accents
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 6, 297, 'F');
  doc.rect(204, 0, 6, 297, 'F');

  // Central decorative grid
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(20, 106, 190, 106);
  doc.line(20, 220, 190, 220);

  // Logo centrado en la parte superior
  drawCoverLogo(doc, 90, 35);

  // Titles (Shifted for premium light balance with logo)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(...BLACK);
  doc.text('AUDITORÍA PATRIMONIAL', 105, 115, { align: 'center' });
  doc.setFontSize(13.5);
  doc.setTextColor(...GOLD);
  doc.text('INFORME ESTRATÉGICO PROFESIONAL', 105, 126, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text('PREVISIÓN SOCIAL • BLINDAJE FAMILIAR • JUBILACIÓN • ORDEN SUCESORIO', 105, 135, { align: 'center' });

  // Client Details Card (Off-white / Slate 50 background)
  doc.setFillColor(...LIGHT);
  doc.roundedRect(25, 160, 160, 36, 3, 3, 'F');
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(25, 160, 160, 36, 3, 3, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('DATOS DE LA CONSULTORÍA', 32, 168);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(...BLACK);
  doc.text(`CLIENTE: ${clientName.toUpperCase()}`, 32, 176);
  doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-ES')}`, 32, 182);
  doc.text(`TIPO DE INFORME: Auditoría de Seguridad Financiera y patrimonial.`, 32, 188);

  // Adviser stamp
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...BLACK);
  doc.text('JOSÉ CARLOS HIDALGO', 105, 230, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('Gestión Patrimonial e Hipotecaria', 105, 236, { align: 'center' });
  doc.setTextColor(...MUTED);
  doc.text('Email: josecarlos@hilolegal.es   |   Teléfono: 647 50 60 40', 105, 242, { align: 'center' });

  // Seal of Quality
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.circle(105, 264, 10, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(...BLACK);
  doc.text('AUDITORÍA', 105, 263.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setTextColor(...GOLD);
  doc.text('PATRIMONIAL', 105, 266.5, { align: 'center' });

  // ==========================================
  // PAGE 2: ÍNDICE DE CONTENIDOS Y PRESENTACIÓN
  // ==========================================
  newPage(doc, state, 'Índice de Contenidos');
  heading(doc, state, 'ÍNDICE DE CONTENIDOS DEL INFORME');
  sectionDivider(doc, state);

  const indexItems = [
    { num: '1', name: 'Resumen Ejecutivo y Calificación Global', page: '3' },
    { num: '2', name: 'Fotografía Financiera Actual y Presupuesto', page: '4' },
    { num: '3', name: 'Objetivos y Proyectos de Capitalización', page: '4' },
    { num: '4', name: 'Auditoría de Previsión Social', page: '5' },
    { num: '5', name: 'Comparativa Gráfica de Prestaciones vs Gastos', page: '5' },
    { num: '6', name: 'Fallecimiento y Protección Familiar Sucesoria', page: '6' },
    { num: '7', name: 'Planificación de Jubilación en Tres Escenarios', page: '6' },
    { num: '8', name: 'Proyección del Patrimonio Integral a los 67 años', page: '7' },
    { num: '9', name: 'Niveles de Seguridad y Vulnerabilidad por Áreas', page: '8' },
    { num: '10', name: 'Plan de Acción Priorizado y Medidas de Blindaje', page: '10' },
    { num: '11', name: 'Análisis Cualitativo y Conclusión Estratégica', page: '11' }
  ];

  ensureSpace(doc, state, 90);
  let indexY = state.y + 4;
  indexItems.forEach((item) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...SLATE);
    doc.text(`${item.num}. ${item.name.toUpperCase()}`, M, indexY);

    // Dots between name and page
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(215, 220, 225);
    const nameWidth = doc.getTextWidth(`${item.num}. ${item.name.toUpperCase()}`);
    const dotsX = M + nameWidth + 2;
    const dotsW = W - nameWidth - 12;
    let dotsStr = '';
    for (let j = 0; j < Math.floor(dotsW / 1.5); j++) {
      dotsStr += '.';
    }
    doc.text(dotsStr, dotsX, indexY);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...GOLD);
    doc.text(item.page, M + W, indexY, { align: 'right' });

    indexY += 6.5;
  });

  // Explicitly update state.y so that the following box renders after the index items
  state.y = indexY;

  // Brief Presentation Box at bottom of page 2
  ensureSpace(doc, state, 30);
  const presY = state.y + 6;
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M, presY, W, 22, 2, 2, 'FD');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text('PROPÓSITO DE LA AUDITORÍA:', M + 4, presY + 5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  const presTxt = `Garantizar el blindaje financiero integral del patrimonio familiar y de la capacidad de ingresos ordinarios de ${clientName} mediante el análisis de brechas de cobertura pública y la estructuración coordinada de mecanismos de previsión privados de ahorro sistemático indexado.`;
  doc.text(doc.splitTextToSize(presTxt, W - 8), M + 4, presY + 9);

  // Update state.y to finish page 2
  state.y = presY + 24;

  // ==========================================
  // PAGE 3: RESUMEN EJECUTIVO (Fase 13.2)
  // ==========================================
  newPage(doc, state, 'Resumen Ejecutivo y Fotografía Inicial');
  heading(doc, state, '1. RESUMEN EJECUTIVO Y CALIFICACIÓN GLOBAL');
  paragraph(doc, state, 'La calificación sintética de seguridad mide la robustez de las finanzas personales frente a sucesos sobrevenidos como bajas médicas prolongadas, fallecimiento familiar, sobreapalancamiento o brechas de retiro.');
  sectionDivider(doc, state);

  const isAutonomo = formData.regimenSeguridadSocial === "RETA (Autónomos)";
  const categoryDetails = [
    {
      name: 'Liquidez',
      score: scores.fondo,
      risk: `Fondo de reserva bajo frente a gastos familiares.`,
      action: `Constituir colchón de reserva de 6 a 9 meses (${money(metrics.expenses.total * 6)} - ${money(metrics.expenses.total * 9)}).`
    },
    {
      name: 'Baja Laboral',
      score: scores.baja,
      risk: `Déficit inicial por baja común de ${money(metrics.temporaryDisability.tramo60Brecha)}/mes.`,
      action: isAutonomo ? `Contratar seguro de subsidio por incapacidad temporal.` : `Sin acción (cubierto por Régimen General).`
    },
    {
      name: 'Incapacidad',
      score: scores.incapacidad,
      risk: `Brecha por invalidez de hasta ${money(metrics.disability.iptBrecha)}/mes.`,
      action: `Revisar y contratar cobertura por incapacidad de vida.`
    },
    {
      name: 'Protección Fam.',
      score: scores.familia,
      risk: `Déficit neto de protección familiar de ${money(metrics.familyNeed.deficitDeProteccion)}.`,
      action: `Ampliar capital de vida hasta objetivo de ${money(metrics.familyNeed.capitalFamiliarObjetivo)}.`
    },
    {
      name: 'Deuda',
      score: scores.deuda,
      risk: `Elevado endeudamiento del ${percent(metrics.debt.ratioSobreSalario * 100)} de ingresos.`,
      action: `Amortizar deudas de forma acelerada y reducir cuotas.`
    },
    {
      name: 'Retiro',
      score: scores.jubilacion,
      risk: `Brecha de jubilación fáctica de ${money(metrics.retirementGap.brechaMensual)}/mes.`,
      action: `Ahorrar ${money(metrics.retirementGap.recommendedSaving)}/mes en plan indexado eficiente.`
    },
    {
      name: 'Patrimonio',
      score: scores.inflacion,
      risk: `Excesivo capital inactivo ocioso expuesto a inflación.`,
      action: `Invertir liquidez improductiva en activos con interés.`
    },
    {
      name: 'Orden Legal',
      score: scores.legal,
      risk: `Falta de instrumentos de protección (Testamento y Poder).`,
      action: `Formalizar testamento abierto y poder preventivo.`
    }
  ];

  // Sort by score ascending to find the three lowest-scoring categories
  const lowestThree = [...categoryDetails].sort((a, b) => a.score - b.score).slice(0, 3);

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
  doc.text('RECOMENDACIÓN GENERAL PROFESIONAL:', M + 69, scoreY + 5.5);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...MUTED);
  const recTxt = `Para fortalecer el blindaje financiero (${scores.globalScore}/10) de ${clientName}, se recomienda prioritariamente: 1º) ${lowestThree[0].name}: ${lowestThree[0].action.replace(/\.$/, '')}. 2º) ${lowestThree[1].name}: ${lowestThree[1].action.replace(/\.$/, '')}. 3º) ${lowestThree[2].name}: ${lowestThree[2].action.replace(/\.$/, '')}.`;
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
  lowestThree.forEach((item, idx) => {
    const riskText = `${idx + 1}. [${item.name}] ${item.risk}`;
    const riskLines = doc.splitTextToSize(riskText, 80);
    doc.text(riskLines[0] || '', M + 4, infoY + 11 + idx * 5);
  });

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
  lowestThree.forEach((item, idx) => {
    const actionText = `${idx + 1}. [${item.name}] ${item.action}`;
    const actionLines = doc.splitTextToSize(actionText, 80);
    doc.text(actionLines[0] || '', M + 98, infoY + 11 + idx * 5);
  });
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
    ['Destino de Rentas Inmobiliarias', formData.destinoRentasInmobiliarias.toUpperCase(), formData.destinoRentasInmobiliarias !== 'desconocido' ? 'Verificado' : 'Pendiente', 'Afecta proyección de jubilación prudente']
  ];
  drawTable(doc, state, ['DATO DE LA AUDITORÍA', 'VALOR REGISTRADO', 'ESTADO', 'OBSERVACIÓN DEL ASESOR'], [50, 42, 25, 65], clientRows);

  // ==========================================
  // PAGE 4: FOTOGRAFÍA FINANCIERA & OBJETIVOS
  // ==========================================
  newPage(doc, state, 'Fotografía Financiera y Objetivos');
  heading(doc, state, '2. FOTOGRAFÍA FINANCIERA ACTUAL');
  paragraph(doc, state, 'Análisis de la cuenta de resultados personales de la unidad familiar, apalancamiento, excedentes líquidos recurrentes y optimización del colchón de reserva.');
  sectionDivider(doc, state);

  const conyugeText = formData.conyugeConIngresos === 'Si' ? ` | Cónyuge: ${money(formData.ingresosConyuge)}` : '';
  const conyugeObs = formData.conyugeConIngresos === 'Si' ? 'Incluye ingresos ordinarios del cónyuge' : 'Excluye otros ingresos variables';

  const finRows = [
    ['Ingresos ordinarios y pasivos', `Cliente: ${money(formData.salarioNetoMensual)}${conyugeText} | Pasivos: ${money(formData.rentasInmobiliariasMensualesNetas)}`, 'Flujo estable', conyugeObs],
    ['Gastos mensuales fijos', money(metrics.expenses.total), 'Verificado', `Personal: ${money(metrics.expenses.personal)} | Deuda: ${money(metrics.expenses.housing)}`],
    ['Capacidad de ahorro fáctica', money(metrics.savingsCapacity.sinRentas), 'Verificado', formData.conyugeConIngresos === 'Si' ? 'Ingresos familiares netos menos gastos totales' : 'Salario neto ordinario menos gastos totales'],
    ['Fondo de Emergencia Líquido', `${money(formData.dineroBanco)} (${metrics.liquidity.mesesCubiertos.toFixed(1)} meses)`, 'Adecuado', 'Suficiente para imprevistos corrientes'],
    ['Apalancamiento de Deuda', `${money(metrics.debt.deudaMensualTotal)} / mes`, 'Controlado', `Ratio de endeudamiento familiar del ${percent(metrics.debt.ratioSobreSalario * 100)}`],
    ['Dinero invertido activo', money(formData.dineroInvertido), 'Verificado', `Rentabilidad histórica estimada: ${percent(formData.rentabilidadInversion ?? 5)}`]
  ];
  drawTable(doc, state, ['PARÁMETRO FINANCIERO', 'VALOR / COBERTURA', 'DIAGNÓSTICO', 'NOTAS TÉCNICAS'], [50, 40, 25, 67], finRows);

  // Objectives table
  heading(doc, state, '3. OBJETIVOS Y PROYECTOS DE CAPITALIZACIÓN');
  paragraph(doc, state, 'Cada objetivo se analiza bajo la teoría de ahorro compuesto financiero constante. Si la capacidad de ahorro es inferior a la aportación financiera requerida, el proyecto se marca como ajustado.');

  const objRows = projects.map((p: any) => {
    const years = Number(p.years || 1);
    const target = Number(p.target || 0);
    // Use exact values calculated in the UI (which respect priority and user-defined interest rates)
    const lineal = p.aportacionLineal !== undefined ? p.aportacionLineal : (target / (years * 12));
    const r = (p.priority === "Alta" ? Number(formData.rentabilidadAhorroSistematico || 6) : 2) / 1200;
    const financiera = p.aportacionFinanciera !== undefined ? p.aportacionFinanciera : (r > 0 ? ((target * r) / (Math.pow(1 + r, years * 12) - 1)) : lineal);
    return [
      p.name,
      money(target),
      `${years} años`,
      `${money(lineal)}/mes`,
      `${money(financiera)}/mes`,
      (p.viable === "Viable" || p.status === "Viable") ? "Viable" : "Ajustado"
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

  // Summary cards for Section 3
  state.y += 6;
  ensureSpace(doc, state, 18);
  const cardY = state.y;
  const cardW = 43.25;
  const cardH = 14;
  const gap = 3;

  // Card 1: CAPACIDAD AHORRO REAL
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M, cardY, cardW, cardH, 1.2, 1.2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(...MUTED);
  const c1X = M + (cardW / 2);
  doc.text('CAPACIDAD AHORRO REAL', c1X, cardY + 4.5, { align: 'center' });
  doc.setFontSize(8.0);
  doc.setTextColor(...BLACK);
  doc.text(money(metrics.savingsCapacity.sinRentas), c1X, cardY + 10.5, { align: 'center' });

  // Card 2: ESFUERZO MENSUAL FINANCIERO
  const totalObjMonthly = projects.reduce((sum: number, p: any) => {
    if (p.aportacionFinanciera !== undefined) return sum + p.aportacionFinanciera;
    const years = Number(p.years || 1);
    const target = Number(p.target || 0);
    const r = 0.05 / 12;
    const financiera = (target * r) / (Math.pow(1 + r, years * 12) - 1);
    return sum + financiera;
  }, 0);

  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M + cardW + gap, cardY, cardW, cardH, 1.2, 1.2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(...MUTED);
  const c2X = M + cardW + gap + (cardW / 2);
  doc.text('ESFUERZO MENSUAL FINANCIERO', c2X, cardY + 4.5, { align: 'center' });
  doc.setFontSize(8.0);
  doc.setTextColor(...BLACK);
  doc.text(money(totalObjMonthly), c2X, cardY + 10.5, { align: 'center' });

  // Card 3: ESFUERZO MENSUAL LINEAL
  const totalObjLineal = projects.reduce((sum: number, p: any) => {
    if (p.aportacionLineal !== undefined) return sum + p.aportacionLineal;
    const years = Number(p.years || 1);
    const target = Number(p.target || 0);
    const lineal = target / (years * 12);
    return sum + lineal;
  }, 0);

  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(M + (cardW + gap) * 2, cardY, cardW, cardH, 1.2, 1.2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(...MUTED);
  const c3X = M + (cardW + gap) * 2 + (cardW / 2);
  doc.text('ESFUERZO MENSUAL LINEAL', c3X, cardY + 4.5, { align: 'center' });
  doc.setFontSize(8.0);
  doc.setTextColor(...BLACK);
  doc.text(money(totalObjLineal), c3X, cardY + 10.5, { align: 'center' });

  // Card 4: Estado Viabilidad (Viable, Inviable o Ajustado)
  const ratio = totalObjMonthly > 0 ? (metrics.savingsCapacity.sinRentas / totalObjMonthly) : 1;
  let statusText = "Viable";
  let statusColor: any = GREEN; 
  let statusBg: any = [240, 253, 250]; 
  let statusBorder: any = [153, 246, 228]; 
  if (totalObjMonthly === 0) {
    statusText = "Sin Objetivos";
    statusColor = SLATE;
    statusBg = LIGHT;
    statusBorder = BORDER;
  } else if (ratio >= 1.0) {
    statusText = "Viable";
    statusColor = GREEN;
    statusBg = [240, 253, 250];
    statusBorder = [153, 246, 228];
  } else if (ratio >= 0.7) {
    statusText = "Ajustado";
    statusColor = [255, 255, 255]; // white text
    statusBg = [217, 119, 6]; // amber-600 background
    statusBorder = [217, 119, 6]; // amber-600 border
  } else {
    statusText = "Inviable";
    statusColor = RED; 
    statusBg = [254, 242, 242]; 
    statusBorder = [254, 202, 202]; 
  }

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.setDrawColor(statusBorder[0], statusBorder[1], statusBorder[2]);
  doc.roundedRect(M + (cardW + gap) * 3, cardY, cardW, cardH, 1.2, 1.2, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  const c4X = M + (cardW + gap) * 3 + (cardW / 2);
  doc.text('ESTADO VIABILIDAD', c4X, cardY + 4.5, { align: 'center' });
  doc.setFontSize(8.0);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusText.toUpperCase(), c4X, cardY + 10.5, { align: 'center' });

  state.y += cardH + 4;

  // 3.1 OPTIMIZACIÓN DE LIQUIDEZ EXCEDENTE (CONDICIONAL)
  const maxAllowedReserva = metrics.expenses.total * 9;
  const excessBanco = formData.dineroBanco - maxAllowedReserva;
  
  if (metrics.liquidity.mesesCubiertos > 9 && excessBanco > 0) {
    ensureSpace(doc, state, 72);
    state.y += 4;
    
    // Draw an elegant box with a light background
    const boxY = state.y;
    doc.setFillColor(254, 253, 240); // Soft amber light bg
    doc.setDrawColor(245, 158, 11);    // Soft amber border
    doc.roundedRect(M, boxY, W, 21, 1.5, 1.5, 'FD');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9); // Dark amber text
    doc.text('¡EXCESO DE LIQUIDEZ DETECTADO!', M + 4, boxY + 5.5);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...BLACK);
    const advisoryText = `Tu fondo de emergencia de ${money(formData.dineroBanco)} cubre ${metrics.liquidity.mesesCubiertos.toFixed(1)} meses de gastos, superando el limite prudencial maximo recomendado de 9 meses (${money(maxAllowedReserva)}). Dispones de un excedente parado e improductivo de ${money(excessBanco)}. Te aconsejamos canalizar este exceso de ahorro e invertirlo en herramientas financieras eficientes con rentabilidad (por ejemplo, SIALP, Contigo Futuro, Plan garantizado de Inversión, Ahorro Garantizado Extra, Flexicuenta) para protegerlo del efecto invisible de la devaluacion por inflacion y potenciar tu crecimiento.`;
    const advisoryLines = doc.splitTextToSize(advisoryText, W - 8);
    doc.text(advisoryLines, M + 4, boxY + 10);
    
    state.y += 27;
    
    // Draw the 20-year projection chart of the excess!
    drawExcessLiquidityChart(doc, state, 'PROYECCION DEL EXCESO DE LIQUIDEZ A 20 AÑOS (COMPUESTO AL 6% ANUAL)', excessBanco);
  }

  // ==========================================
  // PAGE 5: AUDITORÍA DE PREVISIÓN SOCIAL (Fase 13.7 & 13.8)
  // ==========================================
  newPage(doc, state, 'Auditoría de Previsión Social');
  heading(doc, state, '4. AUDITORÍA DE PREVISIÓN SOCIAL');
  paragraph(doc, state, 'Las prestaciones públicas de la Seguridad Social española estimadas para cada contingencia del trabajador, comparadas frente al nivel fáctico de gastos familiares declarados.');
  sectionDivider(doc, state);

  const childrenCount = typeof formData.hijosMenores25 === 'number' ? formData.hijosMenores25 : 0;
  const isSingleAndChildless = (formData.estadoCivil === "Soltero/a") && (childrenCount === 0);

  const prevRows = [
    ['Baja Laboral (enfermedad común, tramo 60% B.R.)', money(metrics.temporaryDisability.tramo60Monto), money(metrics.expenses.total), `-${money(metrics.temporaryDisability.tramo60Brecha)}`, metrics.temporaryDisability.tramo60Monto >= metrics.expenses.total ? 'Alta' : 'Media', isAutonomo ? 'Contratar subsidio privado' : 'Cubierto por Régimen General'],
    ['Baja Laboral (tramo 75% B.R.)', money(metrics.temporaryDisability.tramo75Monto), money(metrics.expenses.total), `-${money(metrics.temporaryDisability.tramo75Brecha)}`, metrics.temporaryDisability.tramo75Monto >= metrics.expenses.total ? 'Alta' : 'Media', 'Suficiente solo en tramo largo'],
    ['Invalidez Permanente Total habitual (IPT, 55% B.R.)', money(metrics.disability.iptMonto), money(metrics.expenses.total), `-${money(metrics.disability.iptBrecha)}`, metrics.disability.iptMonto >= metrics.expenses.total ? 'Alta' : 'Baja', 'Revisar capital por invalidez'],
    ['Invalidez Permanente Absoluta total (IPA, 100% B.R.)', money(metrics.disability.ipaMonto), money(metrics.expenses.total), `-${money(metrics.disability.ipaBrecha)}`, metrics.disability.ipaMonto >= metrics.expenses.total ? 'Alta' : 'Media', 'Cubierto parcialmente'],
    ...(isSingleAndChildless ? [] : [
      ['Pensión de Viudedad (cónyuge computable, 52% B.R.)', money(metrics.survivorBenefits.viudedadMonto), money(metrics.expenses.total), `-${money(metrics.survivorBenefits.viudedadBrechaAislada)}`, metrics.survivorBenefits.viudedadMonto >= metrics.expenses.total ? 'Alta' : 'Baja', 'Requiere seguro de vida'],
      ['Pensión de Orfandad (todos los hijos, 20% B.R. por hijo)', money(metrics.survivorBenefits.orfandadMonto), money(metrics.expenses.total), `-${money(Math.max(0, metrics.expenses.total - metrics.survivorBenefits.orfandadMonto))}`, metrics.survivorBenefits.orfandadMonto >= metrics.expenses.total ? 'Alta' : 'Media', 'Subsidio complementario de estudios']
    ]),
    ['Pensión de Jubilación Ordinaria previsible (hasta 100% B.R.)', money(metrics.retirementGap.pensionEstimada), money(metrics.expenses.total), `-${money(metrics.retirementGap.brechaMensual)}`, metrics.retirementGap.pensionEstimada >= metrics.expenses.total ? 'Alta' : 'Media', 'Planificar ahorro indexado']
  ];
  drawTable(
    doc,
    state,
    ['CONTINGENCIA S.S.', 'ESTIMACIÓN', 'GASTO DE REFERENCIA', 'BRECHA MENSUAL', 'FIABILIDAD', 'ACCIÓN RECOMENDADA'],
    [42, 24, 30, 28, 20, 38],
    prevRows,
    ['left', 'right', 'right', 'right', 'center', 'left'],
    true
  );

  // Add the native vector chart
  const categories = ['Baja (60%)', 'Baja (75%)', 'Invalidez IPT', 'Invalidez IPA', ...(isSingleAndChildless ? [] : ['Viudedad']), 'Jubilación'];
  const values = [
    metrics.temporaryDisability.tramo60Monto,
    metrics.temporaryDisability.tramo75Monto,
    metrics.disability.iptMonto,
    metrics.disability.ipaMonto,
    ...(isSingleAndChildless ? [] : [metrics.survivorBenefits.viudedadMonto]),
    metrics.retirementGap.pensionEstimada
  ];
  drawVectorChart(
    doc,
    state,
    '5. COMPARATIVA DE PRESTACIONES PÚBLICAS FRENTE A GASTOS',
    categories,
    values,
    metrics.expenses.total,
    'Gastos fijos'
  );



  // ==========================================
  // PAGE 6: PROTECCIÓN FAMILIAR Y RETIRO
  // ==========================================
  newPage(doc, state, 'Protección Familiar y Retiro');
  heading(doc, state, '6. PROTECCIÓN FAMILIAR SUCESORIA Y DE VIDA');
  
  if (metrics.familyNeed.hasNoDependents) {
    paragraph(doc, state, 'Análisis de protección de vida sucesoria y familiar para dependientes directos.');
    sectionDivider(doc, state);
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(M, state.y, 182, 18, 1, 1, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text('NO PROCEDE RECOMENDACIÓN DE CAPITAL OBJETIVO', M + 4, state.y + 6);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...BLACK);
    doc.text(`Al estar en estado civil ${formData.estadoCivil} y no tener hijos menores de 25 años a su cargo, no se establece`, M + 4, state.y + 11);
    doc.text('necesidad de protección familiar de rentas o capital objetivo por decesos para dependientes.', M + 4, state.y + 15);
    state.y += 24;
  } else {
    paragraph(doc, state, 'Análisis de liquidez sucesoria en caso de fallecimiento para asegurar la cancelación de deudas, gastos de transición obligatorios y educación superior para herederos dependientes.');
    sectionDivider(doc, state);

    const famRows = [
      ['Deuda pendiente acumulada (amortización)', money(formData.deudaPendienteTotal), 'Impuestos y transición sucesoria', money(6000)],
      ['Fondo educativo estimado para hijos', money(formData.hijosMenores25 * 18000), 'Déficit familiar acumulado (10 años)', money(Math.abs(metrics.survivorBenefits.conjuntoBrechaOSuperavit < 0 ? metrics.survivorBenefits.conjuntoBrechaOSuperavit : 0) * 12 * 10)],
      ['CAPITAL OBJETIVO RECOMENDADO', money(metrics.familyNeed.capitalFamiliarObjetivo), 'Seguros de vida vigentes', money(formData.capitalSeguroVidaExistente)],
      ['DÉFICIT NETO DE PROTECCIÓN', money(metrics.familyNeed.deficitDeProteccion), 'Diagnóstico de protección familiar', metrics.familyNeed.deficitDeProteccion > 0 ? "VULNERABLE" : "PROTEGIDO"]
    ];
    drawTable(doc, state, ['CONCEPTO DE LIQUIDEZ', 'VALOR', 'AJUSTE SUCESORIO', 'IMPORTE'], [50, 32, 60, 40], famRows, [], true);
  }

  heading(doc, state, '7. PLANIFICACIÓN DE JUBILACIÓN (TRES ESCENARIOS)');
  paragraph(doc, state, 'Tres proyecciones matemáticas considerando la pensión de jubilación ordinaria estimada junto con el flujo pasivo de rentas inmobiliarias netas declaradas.');

  const scenRows = (retirementScenarios || []).map((s: any) => [
    s.name,
    money(s.pensionEstimada),
    money(s.rentasConsideradas || 0),
    money(s.gastoReferencia),
    `-${money(s.brecha)}`,
    money(s.capitalNecesario),
    money(s.capitalNecesario / Math.max(1, s.anosHastaJubilacion * 12))
  ]);
  drawTable(
    doc,
    state,
    ['ESCENARIO', 'RENTAS INMOB. CONS.', 'PENSIÓN S.S.', 'GASTO DE REFERENCIA', 'BRECHA MENSUAL', 'CAPITAL NECESARIO', 'AHORRO RECOM.'],
    [20, 26, 24, 28, 26, 33, 25],
    scenRows.map(r => [r[0], r[2], r[1], r[3], r[4], r[5], r[6]]), // swap columns so it matches the headers (s.name, s.rentasConsideradas, s.pensionEstimada...)
    ['left', 'right', 'right', 'right', 'right', 'right', 'right']
  );

  // AddStacked chart for retirement scenarios
  const scens = [
    { name: 'Conservador', pension: retirementScenarios?.[0]?.pensionEstimada || 0, rents: Number(retirementScenarios?.[0]?.rentasConsideradas || 0) },
    { name: 'Central', pension: retirementScenarios?.[1]?.pensionEstimada || 0, rents: Number(retirementScenarios?.[1]?.rentasConsideradas || 0) },
    { name: 'Optimista', pension: retirementScenarios?.[2]?.pensionEstimada || 0, rents: Number(retirementScenarios?.[2]?.rentasConsideradas || 0) }
  ];
  drawRetirementChart(
    doc,
    state,
    'ESTUDIO COMPARATIVO DE INGRESOS MENSUALES POR PENSIÓN DE LA S.S. VS GASTO DE REFERENCIA',
    scens,
    retirementScenarios?.[1]?.gastoReferencia || metrics.retirementGap.gastoReferencia
  );

  // ==========================================
  // PAGE 7: PATRIMONIO Y NIVELES DE SEGURIDAD
  // ==========================================
  newPage(doc, state, 'Patrimonio y Niveles de Seguridad');
  heading(doc, state, '8. PROYECCIÓN DEL PATRIMONIO INTEGRAL A LOS 67 AÑOS');
  paragraph(doc, state, 'Proyección a largo plazo sumando liquidez bancaria, crecimiento de capitales invertidos y capitalizaciones periódicas mediante ahorro sistemático indexado.');
  sectionDivider(doc, state);

  const projRows = [
    ['Dinero en banco (mantenimiento líquido)', money(formData.dineroBanco), 'Colchón fáctico inmune al interés compuesto'],
    ['Dinero invertido proyectado (Interés compuesto)', money(metrics.estate.projectedInvested), `Rentabilidad del ${percent(formData.rentabilidadInversion ?? 5)} anual acumulada`],
    ['Ahorro sistemático acumulado', money(metrics.estate.projectedSaving), `Planes mensuales de ${money(formData.ahorroSistematicoMensual)} al ${percent(formData.rentabilidadAhorroSistematico ?? 6)}`],
    ['Rentas inmobiliarias acumuladas', money(metrics.estate.projectedRents), `Rentas netas percibidas hasta la edad de 67 años (${formData.destinoRentasInmobiliarias.toUpperCase()})`],
    ['Inversiones inmobiliarias de tasación', money(formData.valorInmuebles), 'Valor actual constante del inmueble declarados'],
    ['PROYECCIÓN TOTAL DE PATRIMONIO JUBILADO', money(metrics.estate.projectedTotal), 'Flujo pasivo e instrumental acumulado de retiro']
  ];
  drawTable(doc, state, ['COMPONENTE PATRIMONIAL', 'VALOR PROYECTADO', 'HIPÓTESIS Y COMENTARIOS'], [60, 42, 80], projRows);

  state.y += 4;
  const optimisticScen = (retirementScenarios || []).find((s: any) => s.name === "Optimista");
  const capitalObjetivoOptimista = optimisticScen ? optimisticScen.capitalNecesario : 0;

  drawPatrimonioProyectadoChart(
    doc,
    state,
    'Proyección de Patrimonio a la Jubilación',
    formData.edad,
    formData.dineroBanco,
    formData.dineroInvertido,
    formData.rentabilidadInversion,
    formData.rentabilidadAhorroSistematico,
    formData.ahorroSistematicoMensual,
    formData.destinoRentasInmobiliarias,
    formData.rentasInmobiliariasMensualesNetas,
    metrics.retirementGap.capitalObjetivo,
    capitalObjetivoOptimista
  );

  newPage(doc, state, 'Niveles de Seguridad');
  heading(doc, state, '9. NIVELES DE SEGURIDAD POR ÁREAS DE AUDITORÍA');
  paragraph(doc, state, 'Resumen del estado de cobertura fáctica asignada a cada pilar patrimonial básico de la consultoría.');

  const areaRows = [
    ['Fondo de Emergencia / Liquidez', `${scores.fondo}/10`, 'Colchón de seguridad líquido adecuado para transiciones.', 'Mantener liquidez controlada'],
    ['Baja Laboral (Incapacidad Temporal)', `${scores.baja}/10`, 'Brecha inicial considerable en tramo del 60% por contingencia común.', isAutonomo ? 'Contratar subsidio privado' : 'Sin acción (Régimen General)'],
    ['Incapacidad Permanente total/absoluta', `${scores.incapacidad}/10`, 'Déficit mensual superior a los 500 € frente a gastos corrientes.', 'Contratar seguro de incapacidad'],
    ['Protección Familiar (Decesos)', `${scores.familia}/10`, `Existe un déficit de protección de vida de ${money(metrics.familyNeed.deficitDeProteccion)}.`, 'Asegurar capital familiar objetivo'],
    ['Apalancamiento de Deuda', `${scores.deuda}/10`, `Ratio del ${percent(metrics.debt.ratioSobreSalario * 100)} dentro del límite saludable del 35%.`, 'Sin acción requerida inmediata'],
    ['Previsión de Jubilación de Retiro', `${scores.jubilacion}/10`, `Brecha de jubilación fáctica de ${money(metrics.retirementGap.brechaMensual)}/mes.`, 'Suscribir plan de ahorro indexado'],
    ['Patrimonio / Inflación', `${scores.inflacion}/10`, 'Inversiones acumuladas mitigan parcialmente el impacto inflacionario.', 'Revisar carteras diversificadas'],
    ['Orden Legal e Instrumental', `${scores.legal}/10`, 'Ausencia de testamento e inventario, lo que eleva el riesgo de herederos.', 'Formalizar actas notariales']
  ];
  drawTable(doc, state, ['ÁREA DE AUDITORÍA', 'PUNTOS', 'DIAGNÓSTICO ESTRATÉGICO', 'ACCIÓN RECOMENDADA'], [50, 18, 74, 40], areaRows);

  // DETALLE DE RECOMENDACIONES (¿POR QUÉ SE SUGIERE ESTO?)
  newPage(doc, state, 'Justificación de Propuestas');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.text('JUSTIFICACIÓN DE PROPUESTAS (¿POR QUÉ SE SUGIERE ESTO?)', M, state.y);
  state.y += 5;

  const suggestions = [
    {
      title: '1. Reserva de Liquidez',
      text: `Un fondo de reserva de entre 6 y 9 meses de gastos fijos (rango sugerido: ${money(metrics.expenses.total * 6)} - ${money(metrics.expenses.total * 9)}) asegura que puedas afrontar crisis empresariales, decesos o accidentes sobrevenidos sin endeudarte de forma perjudicial ni tener que liquidar de forma prematura otras inversiones a largo plazo.`
    },
    {
      title: '2. Baja Laboral (Incapacidad Temporal)',
      text: isAutonomo 
        ? `Durante los primeros 3 días de baja por enfermedad común, el trabajador no percibe subsidio público. Del día 4 al 20, la Seguridad Social solo cubre el 60% de la base reguladora (un déficit de ${money(metrics.temporaryDisability.tramo60Brecha)}/mes frente a tus gastos fijos de ${money(metrics.expenses.total)}/mes). El seguro de subsidio privado cubre esta brecha crítica inicial para evitar tener que recurrir a tus ahorros de decesos o emergencia durante convalecencias.`
        : `Bajo el Régimen General, las bajas laborales por incapacidad temporal suelen estar cubiertas en gran medida por la empresa y la Seguridad Social mediante el pago delegado, por lo que no existe la necesidad de contratar un complemento de subsidio privado ordinario, el cual se reserva especialmente para el colectivo de autónomos (RETA).`
    },
    {
      title: '3. Protección Familiar (Decesos)',
      text: metrics.familyNeed.hasNoDependents
        ? `Al encontrarse en estado civil ${formData.estadoCivil} y sin hijos menores de 25 años a su cargo, no existe una necesidad financiera de cobertura de decesos o seguro de vida para protección familiar de dependientes. Se recomienda centrarse en otros pilares como la jubilación y la optimización de liquidez, no requiriéndose la recomendación de ningún capital familiar objetivo por decesos.`
        : childrenCount > 0 
          ? `El capital objetivo recomendado de ${money(metrics.familyNeed.capitalFamiliarObjetivo)} se calcula sumando: amortización de deudas pendientes de ${money(metrics.familyNeed.detalles.deuda)}, gastos de transición inmediata de ${money(metrics.familyNeed.detalles.transicion)}, educación de tus ${childrenCount} hijos de ${money(metrics.familyNeed.detalles.educacion)} (estimando 18.000 € por hijo para estudios superiores), y protección de rentas de ${money(metrics.familyNeed.detalles.rentaNecesaria)}. Al restar tu seguro de vida existente de ${money(formData.capitalSeguroVidaExistente || 0)}, resulta un déficit de protección de ${money(metrics.familyNeed.deficitDeProteccion)} que se sugiere cubrir.${formData.conyugeConIngresos === 'Si' ? ` Se han integrado los ingresos declarados del cónyuge (${money(formData.ingresosConyuge)}/mes) dentro del cómputo de la subsistencia conjunta, reduciendo la brecha mensual familiar.` : ''}`
          : `El capital objetivo recomendado de ${money(metrics.familyNeed.capitalFamiliarObjetivo)} se calcula sumando: amortización de deudas pendientes de ${money(metrics.familyNeed.detalles.deuda)}, gastos de transición inmediata de ${money(metrics.familyNeed.detalles.transicion)} y protección de rentas de ${money(metrics.familyNeed.detalles.rentaNecesaria)} (sin incluir gastos de educación al no declararse hijos menores de 25 años). Al restar tu seguro de vida existente de ${money(formData.capitalSeguroVidaExistente || 0)}, resulta un déficit de protección de ${money(metrics.familyNeed.deficitDeProteccion)} que se sugiere cubrir.`
    },
    {
      title: '4. Apalancamiento y Deuda',
      text: `Las recomendaciones financieras y de control aconsejan no comprometer más del 35% de los ingresos ordinarios netos en el servicio de la deuda mensual. En tu caso, se evalúa una cuota mensual de ${money(metrics.debt.deudaMensualTotal)} sobre unos ingresos familiares de referencia de ${money(formData.salarioNetoMensual + (formData.conyugeConIngresos === 'Si' ? formData.ingresosConyuge : 0))} (incluyendo ${formData.conyugeConIngresos === 'Si' ? `los ingresos ordinarios del cónyuge de ${money(formData.ingresosConyuge)}` : 'únicamente los ingresos del cliente'}). Mantener este ratio de endeudamiento familiar en el ${percent(metrics.debt.ratioSobreSalario * 100)} garantiza la sostenibilidad de las finanzas familiares.`
    },
    {
      title: '5. Planificación de Jubilación',
      text: `La jubilación pública cubrirá ${money(metrics.retirementGap.pensionEstimada)}/mes, generando una brecha de ${money(metrics.retirementGap.brechaMensual)}/mes frente a tus necesidades fácticas. Para cubrir este desfase durante más de 20 años de retiro, es vital acumular ${money(metrics.retirementGap.capitalObjetivo)} a los 67 años, lo cual se logra de forma cómoda y sistemática ahorrando ${money(metrics.retirementGap.recommendedSaving)}/mes en planes eficientes con interés compuesto.`
    },
    {
      title: '6. Patrimonio y Rentas Inmobiliarias',
      text: `Las rentas inmobiliarias de ${money(formData.rentasInmobiliariasMensualesNetas)}/mes son un activo pasivo extraordinario. Si se reinvierten de manera sistemática, potencian drásticamente el crecimiento de tu patrimonio neto proyectado (estimado en ${money(metrics.estate.projectedTotal)}). Tener patrimonio diversificado es la mejor defensa frente a la inflación económica.`
    },
    {
      title: '7. Orden Legal y Sucesorio',
      text: `La ausencia de testamento o poder preventivo expone a la familia a un proceso costoso y lento de declaración de herederos judiciales, bloqueo de cuentas corrientes y posibles sobrecostes de representación. Formalizar estas actas notariales cuesta menos de 150 € y otorga blindaje sucesorio y de representación legal inmediato.`
    }
  ];

  suggestions.forEach((item) => {
    const lines = doc.splitTextToSize(item.text, W - 6);
    ensureSpace(doc, state, lines.length * 3.8 + 12);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(item.title, M, state.y);
    state.y += 3.8;
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(lines, M + 3, state.y);
    state.y += lines.length * 3.6 + 4;
  });

  // ==========================================
  // PAGE 8: PLAN DE ACCIÓN Y CIERRE
  // ==========================================
  newPage(doc, state, 'Plan de Acción y Cierre Profesional');
  heading(doc, state, '10. PLAN DE ACCIÓN PRIORIZADO DEL CLIENTE');
  paragraph(doc, state, 'Listado de acciones concretas ordenadas por prioridad estratégica para la consecución del blindaje patrimonial absoluto.');
  sectionDivider(doc, state);

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
    doc.setFillColor(254, 240, 138); // Yellow background
    doc.setDrawColor(202, 138, 4);    // Yellow-gold border
    doc.roundedRect(M, boxY, W, 18, 2, 2, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);       // Black text
    doc.text('ADVERTENCIAS Y ALERTAS PENDIENTES DE VALIDAR:', M + 4, boxY + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(26, 26, 26);    // Darker black-gray text
    const wTexts = warnings.slice(0, 2).map((w: any) => `* [${(w.type || 'ALERTA').toUpperCase()}] ${w.text || ''}`).join('   ');
    doc.text(doc.splitTextToSize(wTexts, W - 8), M + 4, boxY + 10);
    state.y += 22;
  }

  // ==========================================
  // PAGE 9: RESUMEN GENERAL DEL DIAGNÓSTICO ESTRATÉGICO
  // ==========================================
  newPage(doc, state, 'Resumen General y Conclusión');
  heading(doc, state, '11. RESUMEN GENERAL DEL DIAGNÓSTICO ESTRATÉGICO');
  paragraph(doc, state, 'Análisis global personalizado de los diferentes pilares de la auditoría patrimonial con recomendaciones finales.');
  sectionDivider(doc, state);

  ensureSpace(doc, state, 190);

  // Section 1: Previsión Social e Ingresos
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text('I. PROTECCIÓN DE INGRESOS (BAJA LABORAL E INCAPACIDAD)', M, state.y);
  state.y += 4.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BLACK);
  const p1 = `El pilar de protección de ingresos revela que, ante una situación de baja por incapacidad temporal por contingencia común, existe una desprotección en el tramo inicial de la Seguridad Social. Durante los primeros 20 días de convalecencia, el subsidio público es de tan solo el 60% de la base reguladora, lo que genera un déficit inicial estimado de ${money(metrics.temporaryDisability.tramo60Brecha)}/mes frente a tus gastos mensuales fijos de ${money(metrics.expenses.total)}/mes. ${isAutonomo ? 'Al estar en el régimen RETA (Autónomos), recomendamos encarecidamente contratar un subsidio privado de baja laboral para complementar este tramo crítico.' : 'Dado que te encuentras bajo el Régimen General, esta brecha suele estar amortiguada por la cobertura y convenios de la empresa, por lo que no es de aplicación necesaria un subsidio privado de baja laboral.'} Asimismo, en supuestos graves de incapacidad permanente total (IPT) o absoluta (IPA), el desfase de ingresos respecto a tus compromisos presupuestarios podría cronificarse, por lo que sugerimos revisar o ampliar tus capitales asegurados por invalidez.`;
  const p1Lines = doc.splitTextToSize(p1, W);
  doc.text(p1Lines, M, state.y);
  state.y += p1Lines.length * 3.8 + 12;

  // Section 2: Protección Familiar y Decesos
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text('II. BLINDAJE Y PROTECCIÓN FAMILIAR (DECESOS)', M, state.y);
  state.y += 4.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BLACK);
  const p2 = metrics.familyNeed.hasNoDependents
    ? `Al encontrarse en estado civil ${formData.estadoCivil} y sin hijos menores de 25 años a su cargo, no se establece necesidad de protección familiar de rentas o capital de vida para herederos dependientes. No procede la recomendación de un capital objetivo de vida familiar en este escenario.`
    : `El blindaje familiar frente a fallecimiento o invalidez requiere garantizar la estabilidad financiera de tus dependientes. El capital objetivo idóneo estimado asciende a ${money(metrics.familyNeed.capitalFamiliarObjetivo)}, desglosado en: amortización de tus deudas (${money(metrics.familyNeed.detalles.deuda)}), gastos de transición y sepelio (${money(metrics.familyNeed.detalles.transicion)}), fondos previstos para estudios de tus hijos (${money(metrics.familyNeed.detalles.educacion)}), y una renta familiar de transición de ${money(metrics.familyNeed.detalles.rentaNecesaria)} (equivalente a 10 años de brecha de vida). Tras restar el capital de vida que tienes contratado actualmente (${money(formData.capitalSeguroVidaExistente)}), resulta un déficit neto de protección familiar de ${money(metrics.familyNeed.deficitDeProteccion)}. Es prioritario incrementar tus seguros de vida vigentes para neutralizar este riesgo estructural.`;
  const p2Lines = doc.splitTextToSize(p2, W);
  doc.text(p2Lines, M, state.y);
  state.y += p2Lines.length * 3.8 + 12;

  // Section 3: Liquidez y Apalancamiento de Deuda
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text('III. LIQUIDEZ DE EMERGENCIA Y APALANCAMIENTO DE DEUDA', M, state.y);
  state.y += 4.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BLACK);
  const baseIngresosText = formData.conyugeConIngresos === 'Si' ? 'ingresos familiares netos conjuntos' : 'tu salario neto ordinario';
  const p3 = `Dispones de una reserva de liquidez bancaria de ${money(formData.dineroBanco)}, equivalente a ${metrics.liquidity.mesesCubiertos.toFixed(1)} meses de gastos recurrentes fijos. Aunque te permite resolver incidencias cotidianas menores, aconsejamos consolidar de forma prioritaria un fondo equivalente a entre 6 y 9 meses de gastos fijos para blindar plenamente tu liquidez operativa. Por otro lado, tu servicio de deuda mensual de ${money(metrics.debt.deudaMensualTotal)} supone un ratio sobre ${baseIngresosText} del ${percent(metrics.debt.ratioSobreSalario * 100)}, situándose en una posición muy saludable y controlada, holgadamente por debajo del límite prudencial máximo aconsejado por las autoridades del 35%.`;
  const p3Lines = doc.splitTextToSize(p3, W);
  doc.text(p3Lines, M, state.y);
  state.y += p3Lines.length * 3.8 + 12;

  // Section 4: Jubilación y Patrimonio
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text('IV. PLANIFICACIÓN DE JUBILACIÓN, PATRIMONIO E INFLACIÓN', M, state.y);
  state.y += 4.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BLACK);
  const p4 = `En el escenario central, tu jubilación pública previsible será de ${money(metrics.retirementGap.pensionEstimada)}/mes, lo que creará una brecha fáctica de retiro de ${money(metrics.retirementGap.brechaMensual)}/mes frente a tu presupuesto. Para mantener tu nivel de vida sin descapitalizarte durante 23 años de jubilación, debes acumular a los 67 años un capital de retiro objetivo de ${money(metrics.retirementGap.capitalObjetivo)}. Puedes lograrlo de forma progresiva ahorrando ${money(metrics.retirementGap.recommendedSaving)}/mes en una solución indexada eficiente que aproveche el interés compuesto. Tus rentas inmobiliarias netas (${money(formData.rentasInmobiliariasMensualesNetas)}/mes) representan un motor formidable; si las reinviertes sistemáticamente, impulsarán tu patrimonio total neto proyectado de jubilación hasta un estimado de ${money(metrics.estate.projectedTotal)}.`;
  const p4Lines = doc.splitTextToSize(p4, W);
  doc.text(p4Lines, M, state.y);
  state.y += p4Lines.length * 3.8 + 12;

  // Section 5: Orden Legal y Sucesorio
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text('V. BLINDAJE SUCESORIO Y ORDEN LEGAL', M, state.y);
  state.y += 4.5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BLACK);
  const p5 = `El análisis del orden legal revela áreas de vulnerabilidad importantes. La falta de testamento formal o poder preventivo notarial expone a tu familia a costes imprevistos de declaración de herederos judiciales, bloqueos provisionales de cuentas bancarias y potenciales disputas sucesorias. Se recomienda acudir al notario para protocolizar estas actas básicas, cuyo coste es insignificante y proporcionan un blindaje operativo y sucesorio inmediato.`;
  const p5Lines = doc.splitTextToSize(p5, W);
  doc.text(p5Lines, M, state.y);
  state.y += p5Lines.length * 3.8 + 12;

  // Closing Note block
  ensureSpace(doc, state, 30);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text('NOTA METODOLÓGICA', M, state.y);
  state.y += 4.5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...BLACK);
  const pMethod = 'Este diagnóstico representa una foto matemática rigurosa basada en el modelo legal y de previsión de la Seguridad Social de España. Para corregir las brechas identificadas, ordenar su patrimonio o formalizar los complementos de ahorro de jubilación, puede ponerse en contacto con José Carlos Hidalgo en josecarlos@hilolegal.es o en el teléfono 647 50 60 40.';
  const pMethodLines = doc.splitTextToSize(pMethod, W);
  doc.text(pMethodLines, M, state.y);
  state.y += pMethodLines.length * 3.8 + 12;

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
