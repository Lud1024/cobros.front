import { formatCurrency, formatDate, parseDateLocal } from './formatters';

const COMPANY_NAME = 'CREDITOS LA UNION';
const COMPANY_SUBTITLE = 'Sistema de creditos y cobros';
const COMPANY_PHONE = 'Tel. 1234-5678';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
const sameId = (left, right) => String(left ?? '') === String(right ?? '');

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const money = (value) => escapeHtml(formatCurrency(roundMoney(value)));

const safeDate = (value) => {
  const formatted = formatDate(value);
  return formatted || 'N/A';
};

const sortCuotas = (cuotas = []) => [...cuotas].sort((a, b) => {
  const byDate = String(a.fecha_vencimiento || '').localeCompare(String(b.fecha_vencimiento || ''));
  if (byDate !== 0) return byDate;
  return toNumber(a.numero_cuota) - toNumber(b.numero_cuota);
});

const isPendingCuota = (cuota) => {
  const estado = String(cuota?.estado || '').toLowerCase();
  return estado !== 'cancelada' && estado !== 'pagada' && toNumber(cuota?.saldo_pendiente) > 0.004;
};

const addDays = (dateValue, days) => {
  const date = parseDateLocal(dateValue);
  if (!date || Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date;
};

const getCuotaTotal = (cuota) => roundMoney(
  toNumber(cuota?.monto_cuota) ||
  toNumber(cuota?.capital_programado) + toNumber(cuota?.interes_programado) + toNumber(cuota?.mora_acumulada)
);

const getCuotaPagado = (cuota) => roundMoney(
  toNumber(cuota?.monto_pagado) ||
  toNumber(cuota?.capital_pagado) + toNumber(cuota?.interes_pagado) + toNumber(cuota?.mora_pagada)
);

const getCuotaSaldo = (cuota) => roundMoney(
  cuota?.saldo_pendiente !== undefined
    ? cuota.saldo_pendiente
    : getCuotaTotal(cuota) - getCuotaPagado(cuota)
);

const getNextCuota = (cuotas = []) => sortCuotas(cuotas).find(isPendingCuota) || null;

const buildLoanSummary = (cuotas = [], prestamo = {}) => {
  const totalProgramado = cuotas.reduce((sum, cuota) => sum + getCuotaTotal(cuota), 0);
  const totalPagado = cuotas.reduce((sum, cuota) => sum + getCuotaPagado(cuota), 0);
  const saldoPendiente = cuotas.reduce((sum, cuota) => sum + getCuotaSaldo(cuota), 0);
  const capitalPagado = cuotas.reduce((sum, cuota) => sum + toNumber(cuota.capital_pagado), 0);
  const capitalProgramado = cuotas.reduce((sum, cuota) => sum + toNumber(cuota.capital_programado), 0);
  const montoPrestamo = toNumber(prestamo.monto_prestamo || prestamo.monto);

  return {
    totalProgramado: roundMoney(totalProgramado || montoPrestamo),
    totalPagado: roundMoney(totalPagado),
    saldoPendiente: roundMoney(saldoPendiente),
    capitalPagado: roundMoney(capitalPagado),
    capitalPendiente: roundMoney(Math.max(0, (capitalProgramado || montoPrestamo) - capitalPagado)),
  };
};

const getMoraStartDate = (cuota) => {
  const startDate = addDays(cuota?.fecha_vencimiento, 1);
  return startDate ? formatDate(startDate) : 'N/A';
};

const row = (label, value) => `
  <div class="row">
    <span class="label">${escapeHtml(label)}</span>
    <span class="value">${escapeHtml(value)}</span>
  </div>
`;

const fullRow = (label, value) => `
  <div class="full-row">
    <span class="label">${escapeHtml(label)}</span>
    <span>${escapeHtml(value)}</span>
  </div>
`;

const sectionTitle = (title) => `<div class="section-title">${escapeHtml(title)}</div>`;

const brandHeader = () => `
  <header class="header">
    <div class="logo-wrap">
      <div class="logo-mark">CU</div>
      <div>
        <div class="company">${escapeHtml(COMPANY_NAME)}</div>
        <div class="company-sub">${escapeHtml(COMPANY_SUBTITLE)}</div>
      </div>
    </div>
    <div class="company-phone">${escapeHtml(COMPANY_PHONE)}</div>
  </header>
`;

const receiptStyles = `
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  body {
    width: 78mm;
    margin: 0;
    padding: 3mm;
    color: #111;
    background: #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .header {
    padding-bottom: 2mm;
    border-bottom: 2px solid #111;
    text-align: center;
  }
  .logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2mm;
  }
  .logo-mark {
    width: 12mm;
    height: 12mm;
    border: 2px solid #111;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11pt;
    font-weight: 900;
  }
  .company {
    font-size: 12pt;
    font-weight: 900;
    letter-spacing: .4px;
  }
  .company-sub, .company-phone {
    font-size: 7.5pt;
    font-weight: 700;
  }
  .title {
    margin: 2.5mm 0 2mm;
    text-align: center;
    font-size: 11pt;
    font-weight: 900;
    letter-spacing: .5px;
  }
  .subtitle {
    margin-top: -1mm;
    margin-bottom: 2mm;
    text-align: center;
    font-size: 7.5pt;
    font-weight: 700;
  }
  .section {
    margin: 2mm 0;
    padding-top: 1mm;
    border-top: 1px dashed #111;
  }
  .section-title {
    margin-bottom: 1mm;
    font-size: 7.5pt;
    font-weight: 900;
    text-transform: uppercase;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 2mm;
    margin: .6mm 0;
  }
  .label {
    font-weight: 900;
  }
  .value {
    text-align: right;
    font-weight: 700;
  }
  .full-row {
    margin: .8mm 0;
  }
  .amount {
    margin: 2.5mm 0;
    padding: 2mm 1mm;
    border: 2px solid #111;
    text-align: center;
    font-size: 15pt;
    font-weight: 900;
  }
  .small {
    font-size: 7.2pt;
  }
  .warning-box {
    margin: 2mm 0;
    padding: 1.5mm;
    border: 2px solid #111;
    font-weight: 900;
    text-align: center;
  }
  .items {
    width: 100%;
    border-collapse: collapse;
  }
  .items th, .items td {
    padding: .7mm 0;
    border-bottom: 1px dotted #999;
    text-align: left;
    vertical-align: top;
  }
  .items th:last-child, .items td:last-child {
    text-align: right;
  }
  .signature {
    margin-top: 9mm;
    text-align: center;
    font-size: 7.5pt;
    font-weight: 700;
  }
  .signature-line {
    width: 75%;
    margin: 0 auto 1mm;
    border-top: 1.5px solid #111;
  }
  .footer {
    margin-top: 2mm;
    padding-top: 1.5mm;
    border-top: 1px dashed #111;
    text-align: center;
    font-size: 7pt;
    font-weight: 700;
  }
  @media print {
    body { width: 78mm; }
  }
`;

const buildDocument = (title, body) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>${receiptStyles}</style>
    </head>
    <body>${body}</body>
  </html>
`;

export const createPrintWindow = () => {
  const printWindow = window.open('', '_blank', 'width=420,height=720');
  if (printWindow) {
    printWindow.document.write(buildDocument('Preparando impresion', `
      ${brandHeader()}
      <div class="title">PREPARANDO IMPRESION</div>
      <div class="subtitle">Un momento...</div>
    `));
    printWindow.document.close();
  }
  return printWindow;
};

const writeAndPrint = (html, printWindow) => {
  const targetWindow = printWindow || window.open('', '_blank', 'width=420,height=720');
  if (!targetWindow) return false;

  targetWindow.document.open();
  targetWindow.document.write(html);
  targetWindow.document.close();
  targetWindow.onload = () => {
    targetWindow.focus();
    setTimeout(() => targetWindow.print(), 250);
  };
  return true;
};

export const closePrintWindow = (printWindow) => {
  if (printWindow && !printWindow.closed) {
    printWindow.close();
  }
};

export const printPaymentReceipt = ({ pago, prestamo, cliente, cuotas = [], aplicaciones = [] }, printWindow) => {
  const cuotasPrestamo = cuotas.filter((cuota) => sameId(cuota.id_prestamo, pago.id_prestamo));
  const nextCuota = getNextCuota(cuotasPrestamo);
  const summary = buildLoanSummary(cuotasPrestamo, prestamo);
  const aplicacionesPago = aplicaciones.filter((item) => sameId(item.id_pago, pago.id_pago));
  const appliedByConcept = aplicacionesPago.reduce((acc, item) => {
    const key = String(item.aplicado_a || '').toUpperCase();
    acc[key] = roundMoney((acc[key] || 0) + toNumber(item.monto_aplicado));
    return acc;
  }, {});
  const totalAplicado = Object.values(appliedByConcept).reduce((sum, value) => sum + value, 0);
  const saldoNoAplicado = Math.max(0, roundMoney(toNumber(pago.monto_recibido) - totalAplicado));

  const applicationRows = aplicacionesPago.length
    ? aplicacionesPago.map((item) => {
        const cuota = cuotasPrestamo.find((c) => sameId(c.id_cuota, item.id_cuota));
        return `
          <tr>
            <td>Cuota #${escapeHtml(cuota?.numero_cuota || item.id_cuota)}</td>
            <td>${escapeHtml(item.aplicado_a)}</td>
            <td>${money(item.monto_aplicado)}</td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="3">Aplicacion automatica registrada en el sistema</td></tr>`;

  const body = `
    ${brandHeader()}
    <div class="title">RECIBO DE PAGO</div>
    <div class="subtitle">Comprobante para el cliente</div>

    <div class="section">
      ${row('Recibo No.', pago.numero_recibo || pago.id_pago)}
      ${row('Pago ID', pago.id_pago)}
      ${row('Fecha pago', safeDate(pago.fecha_pago))}
      ${row('Impreso', formatDate(new Date(), true))}
      ${row('Cajero/Gestor', pago.origen || 'Sistema')}
    </div>

    <div class="section">
      ${sectionTitle('Cliente')}
      ${fullRow('Nombre:', cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() : 'N/A')}
      ${row('DPI', cliente?.dpi || 'N/A')}
      ${row('Telefono', cliente?.telefono || 'N/A')}
    </div>

    <div class="section">
      ${sectionTitle('Prestamo')}
      ${row('Prestamo No.', pago.id_prestamo)}
      ${row('Monto original', money(prestamo?.monto_prestamo || prestamo?.monto))}
      ${row('Tasa anual', `${toNumber(prestamo?.tasa_interes_anual || prestamo?.tasa_interes).toFixed(2)}%`)}
      ${row('Plazo', `${prestamo?.plazo_cuotas || prestamo?.plazo_meses || 'N/A'} cuotas`)}
      ${row('Estado', prestamo?.estado || 'N/A')}
    </div>

    <div class="amount">${money(pago.monto_recibido)}</div>

    <div class="section">
      ${sectionTitle('Forma de pago')}
      ${row('Metodo', pago.metodo_pago || 'N/A')}
      ${row('Mora aplicada', money(appliedByConcept.MORA || 0))}
      ${row('Interes aplicado', money(appliedByConcept.INTERES || 0))}
      ${row('Capital aplicado', money(appliedByConcept.CAPITAL || 0))}
      ${saldoNoAplicado > 0 ? row('Saldo no aplicado', money(saldoNoAplicado)) : ''}
    </div>

    <div class="section">
      ${sectionTitle('Detalle aplicado')}
      <table class="items">
        <thead>
          <tr><th>Cuota</th><th>Concepto</th><th>Monto</th></tr>
        </thead>
        <tbody>${applicationRows}</tbody>
      </table>
    </div>

    <div class="section">
      ${sectionTitle('Resumen del prestamo')}
      ${row('Total programado', money(summary.totalProgramado))}
      ${row('Pagado total', money(summary.totalPagado))}
      ${row('Saldo pendiente', money(summary.saldoPendiente))}
      ${row('Capital pagado', money(summary.capitalPagado))}
      ${row('Capital pendiente', money(summary.capitalPendiente))}
    </div>

    <div class="section">
      ${sectionTitle('Siguiente cuota')}
      ${nextCuota
        ? `
          ${row('Cuota No.', nextCuota.numero_cuota)}
          ${row('Vence', safeDate(nextCuota.fecha_vencimiento))}
          ${row('Monto cuota', money(getCuotaTotal(nextCuota)))}
          ${row('Saldo cuota', money(getCuotaSaldo(nextCuota)))}
          ${row('Mora desde', getMoraStartDate(nextCuota))}
        `
        : '<div class="full-row">No hay cuotas pendientes.</div>'}
    </div>

    ${pago.observaciones ? `
      <div class="section">
        ${sectionTitle('Observaciones')}
        <div class="small">${escapeHtml(pago.observaciones)}</div>
      </div>
    ` : ''}

    <div class="signature">
      <div class="signature-line"></div>
      Firma del cliente
    </div>

    <div class="footer">
      <div>Conserve este comprobante.</div>
      <div>Pago sujeto a validacion del sistema.</div>
    </div>
  `;

  return writeAndPrint(buildDocument(`Recibo de Pago #${pago.numero_recibo || pago.id_pago}`, body), printWindow);
};

