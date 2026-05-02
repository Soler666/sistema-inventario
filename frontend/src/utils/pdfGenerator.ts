import jsPDF from 'jspdf';

interface Producto {
  id: string;
  name: string;
  sku: string;
  minStock: number;
  currentStock: number;
  unit: string;
  category: string | null;
}

interface Movimiento {
  id: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}

export function generateInventoryReport(
  productos: Producto[],
  movimientos: Movimiento[],
  titulo: string = 'Reporte de Inventario'
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, pageWidth / 2, currentY, { align: 'center' });
  
  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date().toLocaleString('es-ES');
  doc.text(`Generado el: ${fecha}`, pageWidth / 2, currentY + 8, { align: 'center' });
  
  currentY += 20;

  // Resumen
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General', 15, currentY);
  currentY += 10;

  const productosCriticos = productos.filter(p => p.currentStock <= p.minStock);
  const productosBajos = productos.filter(p => {
    const ratio = p.currentStock / p.minStock;
    return ratio > 1 && ratio <= 1.5;
  });
  const productosSaludables = productos.filter(p => p.currentStock > p.minStock * 1.5);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Productos: ${productos.length}`, 20, currentY);
  doc.setTextColor(220, 38, 38);
  doc.text(`Stock Crítico: ${productosCriticos.length}`, 20, currentY + 6);
  doc.setTextColor(180, 83, 9);
  doc.text(`Stock Bajo: ${productosBajos.length}`, 20, currentY + 12);
  doc.setTextColor(34, 197, 94);
  doc.text(`Stock Normal: ${productosSaludables.length}`, 20, currentY + 18);
  doc.setTextColor(0, 0, 0);

  currentY += 32;

  // Tabla de Inventario
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Estado del Inventario', 15, currentY);
  currentY += 10;

  const tableData = productos.map(p => {
    const ratio = p.currentStock / p.minStock;
    let estado = 'Normal';
    if (ratio <= 1) estado = 'CRÍTICO';
    else if (ratio <= 1.5) estado = 'BAJO';

    return [
      p.name,
      p.sku,
      p.currentStock.toString(),
      p.minStock.toString(),
      estado
    ];
  });

  const columns = ['Producto', 'SKU', 'Stock Actual', 'Stock Mínimo', 'Estado'];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  let xPos = 15;
  const colWidth = (pageWidth - 30) / 5;

  columns.forEach((col, i) => {
    doc.text(col, xPos + (i * colWidth), currentY);
  });

  currentY += 8;
  doc.setLineWidth(0.5);
  doc.line(15, currentY - 2, pageWidth - 15, currentY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const rowsPerPage = 12;
  let rowIndex = 0;

  tableData.forEach((row, idx) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }

    row.forEach((cell, cellIdx) => {
      doc.text(cell, 15 + (cellIdx * colWidth), currentY);
    });

    currentY += 7;
  });

  // Estadísticas de Movimientos
  currentY += 10;
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Estadísticas de Movimientos', 15, currentY);
  currentY += 10;

  const entradas = movimientos.filter(m => m.type === 'ENTRY').length;
  const salidas = movimientos.filter(m => m.type === 'EXIT').length;
  const totalMovimientos = movimientos.length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Movimientos: ${totalMovimientos}`, 20, currentY);
  doc.setTextColor(34, 197, 94);
  doc.text(`Entradas: ${entradas}`, 20, currentY + 6);
  doc.setTextColor(220, 38, 38);
  doc.text(`Salidas: ${salidas}`, 20, currentY + 12);
  doc.setTextColor(0, 0, 0);

  // Footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadReportPDF(
  productos: Producto[],
  movimientos: Movimiento[],
  nombreArchivo: string = 'reporte-inventario.pdf'
) {
  const doc = generateInventoryReport(productos, movimientos);
  doc.save(nombreArchivo);
}
