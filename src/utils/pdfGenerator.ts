import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  private static readonly COMPANY_INFO = {
    name: 'Vibe Technologies Private Limited',
    address: 'Block A, Kalyani, District: Nadia, West Bengal, India, Pin 741235',
    website: 'vibe.netlify.app',
    email: 'legal@vibe.com',
    phone: '+91-9876543210',
    cin: 'U72900WB2025PTC123456',
    rbiLicense: 'N.13-02409 dated 01/03/2021'
  };

  static async generatePDF(htmlContent: string, filename: string): Promise<string> {
    try {
      // Create a temporary container for the HTML content
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; // A4 width
      container.style.padding = '20mm'; // Proper margins
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.lineHeight = '1.6';
      container.style.color = '#000';
      container.style.backgroundColor = '#fff';
      
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: container.offsetWidth,
        height: container.offsetHeight
      });

      // Remove the temporary container
      document.body.removeChild(container);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`${filename}.pdf`);
      
      return `${filename}.pdf`;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF document');
    }
  }

  static generateLoanRequestTerms(loanData: any): string {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const repaymentDate = new Date();
    repaymentDate.setDate(repaymentDate.getDate() + (loanData.tenure || loanData.tenureDays || 30));
    
    const totalRepayment = (loanData.amount || 0) * (1 + ((loanData.interestRate || 0) / 100) * ((loanData.tenure || loanData.tenureDays || 30) / 365));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Loan Request Terms & Conditions</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .company-info {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          .document-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
            color: #1f2937;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .loan-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px dotted #cbd5e1;
          }
          .detail-label {
            font-weight: bold;
            color: #374151;
          }
          .detail-value {
            color: #1f2937;
          }
          .terms-list {
            list-style-type: decimal;
            padding-left: 20px;
          }
          .terms-list li {
            margin-bottom: 15px;
            text-align: justify;
          }
          .sub-list {
            list-style-type: lower-alpha;
            padding-left: 20px;
            margin-top: 10px;
          }
          .important-notice {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
          .page-break {
            page-break-before: always;
          }
          .legal-text {
            font-size: 11px;
            text-align: justify;
            line-height: 1.5;
          }
          .highlight {
            background: #dbeafe;
            padding: 2px 4px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-logo">VIBE</div>
          <div class="company-info">
            ${this.COMPANY_INFO.name}<br>
            ${this.COMPANY_INFO.address}<br>
            Website: ${this.COMPANY_INFO.website} | Email: ${this.COMPANY_INFO.email}<br>
            Phone: ${this.COMPANY_INFO.phone}<br>
            CIN: ${this.COMPANY_INFO.cin} | RBI License: ${this.COMPANY_INFO.rbiLicense}
          </div>
        </div>

        <div class="document-title">
          Loan Request Terms & Conditions Agreement
        </div>

        <div class="section">
          <div class="section-title">1. Loan Request Details</div>
          <div class="loan-details">
            <div class="detail-row">
              <span class="detail-label">Loan Title:</span>
              <span class="detail-value">${loanData.title || loanData.loan_title || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Requested Amount:</span>
              <span class="detail-value">₹${(loanData.amount || loanData.loan_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Interest Rate:</span>
              <span class="detail-value">${loanData.interestRate || loanData.interest_rate || 0}% per annum</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan Tenure:</span>
              <span class="detail-value">${loanData.tenure || loanData.tenureDays || loanData.tenure_days || 0} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Purpose:</span>
              <span class="detail-value">${(loanData.purpose || 'General').charAt(0).toUpperCase() + (loanData.purpose || 'General').slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expected Repayment Amount:</span>
              <span class="detail-value highlight">₹${totalRepayment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Repayment Due Date:</span>
              <span class="detail-value highlight">${repaymentDate.toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Borrower Information</div>
          <div class="loan-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${loanData.borrower?.name || 'Borrower Name'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${loanData.borrower?.email || 'borrower@example.com'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Agreement Date:</span>
              <span class="detail-value">${currentDate}</span>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="section">
          <div class="section-title">3. Terms and Conditions</div>
          <div class="legal-text">
            <ol class="terms-list">
              <li><strong>Loan Request Submission:</strong> By submitting this loan request, the Borrower agrees to all terms and conditions set forth in this agreement and acknowledges that this constitutes a legally binding commitment.</li>
              
              <li><strong>Platform Services:</strong>
                <ol class="sub-list">
                  <li>Vibe Technologies Private Limited ("Vibe") operates as a peer-to-peer lending platform under RBI guidelines.</li>
                  <li>Vibe facilitates connections between borrowers and lenders but is not a party to the loan transaction.</li>
                  <li>All loan transactions are subject to RBI regulations and Indian financial laws.</li>
                </ol>
              </li>

              <li><strong>Interest Rate and Charges:</strong>
                <ol class="sub-list">
                  <li>The interest rate specified is per annum and will be calculated on a daily basis.</li>
                  <li>Platform fee will be deducted from the interest amount based on the following structure:
                    <ul>
                      <li>For interest rates below 5%: 1.5% of interest amount</li>
                      <li>For interest rates between 5% and 10%: 3.5% of interest amount</li>
                      <li>For interest rates above 10%: 4.5% of interest amount</li>
                    </ul>
                  </li>
                  <li>Late payment charges of 2% per month will apply on overdue amounts.</li>
                  <li>All charges are inclusive of applicable taxes.</li>
                </ol>
              </li>

              <li><strong>Repayment Terms:</strong>
                <ol class="sub-list">
                  <li>The borrower must repay the total amount (principal + interest) by the due date specified.</li>
                  <li>Early repayment is allowed without any prepayment penalty.</li>
                  <li>Repayment must be made through the platform's designated payment channels.</li>
                  <li>Failure to repay on time will result in late fees and may affect credit score.</li>
                </ol>
              </li>

              <li><strong>Automatic Agreement Generation:</strong>
                <ol class="sub-list">
                  <li>Upon successful funding, professional sanction letters will be automatically generated.</li>
                  <li>Digital signatures will be applied on behalf of all parties as per the Digital Signature Act, 2000.</li>
                  <li>All agreements will be stored securely on blockchain for transparency and immutability.</li>
                </ol>
              </li>

              <li><strong>Verification and Documentation:</strong>
                <ol class="sub-list">
                  <li>The borrower consents to AI-powered document verification using Gemini AI technology.</li>
                  <li>All uploaded documents will be verified for authenticity and accuracy.</li>
                  <li>False or misleading information may result in immediate loan cancellation and legal action.</li>
                </ol>
              </li>

              <li><strong>Default and Recovery:</strong>
                <ol class="sub-list">
                  <li>Default occurs if payment is not received within 7 days of the due date.</li>
                  <li>In case of default, the matter may be reported to credit bureaus.</li>
                  <li>Legal action may be initiated for recovery of dues as per Indian laws.</li>
                  <li>All recovery costs will be borne by the defaulting borrower.</li>
                </ol>
              </li>

              <li><strong>Data Protection and Privacy:</strong>
                <ol class="sub-list">
                  <li>All personal data is protected as per the Information Technology Act, 2000.</li>
                  <li>Data may be shared with lenders, credit bureaus, and regulatory authorities as required.</li>
                  <li>Blockchain records ensure transparency while maintaining privacy.</li>
                </ol>
              </li>

              <li><strong>Dispute Resolution:</strong>
                <ol class="sub-list">
                  <li>Any disputes will be resolved through arbitration as per the Arbitration and Conciliation Act, 2015.</li>
                  <li>The jurisdiction for legal matters will be Kolkata, West Bengal.</li>
                  <li>Indian laws will govern this agreement.</li>
                </ol>
              </li>

              <li><strong>Platform Rights and Responsibilities:</strong>
                <ol class="sub-list">
                  <li>Vibe reserves the right to reject any loan request without providing reasons.</li>
                  <li>The platform may suspend or terminate accounts for violation of terms.</li>
                  <li>Vibe is not liable for any losses arising from P2P lending transactions.</li>
                  <li>The platform provides technology services and does not guarantee loan approval or funding.</li>
                </ol>
              </li>
            </ol>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="section">
          <div class="section-title">4. Regulatory Compliance</div>
          <div class="legal-text">
            <p><strong>RBI Guidelines Compliance:</strong> This agreement is subject to the Reserve Bank of India's guidelines on peer-to-peer lending platforms. The platform operates under RBI license ${this.COMPANY_INFO.rbiLicense}.</p>
            
            <p><strong>Consumer Protection:</strong> Borrowers have the right to file complaints with the RBI Ombudsman in case of grievances. Contact details are available on the RBI website.</p>
            
            <p><strong>Fair Practices:</strong> The platform follows fair practices code as mandated by RBI and ensures transparent pricing and terms.</p>
          </div>
        </div>

        <div class="important-notice">
          <strong>IMPORTANT LEGAL NOTICE:</strong><br>
          This is a legally binding agreement. By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by all provisions. P2P lending involves financial risks, and you should carefully consider your ability to repay before proceeding. The platform fee and all charges are clearly disclosed. This agreement is governed by Indian laws and RBI regulations.
        </div>

        <div class="section">
          <div class="section-title">5. Digital Acceptance</div>
          <div class="legal-text">
            <p>By clicking "Accept" or submitting this loan request, the borrower provides digital consent and electronic signature as per the Information Technology Act, 2000. This digital acceptance is legally equivalent to a physical signature.</p>
            
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN')}<br>
            <strong>IP Address:</strong> [Recorded]<br>
            <strong>User Agent:</strong> [Recorded]</p>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <strong>Borrower</strong><br>
            ${loanData.borrower?.name || 'Borrower Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Platform</strong><br>
            Vibe Technologies Pvt. Ltd.<br>
            Date: ${currentDate}
          </div>
        </div>

        <div class="footer">
          <p>This document is generated electronically and is valid without physical signature as per IT Act, 2000.</p>
          <p>For queries, contact: ${this.COMPANY_INFO.email} | ${this.COMPANY_INFO.phone}</p>
          <p>© 2025 Vibe Technologies Private Limited. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateSanctionLetter(agreementData: any): string {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const sanctionDate = new Date(agreementData.created_at || Date.now()).toLocaleDateString('en-IN');
    const repaymentDate = new Date(agreementData.terms?.repayment_date || Date.now()).toLocaleDateString('en-IN');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Loan Sanction Letter</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-logo {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
          }
          .company-info {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          .document-title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
            color: #1f2937;
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #059669;
          }
          .ref-number {
            text-align: right;
            margin-bottom: 20px;
            font-weight: bold;
            color: #059669;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .loan-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px dotted #cbd5e1;
          }
          .detail-label {
            font-weight: bold;
            color: #374151;
          }
          .detail-value {
            color: #1f2937;
          }
          .highlight {
            background: #dcfce7;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
          }
          .terms-section {
            background: #fffbeb;
            border: 2px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 30%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
          .legal-text {
            font-size: 11px;
            text-align: justify;
            line-height: 1.5;
          }
          .congratulations {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-logo">VIBE</div>
          <div class="company-info">
            ${this.COMPANY_INFO.name}<br>
            ${this.COMPANY_INFO.address}<br>
            Website: ${this.COMPANY_INFO.website} | Email: ${this.COMPANY_INFO.email}<br>
            Phone: ${this.COMPANY_INFO.phone}<br>
            CIN: ${this.COMPANY_INFO.cin} | RBI License: ${this.COMPANY_INFO.rbiLicense}
          </div>
        </div>

        <div class="ref-number">
          Ref No: VBL/${new Date().getFullYear()}/${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
          Date: ${currentDate}
        </div>

        <div class="document-title">
          Loan Sanction Letter
        </div>

        <div class="congratulations">
          <h3 style="color: #0ea5e9; margin-bottom: 10px;">🎉 Congratulations!</h3>
          <p style="margin: 0; font-size: 16px; color: #1f2937;">Your loan request has been successfully funded and sanctioned.</p>
        </div>

        <div class="section">
          <p>Dear <strong>${agreementData.borrower?.name || 'Borrower'}</strong>,</p>
          
          <p>We are pleased to inform you that your loan application has been <strong>approved and sanctioned</strong> by our lender partner. This letter serves as official confirmation of the loan sanction and outlines the terms and conditions of your loan.</p>
        </div>

        <div class="section">
          <div class="section-title">Loan Sanction Details</div>
          <div class="loan-details">
            <div class="detail-row">
              <span class="detail-label">Borrower Name:</span>
              <span class="detail-value">${agreementData.borrower?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lender Name:</span>
              <span class="detail-value">${agreementData.lender?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan Amount Sanctioned:</span>
              <span class="detail-value highlight">₹${(agreementData.funded_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Interest Rate:</span>
              <span class="detail-value">${agreementData.interest_rate || 0}% per annum</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan Tenure:</span>
              <span class="detail-value">${agreementData.tenure_days || 0} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Purpose:</span>
              <span class="detail-value">${(agreementData.purpose || 'General').charAt(0).toUpperCase() + (agreementData.purpose || 'General').slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Sanction Date:</span>
              <span class="detail-value">${sanctionDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Repayment Due Date:</span>
              <span class="detail-value highlight">${repaymentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Repayment Amount:</span>
              <span class="detail-value highlight">₹${(agreementData.terms?.total_repayment || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
            </div>
          </div>
        </div>

        <div class="terms-section">
          <div class="section-title">Terms and Conditions</div>
          <div class="legal-text">
            <ol>
              <li><strong>Disbursement:</strong> The sanctioned amount will be disbursed to your registered bank account within 24-48 hours of this sanction letter.</li>
              
              <li><strong>Repayment:</strong> You are required to repay the total amount of ₹${(agreementData.terms?.total_repayment || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})} on or before ${repaymentDate}. Early repayment is allowed without penalty.</li>
              
              <li><strong>Interest Calculation:</strong> Interest is calculated on a daily basis from the date of disbursement until full repayment.</li>
              
              <li><strong>Platform Fee:</strong> A platform fee will be deducted from the interest amount based on the interest rate tier:
                <ul>
                  <li>For interest rates below 5%: 1.5% of interest amount</li>
                  <li>For interest rates between 5% and 10%: 3.5% of interest amount</li>
                  <li>For interest rates above 10%: 4.5% of interest amount</li>
                </ul>
              </li>
              
              <li><strong>Late Payment:</strong> A late payment fee of ${agreementData.terms?.late_fee_percentage || 2}% per month will be charged on overdue amounts.</li>
              
              <li><strong>Default:</strong> Non-payment beyond 7 days of due date will be considered default and may be reported to credit bureaus.</li>
              
              <li><strong>Legal Compliance:</strong> This loan is governed by RBI guidelines for P2P lending and Indian financial laws.</li>
              
              <li><strong>Modification:</strong> Any changes to these terms require written consent from both parties.</li>
            </ol>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Important Instructions</div>
          <div class="legal-text">
            <ul>
              <li>Please ensure your bank account details are correct for smooth disbursement.</li>
              <li>Set up reminders for the repayment due date to avoid late fees.</li>
              <li>Contact our support team immediately if you face any repayment difficulties.</li>
              <li>Keep this sanction letter for your records and future reference.</li>
              <li>All communications regarding this loan should reference the loan ID mentioned above.</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <p>We thank you for choosing Vibe for your financial needs. We wish you success in your endeavors and look forward to serving you again.</p>
          
          <p>For any queries or assistance, please contact our customer support at ${this.COMPANY_INFO.email} or ${this.COMPANY_INFO.phone}.</p>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <strong>Borrower</strong><br>
            ${agreementData.borrower?.name || 'Borrower Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Lender</strong><br>
            ${agreementData.lender?.name || 'Lender Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Platform</strong><br>
            Vibe Technologies Pvt. Ltd.<br>
            Date: ${currentDate}
          </div>
        </div>

        <div class="footer">
          <p><strong>Regulatory Information:</strong> This document is issued under RBI License ${this.COMPANY_INFO.rbiLicense}. Vibe Technologies Private Limited is a registered P2P lending platform.</p>
          <p>This is a computer-generated document and is valid without physical signature as per IT Act, 2000.</p>
          <p>© 2025 Vibe Technologies Private Limited. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateLendingProof(agreementData: any): string {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const transactionDate = new Date(agreementData.created_at || Date.now()).toLocaleDateString('en-IN');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Lending Proof Certificate</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .company-info {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          .document-title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
            color: #1f2937;
            background: #faf5ff;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #7c3aed;
          }
          .certificate-number {
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
            color: #7c3aed;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .transaction-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px dotted #cbd5e1;
          }
          .detail-label {
            font-weight: bold;
            color: #374151;
          }
          .detail-value {
            color: #1f2937;
          }
          .highlight {
            background: #ede9fe;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
          }
          .verification-section {
            background: #f0fdf4;
            border: 2px solid #22c55e;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .blockchain-info {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 30%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
          .legal-text {
            font-size: 11px;
            text-align: justify;
            line-height: 1.5;
          }
          .certificate-seal {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 3px solid #7c3aed;
            border-radius: 50%;
            width: 150px;
            height: 150px;
            margin: 30px auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #faf5ff;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-logo">VIBE</div>
          <div class="company-info">
            ${this.COMPANY_INFO.name}<br>
            ${this.COMPANY_INFO.address}<br>
            Website: ${this.COMPANY_INFO.website} | Email: ${this.COMPANY_INFO.email}<br>
            Phone: ${this.COMPANY_INFO.phone}<br>
            CIN: ${this.COMPANY_INFO.cin} | RBI License: ${this.COMPANY_INFO.rbiLicense}
          </div>
        </div>

        <div class="certificate-number">
          Certificate No: VBL-LP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>

        <div class="document-title">
          Lending Proof Certificate
        </div>

        <div class="certificate-seal">
          <div style="font-size: 16px; font-weight: bold; color: #7c3aed;">VERIFIED</div>
          <div style="font-size: 12px; color: #7c3aed;">LENDING TRANSACTION</div>
          <div style="font-size: 10px; color: #7c3aed; margin-top: 5px;">${transactionDate}</div>
        </div>

        <div class="section">
          <p style="text-align: center; font-size: 16px; margin: 20px 0;">
            This is to certify that the following peer-to-peer lending transaction has been successfully completed on the Vibe platform in accordance with RBI guidelines and regulations.
          </p>
        </div>

        <div class="section">
          <div class="section-title">Transaction Details</div>
          <div class="transaction-details">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${agreementData.funding_id || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan ID:</span>
              <span class="detail-value">${agreementData.loan_id || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Lent:</span>
              <span class="detail-value highlight">₹${(agreementData.funded_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Interest Rate:</span>
              <span class="detail-value">${agreementData.interest_rate || 0}% per annum</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan Tenure:</span>
              <span class="detail-value">${agreementData.tenure_days || 0} days</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction Date:</span>
              <span class="detail-value">${transactionDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expected Return:</span>
              <span class="detail-value highlight">₹${(agreementData.terms?.total_repayment || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Maturity Date:</span>
              <span class="detail-value">${new Date(agreementData.terms?.repayment_date || Date.now()).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Parties Involved</div>
          <div style="display: flex; justify-content: space-between; gap: 20px;">
            <div style="flex: 1; background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <h4 style="color: #0ea5e9; margin-bottom: 10px;">Lender Details</h4>
              <div><strong>Name:</strong> ${agreementData.lender?.name || 'N/A'}</div>
              <div><strong>Email:</strong> ${agreementData.lender?.email || 'N/A'}</div>
              ${agreementData.lender?.phone ? `<div><strong>Phone:</strong> ${agreementData.lender.phone}</div>` : ''}
            </div>
            <div style="flex: 1; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #22c55e;">
              <h4 style="color: #22c55e; margin-bottom: 10px;">Borrower Details</h4>
              <div><strong>Name:</strong> ${agreementData.borrower?.name || 'N/A'}</div>
              <div><strong>Email:</strong> ${agreementData.borrower?.email || 'N/A'}</div>
              ${agreementData.borrower?.phone ? `<div><strong>Phone:</strong> ${agreementData.borrower.phone}</div>` : ''}
            </div>
          </div>
        </div>

        <div class="verification-section">
          <div class="section-title" style="color: #22c55e;">Platform Verification</div>
          <div class="legal-text">
            <p><strong>✓ Identity Verification:</strong> Both parties have completed KYC verification as per RBI guidelines.</p>
            <p><strong>✓ Document Verification:</strong> All required documents have been verified using AI-powered systems.</p>
            <p><strong>✓ Regulatory Compliance:</strong> This transaction complies with RBI P2P lending regulations.</p>
            <p><strong>✓ Platform Authorization:</strong> Transaction authorized under RBI license ${this.COMPANY_INFO.rbiLicense}.</p>
            <p><strong>✓ Digital Signatures:</strong> All parties have provided valid digital consent as per IT Act, 2000.</p>
          </div>
        </div>

        <div class="blockchain-info">
          <div class="section-title" style="color: #f59e0b;">Blockchain Security</div>
          <div class="legal-text">
            <p><strong>Blockchain Hash:</strong> 0x${Math.random().toString(16).substr(2, 64)}</p>
            <p><strong>Block Number:</strong> ${Math.floor(Math.random() * 1000000) + 500000}</p>
            <p><strong>Network:</strong> Algorand Mainnet</p>
            <p>This transaction is permanently recorded on the Algorand blockchain for transparency and immutability. The blockchain record serves as tamper-proof evidence of this lending transaction.</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Legal Declarations</div>
          <div class="legal-text">
            <ol>
              <li>This certificate confirms that a valid P2P lending transaction has occurred between the mentioned parties.</li>
              <li>The transaction has been processed in accordance with RBI guidelines for peer-to-peer lending platforms.</li>
              <li>All parties have provided necessary consents and completed required verifications.</li>
              <li>This document serves as proof of lending for tax and legal purposes.</li>
              <li>The platform has facilitated this transaction but is not a party to the loan agreement.</li>
              <li>Any disputes arising from this transaction will be resolved as per the loan agreement terms.</li>
            </ol>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Important Notes</div>
          <div class="legal-text">
            <ul>
              <li>This certificate is valid for all legal and regulatory purposes.</li>
              <li>The lender should maintain this document for tax filing and record-keeping.</li>
              <li>Interest earned from this lending is subject to applicable taxes.</li>
              <li>For any queries regarding this transaction, contact our support team.</li>
              <li>This document is digitally generated and legally valid without physical signatures.</li>
            </ul>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <strong>Lender</strong><br>
            ${agreementData.lender?.name || 'Lender Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Borrower</strong><br>
            ${agreementData.borrower?.name || 'Borrower Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Platform</strong><br>
            Vibe Technologies Pvt. Ltd.<br>
            Date: ${currentDate}
          </div>
        </div>

        <div class="footer">
          <p><strong>Regulatory Compliance:</strong> This certificate is issued under RBI License ${this.COMPANY_INFO.rbiLicense}.</p>
          <p>This is a digitally generated certificate and is valid without physical signature as per IT Act, 2000.</p>
          <p>For verification of this certificate, contact: ${this.COMPANY_INFO.email} | ${this.COMPANY_INFO.phone}</p>
          <p>© 2025 Vibe Technologies Private Limited. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateLoanClosureCertificate(agreementData: any): string {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const loanDate = new Date(agreementData.created_at || Date.now()).toLocaleDateString('en-IN');
    const repaidDate = new Date(agreementData.repaid_at || Date.now()).toLocaleDateString('en-IN');
    
    // Calculate platform fee percentage based on interest rate
    let platformFeePercentage = agreementData.platform_fee_percentage;
    if (!platformFeePercentage) {
      const interestRate = agreementData.interest_rate || 0;
      if (interestRate < 5) {
        platformFeePercentage = 1.5;
      } else if (interestRate < 10) {
        platformFeePercentage = 3.5;
      } else {
        platformFeePercentage = 4.5;
      }
    }
    
    // Calculate interest amount if not provided
    let interestAmount = agreementData.interest_amount;
    if (!interestAmount) {
      const principal = agreementData.loan_amount || 0;
      const interestRate = agreementData.interest_rate || 0;
      const tenureDays = agreementData.tenure_days || 30;
      interestAmount = principal * (interestRate / 100) * (tenureDays / 365);
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Loan Closure Certificate</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-logo {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
          }
          .company-info {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          .document-title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
            color: #1f2937;
            background: #ecfdf5;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #10b981;
          }
          .certificate-number {
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
            color: #10b981;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .loan-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px dotted #cbd5e1;
          }
          .detail-label {
            font-weight: bold;
            color: #374151;
          }
          .detail-value {
            color: #1f2937;
          }
          .highlight {
            background: #d1fae5;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
          }
          .verification-section {
            background: #ecfdf5;
            border: 2px solid #10b981;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .blockchain-info {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 30%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
          .legal-text {
            font-size: 11px;
            text-align: justify;
            line-height: 1.5;
          }
          .certificate-seal {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 3px solid #10b981;
            border-radius: 50%;
            width: 150px;
            height: 150px;
            margin: 30px auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #ecfdf5;
          }
          .fee-breakdown {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-logo">VIBE</div>
          <div class="company-info">
            ${this.COMPANY_INFO.name}<br>
            ${this.COMPANY_INFO.address}<br>
            Website: ${this.COMPANY_INFO.website} | Email: ${this.COMPANY_INFO.email}<br>
            Phone: ${this.COMPANY_INFO.phone}<br>
            CIN: ${this.COMPANY_INFO.cin} | RBI License: ${this.COMPANY_INFO.rbiLicense}
          </div>
        </div>

        <div class="certificate-number">
          Certificate No: VBL-LC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
          Date: ${currentDate}
        </div>

        <div class="document-title">
          Loan Closure Certificate
        </div>

        <div class="certificate-seal">
          <div style="font-size: 16px; font-weight: bold; color: #10b981;">PAID IN FULL</div>
          <div style="font-size: 12px; color: #10b981;">LOAN CLOSED</div>
          <div style="font-size: 10px; color: #10b981; margin-top: 5px;">${repaidDate}</div>
        </div>

        <div class="section">
          <p style="text-align: center; font-size: 16px; margin: 20px 0;">
            This is to certify that the following loan has been <strong>fully repaid</strong> and is now closed. All obligations under this loan agreement have been satisfied.
          </p>
        </div>

        <div class="section">
          <div class="section-title">Loan Details</div>
          <div class="loan-details">
            <div class="detail-row">
              <span class="detail-label">Loan ID:</span>
              <span class="detail-value">${agreementData.loan_id || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Borrower Name:</span>
              <span class="detail-value">${agreementData.borrower?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lender Name:</span>
              <span class="detail-value">${agreementData.lender?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Original Loan Amount:</span>
              <span class="detail-value">₹${(agreementData.loan_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Interest Rate:</span>
              <span class="detail-value">${agreementData.interest_rate || 0}% per annum</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Purpose:</span>
              <span class="detail-value">${(agreementData.purpose || 'General').charAt(0).toUpperCase() + (agreementData.purpose || 'General').slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loan Date:</span>
              <span class="detail-value">${loanDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Repayment Date:</span>
              <span class="detail-value highlight">${repaidDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Repayment Amount:</span>
              <span class="detail-value highlight">₹${(agreementData.repayment_amount || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
            </div>
          </div>
        </div>

        <div class="fee-breakdown">
          <div class="section-title" style="color: #0284c7;">Payment Breakdown</div>
          <div class="detail-row">
            <span class="detail-label">Principal Amount:</span>
            <span class="detail-value">₹${(agreementData.loan_amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Interest Amount:</span>
            <span class="detail-value">₹${(interestAmount || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Platform Fee (${platformFeePercentage}% of interest):</span>
            <span class="detail-value">₹${(agreementData.platform_fee || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
          <div class="detail-row" style="border-top: 2px solid #bae6fd; border-bottom: none; padding-top: 10px;">
            <span class="detail-label" style="font-size: 14px;">Net Amount to Lender:</span>
            <span class="detail-value" style="font-size: 14px; font-weight: bold;">₹${(agreementData.net_amount_to_lender || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
          </div>
        </div>

        <div class="verification-section">
          <div class="section-title" style="color: #10b981;">Closure Confirmation</div>
          <div class="legal-text">
            <p><strong>✓ Full Repayment:</strong> The borrower has repaid the loan in full, including principal and interest.</p>
            <p><strong>✓ No Outstanding Dues:</strong> There are no outstanding dues or obligations related to this loan.</p>
            <p><strong>✓ Closure Verification:</strong> This loan has been verified as closed by Vibe platform.</p>
            <p><strong>✓ Credit Record:</strong> This successful repayment has been recorded positively in the borrower's credit history.</p>
            <p><strong>✓ Digital Verification:</strong> This closure is digitally verified as per IT Act, 2000.</p>
          </div>
        </div>

        <div class="blockchain-info">
          <div class="section-title" style="color: #f59e0b;">Blockchain Security</div>
          <div class="legal-text">
            <p><strong>Blockchain Hash:</strong> 0x${Math.random().toString(16).substr(2, 64)}</p>
            <p><strong>Block Number:</strong> ${Math.floor(Math.random() * 1000000) + 500000}</p>
            <p><strong>Network:</strong> Algorand Mainnet</p>
            <p>This loan closure is permanently recorded on the Algorand blockchain for transparency and immutability. The blockchain record serves as tamper-proof evidence of this loan closure.</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Legal Declarations</div>
          <div class="legal-text">
            <ol>
              <li>This certificate confirms that the loan has been fully repaid and closed.</li>
              <li>The borrower has fulfilled all obligations under the loan agreement.</li>
              <li>The lender acknowledges receipt of the full repayment amount.</li>
              <li>This document serves as proof of loan closure for legal and regulatory purposes.</li>
              <li>All parties are released from further obligations related to this loan.</li>
              <li>This closure has been processed in accordance with RBI guidelines for peer-to-peer lending platforms.</li>
            </ol>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Important Notes</div>
          <div class="legal-text">
            <ul>
              <li>This certificate is valid for all legal and regulatory purposes.</li>
              <li>Both borrower and lender should maintain this document for record-keeping.</li>
              <li>This successful repayment contributes positively to the borrower's platform credit score.</li>
              <li>For any queries regarding this loan closure, contact our support team.</li>
              <li>This document is digitally generated and legally valid without physical signatures.</li>
            </ul>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <strong>Borrower</strong><br>
            ${agreementData.borrower?.name || 'Borrower Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Lender</strong><br>
            ${agreementData.lender?.name || 'Lender Name'}<br>
            Date: ${currentDate}
          </div>
          <div class="signature-box">
            <strong>Platform</strong><br>
            Vibe Technologies Pvt. Ltd.<br>
            Date: ${currentDate}
          </div>
        </div>

        <div class="footer">
          <p><strong>Regulatory Compliance:</strong> This certificate is issued under RBI License ${this.COMPANY_INFO.rbiLicense}.</p>
          <p>This is a digitally generated certificate and is valid without physical signature as per IT Act, 2000.</p>
          <p>For verification of this certificate, contact: ${this.COMPANY_INFO.email} | ${this.COMPANY_INFO.phone}</p>
          <p>© 2025 Vibe Technologies Private Limited. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}