import { User, VacationDay, I18nInstanceType } from '../types';

export const printVacationRequest = (
  user: User,
  vacationsToPrint: VacationDay[],
  monthYearDisplay: string,
  i18n: I18nInstanceType
) => {
  if (vacationsToPrint.length === 0) {
    alert(i18n.t('vacationPage.alertNoPrintableVacations'));
    return;
  }

  const printTitle = i18n.t('vacationPage.printForm.title');
  const companyLogoPlaceholder = i18n.t('vacationPage.printForm.companyLogoPlaceholder');
  const companyName = i18n.t('vacationPage.printForm.companyName');
  const companyAddress = i18n.t('vacationPage.printForm.companyAddress');
  const employeeNameLabel = i18n.t('vacationPage.printForm.employeeName');
  const requestDateLabel = i18n.t('vacationPage.printForm.requestDate');
  const requestedDaysLabel = i18n.t('vacationPage.printForm.requestedDays');
  const adminSignatureLabel = i18n.t('vacationPage.printForm.adminSignature');
  const employeeSignatureLabel = i18n.t('vacationPage.printForm.employeeSignature');
  const dateTableHeader = i18n.t('dailyLog.dateHeader');
  const statusTableHeader = i18n.t('adminDashboardPage.statusColumn', 'Status');

  const printWindow = window.open('', '_blank', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header img { max-height: 60px; margin-bottom: 10px; }
            .company-info { font-size: 10px; color: #555; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-block { width: 45%; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 10px; }
            .details-section { margin-bottom: 20px; }
            .details-section p { margin: 3px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>${companyLogoPlaceholder}</div>
            <h2>${companyName}</h2>
            <p class="company-info">${companyAddress}</p>
          </div>
          <h1>${printTitle}</h1>
          <div class="details-section">
            <p><strong>${employeeNameLabel}</strong> ${user.name}</p>
            <p><strong>${requestDateLabel}</strong> ${new Date().toLocaleDateString(i18n.language)}</p>
          </div>
          <h3>${requestedDaysLabel} (${monthYearDisplay})</h3>
          <table>
            <thead>
              <tr>
                <th>${dateTableHeader}</th>
                <th>${statusTableHeader}</th>
              </tr>
            </thead>
            <tbody>
              ${vacationsToPrint.map(v => `
                <tr>
                  <td>${new Date(v.date + 'T00:00:00').toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  <td>${i18n.t(`vacationStatuses.${v.status}`)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line">${employeeSignatureLabel}</div>
            </div>
            <div class="signature-block">
              <div class="signature-line">${adminSignatureLabel}</div>
            </div>
          </div>
          <script type="text/javascript">
            setTimeout(function() { window.print(); /* window.close(); */ }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};