export const printNoEncontradoTicket = ({ visita, prestamo, cliente, cuotas = [], politica = null }, printWindow) => {
  const cuotasPrestamo = cuotas.filter((cuota) => sameId(cuota.id_prestamo, visita.id_prestamo));
  const cuota = getNextCuota(cuotasPrestamo);
  const summary = buildLoanSummary(cuotasPrestamo, prestamo);
  const moraStart = cuota ? getMoraStartDate(cuota) : 'N/A';

  const body = `
    ${brandHeader()}
    <div class="title">AVISO DE VISITA</div>
    <div class="subtitle">Cliente no localizado</div>

    <div class="warning-box">
      Hoy se realizo una visita de cobro y no fue posible localizarle.
    </div>

    <div class="section">
      ${row('Visita No.', visita?.id_visita || 'Pendiente')}
      ${row('Fecha visita', visita?.fecha_visita ? safeDate(visita.fecha_visita) : formatDate(new Date(), true))}
      ${row('Resultado', 'No localizado')}
    </div>

    <div class="section">
      ${sectionTitle('Cliente')}
      ${fullRow('Nombre:', cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() : 'N/A')}
      ${row('DPI', cliente?.dpi || 'N/A')}
      ${row('Telefono', cliente?.telefono || 'N/A')}
      ${cliente?.direccion ? fullRow('Direccion:', cliente.direccion) : ''}
    </div>

    <div class="section">
      ${sectionTitle('Prestamo')}
      ${row('Prestamo No.', visita.id_prestamo)}
      ${row('Monto original', money(prestamo?.monto_prestamo || prestamo?.monto))}
      ${row('Tasa anual', `${toNumber(prestamo?.tasa_interes_anual || prestamo?.tasa_interes).toFixed(2)}%`)}
      ${row('Plazo', `${prestamo?.plazo_cuotas || prestamo?.plazo_meses || 'N/A'} cuotas`)}
      ${row('Saldo pendiente', money(summary.saldoPendiente))}
    </div>

    <div class="section">
      ${sectionTitle('Cuota pendiente')}
      ${cuota
        ? `
          ${row('Cuota No.', cuota.numero_cuota)}
          ${row('Vencimiento', safeDate(cuota.fecha_vencimiento))}
          ${row('Monto cuota', money(getCuotaTotal(cuota)))}
          ${row('Pagado cuota', money(getCuotaPagado(cuota)))}
          ${row('Saldo cuota', money(getCuotaSaldo(cuota)))}
        `
        : '<div class="full-row">No se encontraron cuotas pendientes para este prestamo.</div>'}
    </div>

    <div class="warning-box">
      La mora empieza a correr desde: ${escapeHtml(moraStart)}
    </div>

    <div class="section">
      ${sectionTitle('Politica de mora')}
      ${politica
        ? `
          ${row('Tasa diaria', `${toNumber(politica.tasa_mora_diaria).toFixed(2)}%`)}
          ${row('Tope de mora', money(politica.tope_mora))}
        `
        : '<div class="full-row">Consulte la politica vigente con el gestor.</div>'}
    </div>

    ${visita?.mensaje_dejado ? `
      <div class="section">
        ${sectionTitle('Mensaje')}
        <div class="small">${escapeHtml(visita.mensaje_dejado)}</div>
      </div>
    ` : ''}

    <div class="footer">
      <div>Por favor comuniquese con su gestor o acerquese a cancelar su cuota.</div>
      <div>Este aviso no sustituye el estado de cuenta oficial.</div>
    </div>
  `;

  return writeAndPrint(buildDocument(`Aviso de Visita Prestamo #${visita.id_prestamo}`, body), printWindow);
};
