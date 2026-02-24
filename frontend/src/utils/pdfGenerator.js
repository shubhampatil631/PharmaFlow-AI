import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

export const downloadReportPdf = async (taskId, reportName) => {
    try {
        const loadingToast = toast.loading('Generating PDF...');

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const url = `${baseUrl}/reports/download/${taskId}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch report content');
        }

        const htmlContent = await response.text();

        // Create a temporary container
        const element = document.createElement('div');
        element.innerHTML = htmlContent;

        // Extract molecule name from h1 (fallback to reportName)
        let docTitle = reportName || "PharmaFlow Report";
        const h1Elem = element.querySelector('h1');
        if (h1Elem) docTitle = h1Elem.innerText.trim();

        // FIXED: Inject PDF-specific styles to prevent blank pages and orphans
        const style = document.createElement('style');
        style.innerHTML = `
            .page { 
                border-bottom: none !important; 
                margin: 0 !important; 
                box-shadow: none !important;
                height: auto !important;
                min-height: auto !important;
                width: 100% !important;
                box-sizing: border-box !important;
                position: relative !important;
                overflow: visible !important;
                page-break-after: always !important;
            }

            /* Prevent elements from being sliced in half or orphaned */
            h1, h2, h3, h4, h5, .header {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
            }
            p, li, tr, .metric-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            /* Hide the hardcoded HTML footers from old generated reports */
            .footer, .header > div:last-child {
                display: none !important;
            }

            body { margin: 0 !important; padding: 0 !important; background: white !important; }
        `;
        element.appendChild(style);

        // Manually remove page-break-after from the very last .page element 
        // to prevent html2pdf from spawning an empty trailing page.
        const pages = element.querySelectorAll('.page');
        if (pages.length > 0) {
            pages[pages.length - 1].style.setProperty('page-break-after', 'auto', 'important');
        }

        const options = {
            margin: [0, 0, 15, 0], // Top, Left, Bottom, Right margin in mm
            filename: reportName || `report_${taskId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: 0,
                windowWidth: 794 // 210mm at 96 DPI approx
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        // Generate PDF and inject global headers/footers via jsPDF directly
        await html2pdf()
            .set(options)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(8);
                    pdf.setTextColor(148, 163, 184); // slate-400

                    // Draw Footer "CONFIDENTIAL • Molecule" (15mm from left edge, 287mm from top)
                    pdf.text(`CONFIDENTIAL \u2022 ${docTitle}`, 15, 287);

                    // Draw Page Number (195mm from left, 287mm from top, right aligned)
                    pdf.text(`Page ${i} of ${totalPages}`, 195, 287, { align: 'right' });
                }
            })
            .save();

        toast.dismiss(loadingToast);
        toast.success('Report downloaded successfully');

    } catch (error) {
        console.error('PDF Generation Error:', error);
        toast.error('Failed to generate PDF');
    }
};
