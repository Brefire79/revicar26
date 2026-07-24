import { jsPDF } from 'jspdf';
import { Vehicle, MaintenanceLog, ReminderRule } from '../types';

export function generateVehiclePdfReport(
  vehicle: Vehicle,
  logs: MaintenanceLog[],
  reminders: ReminderRule[],
  isForBuyer: boolean = false
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PASSAPORTE DE MANUTENÇÃO VEICULAR', 14, y + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    isForBuyer
      ? 'Relatório Oficial para Compradores - Histórico Verificado'
      : 'Relatório Completo de Gestão Preventiva & Peças',
    14,
    y + 15
  );

  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 14, y + 15, {
    align: 'right',
  });

  y = 48;

  // Vehicle Information Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 36, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${vehicle.make} ${vehicle.model} (${vehicle.year})`, 20, y + 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Placa: ${vehicle.licensePlate}`, 20, y + 18);
  doc.text(`Hodômetro Atual: ${vehicle.currentOdometer.toLocaleString('pt-BR')} km`, 20, y + 25);
  doc.text(`Combustível: ${vehicle.fuelType}`, 20, y + 32);

  doc.text(`Chassi (VIN): ${vehicle.vin || 'Não informado'}`, 110, y + 18);
  doc.text(`Pontuação de Conservação: ${vehicle.resaleScore}/100`, 110, y + 25);
  doc.text(`Média Diária: ~${vehicle.averageDailyKm} km/dia`, 110, y + 32);

  y += 46;

  // Key Statistics Summary
  const totalSpent = logs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalParts = logs.reduce((acc, curr) => acc + curr.partsReplaced.length, 0);

  doc.setFillColor(37, 99, 235); // Blue 600
  doc.roundedRect(14, y, 55, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('REVISÕES REGISTRADAS', 18, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${logs.length} Registros`, 18, y + 13);

  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.roundedRect(73, y, 55, 18, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('PEÇAS TROCADAS', 77, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalParts} Peças Cataloga.`, 77, y + 13);

  if (!isForBuyer) {
    doc.setFillColor(99, 102, 241); // Indigo
    doc.roundedRect(132, y, 64, 18, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('INVESTIMENTO TOTAL', 136, y + 6);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${totalSpent.toLocaleString('pt-BR')}`, 136, y + 13);
  } else {
    doc.setFillColor(14, 165, 233); // Sky
    doc.roundedRect(132, y, 64, 18, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('SELO DE AUTENTICIDADE', 136, y + 6);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFICADO E AUDITADO', 136, y + 13);
  }

  y += 28;

  // Maintenance History Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('HISTÓRICO DE MANUTENÇÃO & PEÇAS TROCADAS', 14, y);
  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, pageWidth - 14, y + 2);

  y += 8;

  logs.forEach((log, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, pageWidth - 28, 8, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`${new Date(log.date).toLocaleDateString('pt-BR')} | ${log.title}`, 18, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${log.odometerKm.toLocaleString('pt-BR')} KM`, 120, y + 5.5);

    if (!isForBuyer) {
      doc.text(`R$ ${log.totalCost.toLocaleString('pt-BR')}`, pageWidth - 18, y + 5.5, { align: 'right' });
    } else {
      doc.text(log.isVerified ? ' Verificado' : ' Regular', pageWidth - 18, y + 5.5, { align: 'right' });
    }

    y += 10;

    if (log.mechanicShop || log.mechanicName) {
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Oficina / Mecânico: ${log.mechanicShop || ''} ${log.mechanicName ? `(${log.mechanicName})` : ''}`,
        20,
        y
      );
      y += 4.5;
    }

    if (log.partsReplaced && log.partsReplaced.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text('Peças Instaladas:', 20, y);
      y += 4;

      log.partsReplaced.forEach((part) => {
        doc.setFont('helvetica', 'normal');
        doc.text(
          `• ${part.name} - Marca: ${part.brand}${part.partNumber ? ` [Cód: ${part.partNumber}]` : ''} (Qtd: ${part.quantity})`,
          24,
          y
        );
        y += 4;
      });
    }

    if (log.notes) {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.text(`Obs: ${log.notes}`, 20, y);
      y += 5;
    }

    y += 3;
  });

  // Upcoming Reminders
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  y += 5;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PRÓXIMAS MANUTENÇÕES PREVENTIVAS RECOMENDADAS', 14, y);
  doc.line(14, y + 2, pageWidth - 14, y + 2);
  y += 8;

  reminders.slice(0, 4).forEach((rem) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(rem.title, 18, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Meta: ${rem.targetKm.toLocaleString('pt-BR')} km`, 120, y);
    doc.text(`Previsão: ${new Date(rem.targetDate).toLocaleDateString('pt-BR')}`, 160, y);

    y += 5;
  });

  // Verification Footer / Watermark
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Passaporte Veicular Gerado via Sistema PWA Gestão Veicular. Registros e hodômetro auditados digitalmente.',
    pageWidth / 2,
    287,
    { align: 'center' }
  );

  doc.save(`Passaporte_Veicular_${vehicle.licensePlate}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
