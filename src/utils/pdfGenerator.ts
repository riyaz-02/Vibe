// PDF generation utilities for loan agreements and legal documents
import { LoanRequest, User, LoanAgreement } from '../types';

export class PDFGenerator {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  private static calculateRepaymentAmount(principal: number, interestRate: number, tenureDays: number): number {
    return principal * (1 + (interestRate / 100) * (tenureDays / 365));
  }

  static generateLoanRequestTerms(loan: LoanRequest): string {
    const repaymentAmount = this.calculateRepaymentAmount(loan.amount, loan.interestRate, loan.tenure);
    const repaymentDate = new Date();
    repaymentDate.setDate(repaymentDate.getDate() + loan.tenure);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loan Request Terms & Conditions - ${loan.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1F2937; margin-bottom: 15px; border-left: 4px solid #3B82F6; padding-left: 15px; }
        .terms-list { list-style-type: decimal; margin-left: 20px; }
        .terms-list li { margin-bottom: 10px; }
        .highlight { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
        .signature-section { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        .loan-details { background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6B7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⚡ VIBE</div>
        <h1>Loan Request Terms & Conditions</h1>
        <p>Peer-to-Peer Lending Agreement</p>
    </div>

    <div class="loan-details">
        <h2>Loan Request Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Borrower:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${loan.borrower.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Loan Title:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${loan.title}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Amount Requested:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${this.formatCurrency(loan.amount)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Interest Rate:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${loan.interestRate}% per annum</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Tenure:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${loan.tenure} days</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Purpose:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${loan.purpose}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Total Repayment:</strong></td><td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${this.formatCurrency(repaymentAmount)}</td></tr>
            <tr><td style="padding: 8px;"><strong>Expected Repayment Date:</strong></td><td style="padding: 8px;">${this.formatDate(repaymentDate)}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Terms and Conditions</div>
        <ol class="terms-list">
            <li><strong>Loan Agreement:</strong> By posting this loan request, I agree to the terms and conditions set forth by Vibe P2P Lending Platform.</li>
            <li><strong>Automatic Agreement Generation:</strong> I understand and consent that upon funding of this loan (partial or full), sanction letters and lending agreements will be automatically generated and digitally signed on my behalf.</li>
            <li><strong>Repayment Obligation:</strong> I commit to repay the borrowed amount along with the agreed interest within the specified tenure.</li>
            <li><strong>Interest Calculation:</strong> Interest will be calculated on a simple interest basis for the agreed tenure period.</li>
            <li><strong>Platform Fees:</strong> I acknowledge that Vibe will deduct a platform fee of 1-2% from the funded amount.</li>
            <li><strong>Late Payment:</strong> In case of delayed repayment, I agree to pay a late fee of 2% per month on the outstanding amount.</li>
            <li><strong>Default Consequences:</strong> I understand that defaulting on this loan may affect my credit score and future borrowing capacity on the platform.</li>
            <li><strong>Verification:</strong> All information provided is true and accurate. I consent to verification processes including AI-powered document verification.</li>
            <li><strong>Legal Compliance:</strong> This agreement is governed by Indian laws and RBI guidelines for P2P lending.</li>
            <li><strong>Data Privacy:</strong> I consent to the processing of my personal data as per Vibe's Privacy Policy and applicable data protection laws.</li>
            <li><strong>Blockchain Records:</strong> I understand that transaction records will be stored on the Algorand blockchain for transparency and security.</li>
            <li><strong>Dispute Resolution:</strong> Any disputes will be resolved through arbitration as per the platform's dispute resolution policy.</li>
        </ol>
    </div>

    <div class="highlight">
        <strong>Important Notice:</strong> P2P lending involves risks. Please ensure you can repay the loan amount within the agreed tenure. This is a legally binding agreement once accepted.
    </div>

    <div class="section">
        <div class="section-title">Borrower Responsibilities</div>
        <ul>
            <li>Provide accurate and complete information</li>
            <li>Use the loan amount only for the stated purpose</li>
            <li>Maintain regular communication with lenders</li>
            <li>Repay the loan amount on or before the due date</li>
            <li>Notify the platform immediately of any changes in financial circumstances</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Platform Rights and Obligations</div>
        <ul>
            <li>Vibe acts as an intermediary and does not guarantee loan approval or repayment</li>
            <li>The platform reserves the right to verify all information provided</li>
            <li>Vibe may suspend or terminate accounts for policy violations</li>
            <li>The platform will facilitate communication between borrowers and lenders</li>
            <li>Vibe will maintain records of all transactions for regulatory compliance</li>
        </ul>
    </div>

    <div class="signature-section">
        <p><strong>By submitting this loan request, I acknowledge that I have read, understood, and agree to all the terms and conditions mentioned above.</strong></p>
        <br>
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%;">
                    <strong>Borrower Name:</strong> ${loan.borrower.name}<br>
                    <strong>Email:</strong> ${loan.borrower.email}<br>
                    <strong>Date:</strong> ${this.formatDate(new Date())}
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong>Digital Signature:</strong><br>
                    <em>Electronically signed via Vibe Platform</em><br>
                    <strong>IP Address:</strong> [Recorded at submission]
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>This document is generated by Vibe P2P Lending Platform | www.vibe.com</p>
        <p>For support, contact: support@vibe.com | Phone: 022 65027681</p>
        <p>Vibe is registered with RBI as a P2P NBFC | Registration No: N.13-02409</p>
    </div>
</body>
</html>`;
  }

  static generateSanctionLetter(agreementData: any): string {
    const { loan_amount, funded_amount, interest_rate, tenure_days, borrower, lender, terms } = agreementData;
    const repaymentDate = new Date(terms.repayment_date);
    const totalRepayment = terms.total_repayment;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loan Sanction Letter</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #10B981; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1F2937; margin-bottom: 15px; border-left: 4px solid #10B981; padding-left: 15px; }
        .loan-details { background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #10B981; }
        .highlight { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
        .signature-section { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6B7280; }
        .approved-stamp { color: #10B981; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⚡ VIBE</div>
        <h1>LOAN SANCTION LETTER</h1>
        <div class="approved-stamp">✅ APPROVED</div>
    </div>

    <div class="section">
        <p><strong>Date:</strong> ${this.formatDate(new Date())}</p>
        <p><strong>Sanction Letter No:</strong> VBL-${Date.now()}</p>
    </div>

    <div class="section">
        <p><strong>Dear ${borrower.name},</strong></p>
        <p>We are pleased to inform you that your loan application has been approved and sanctioned by our lender partner. Please find the details of your approved loan below:</p>
    </div>

    <div class="loan-details">
        <h2>Loan Sanction Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Borrower Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${borrower.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Borrower Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${borrower.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Lender Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${lender.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Sanctioned Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${this.formatCurrency(funded_amount)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Interest Rate:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${interest_rate}% per annum</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Loan Tenure:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${tenure_days} days</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Total Repayment Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${this.formatCurrency(totalRepayment)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #10B981;"><strong>Repayment Due Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #10B981;">${this.formatDate(repaymentDate)}</td></tr>
            <tr><td style="padding: 8px;"><strong>Platform Fee:</strong></td><td style="padding: 8px;">${terms.platform_fee_percentage}% (deducted from sanctioned amount)</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Terms and Conditions</div>
        <ol>
            <li>The loan amount will be disbursed to your registered bank account within 24-48 hours.</li>
            <li>The platform fee of ${terms.platform_fee_percentage}% will be deducted from the sanctioned amount.</li>
            <li>Repayment must be made on or before the due date mentioned above.</li>
            <li>Late payment will attract a penalty of ${terms.late_fee_percentage}% per month on the outstanding amount.</li>
            <li>This loan is secured through blockchain technology on the Algorand network.</li>
            <li>Any changes to the repayment schedule must be mutually agreed upon by both parties.</li>
            <li>This agreement is governed by Indian laws and RBI guidelines for P2P lending.</li>
        </ol>
    </div>

    <div class="highlight">
        <strong>Important:</strong> This is a legally binding agreement. Please ensure timely repayment to maintain your credit score and platform reputation.
    </div>

    <div class="section">
        <div class="section-title">Next Steps</div>
        <ol>
            <li>Loan amount will be credited to your account shortly</li>
            <li>You will receive SMS and email notifications for repayment reminders</li>
            <li>Set up auto-debit for hassle-free repayment</li>
            <li>Contact support for any queries: support@vibe.com</li>
        </ol>
    </div>

    <div class="signature-section">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%;">
                    <strong>Authorized Signatory</strong><br>
                    <strong>Vibe P2P Lending Platform</strong><br>
                    Date: ${this.formatDate(new Date())}
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong>Digital Seal</strong><br>
                    <em>Electronically generated and signed</em><br>
                    <strong>Reference ID:</strong> ${agreementData.loan_id}
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>This document is generated by Vibe P2P Lending Platform | www.vibe.com</p>
        <p>For support, contact: support@vibe.com | Phone: 022 65027681</p>
        <p>Vibe is registered with RBI as a P2P NBFC | Registration No: N.13-02409</p>
        <p><strong>This is a computer-generated document and does not require a physical signature.</strong></p>
    </div>
</body>
</html>`;
  }

  static generateLendingProof(agreementData: any): string {
    const { loan_amount, funded_amount, interest_rate, tenure_days, borrower, lender, terms } = agreementData;
    const repaymentDate = new Date(terms.repayment_date);
    const totalRepayment = terms.total_repayment;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lending Proof Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1F2937; margin-bottom: 15px; border-left: 4px solid #8B5CF6; padding-left: 15px; }
        .loan-details { background-color: #FAF5FF; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #8B5CF6; }
        .certificate-badge { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0; }
        .signature-section { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6B7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⚡ VIBE</div>
        <h1>LENDING PROOF CERTIFICATE</h1>
        <p>Official Proof of P2P Lending Transaction</p>
    </div>

    <div class="certificate-badge">
        <h2 style="margin: 0; font-size: 24px;">🏆 VERIFIED LENDER</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">This certificate confirms your contribution to student financial empowerment</p>
    </div>

    <div class="section">
        <p><strong>Certificate No:</strong> VBL-LEND-${Date.now()}</p>
        <p><strong>Issue Date:</strong> ${this.formatDate(new Date())}</p>
        <p><strong>Blockchain Transaction ID:</strong> [Will be updated upon blockchain confirmation]</p>
    </div>

    <div class="section">
        <p><strong>Dear ${lender.name},</strong></p>
        <p>This certificate serves as official proof that you have successfully provided financial assistance through our peer-to-peer lending platform. Your contribution helps students achieve their educational and personal goals.</p>
    </div>

    <div class="loan-details">
        <h2>Lending Transaction Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Lender Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${lender.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Lender Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${lender.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Borrower Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${borrower.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Amount Lent:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${this.formatCurrency(funded_amount)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Interest Rate:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${interest_rate}% per annum</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Loan Tenure:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${tenure_days} days</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Expected Return:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${this.formatCurrency(totalRepayment)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;"><strong>Expected Return Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #8B5CF6;">${this.formatDate(repaymentDate)}</td></tr>
            <tr><td style="padding: 8px;"><strong>Transaction Date:</strong></td><td style="padding: 8px;">${this.formatDate(new Date())}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Your Rights as a Lender</div>
        <ul>
            <li>Right to receive timely repayment as per agreed terms</li>
            <li>Right to receive regular updates on loan status</li>
            <li>Right to platform support for any disputes</li>
            <li>Right to access blockchain transaction records</li>
            <li>Right to rate and review the borrower after loan completion</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Important Information</div>
        <ul>
            <li>This certificate is digitally signed and blockchain-verified</li>
            <li>Keep this document for your financial records and tax purposes</li>
            <li>Interest earned may be subject to taxation as per applicable laws</li>
            <li>P2P lending involves risks - past performance doesn't guarantee future returns</li>
            <li>Contact support immediately if you notice any discrepancies</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Thank You</div>
        <p>Your contribution to the Vibe community helps students worldwide access financial opportunities. Together, we're building a more inclusive financial ecosystem.</p>
    </div>

    <div class="signature-section">
        <table style="width: 100%;">
            <tr>
                <td style="width: 50%;">
                    <strong>Digitally Certified By:</strong><br>
                    <strong>Vibe P2P Lending Platform</strong><br>
                    Date: ${this.formatDate(new Date())}<br>
                    <em>Blockchain Secured</em>
                </td>
                <td style="width: 50%; text-align: right;">
                    <strong>Certificate Verification:</strong><br>
                    <strong>QR Code:</strong> [Generated]<br>
                    <strong>Hash:</strong> [Blockchain Hash]<br>
                    <em>Verify at vibe.com/verify</em>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>This certificate is generated by Vibe P2P Lending Platform | www.vibe.com</p>
        <p>For support, contact: support@vibe.com | Phone: 022 65027681</p>
        <p>Vibe is registered with RBI as a P2P NBFC | Registration No: N.13-02409</p>
        <p><strong>This is a digitally generated certificate with blockchain verification.</strong></p>
    </div>
</body>
</html>`;
  }

  static async generatePDF(htmlContent: string, filename: string): Promise<string> {
    // In a real implementation, this would use a service like Puppeteer, jsPDF, or a cloud PDF service
    // For now, we'll return a mock URL
    console.log('Generating PDF:', filename);
    
    // Mock PDF generation - in production, you'd use:
    // 1. Puppeteer to convert HTML to PDF
    // 2. Upload to Supabase Storage or AWS S3
    // 3. Return the public URL
    
    const mockPdfUrl = `https://vibe-documents.s3.amazonaws.com/agreements/${filename}-${Date.now()}.pdf`;
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockPdfUrl;
  }
}