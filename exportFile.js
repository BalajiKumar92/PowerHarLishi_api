const ExcelJS = require('exceljs');

async function exportToExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('CPR Scanner');

  // Define columns
  worksheet.columns = [
    { header: 'Stock', key: 'stock', width: 15 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Weekly CPR', key: 'weekly', width: 15 },
    { header: 'Daily CPR', key: 'daily', width: 15 },
    { header: 'Setup', key: 'setup', width: 25 },
  ];

  // Add rows
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Style header
  worksheet.getRow(1).font = { bold: true };

  // Save file
  await workbook.xlsx.writeFile('cpr_results.xlsx');

  console.log('✅ Excel file created: cpr_results.xlsx');
}

module.exports = {
  exportToExcel,
};
