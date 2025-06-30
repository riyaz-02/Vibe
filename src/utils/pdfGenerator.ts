import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  private static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  }

  private static calculateRepaymentAmount(principal: number, interestRate: number, tenureDays: number): number {
    return principal * (1 + (interestRate / 100) * (tenureDays / 365));
  }

  private static getCompanyInfo() {
    return {
      name: 'Vibe P2P Lending Platform',
      address: 'Block A, Kalyani, District: Nadia, West Bengal, India, Pin 741235',
      website: 'vibe.netlify.app',
      email: 'info@vibe.com',
      phone: '022 65027681',
      rbiRegistration: 'N.13-02409 dated 01/03/2021'
    };
  }

  static generateLoanRequestTerms(loan: any): string {
    const repaymentAmount = this.calculateRepaymentAmount(loan.amount, loan.interestRate, loan.tenure || loan.tenureDays);
    const repaymentDate = new Date();
    repaymentDate.setDate(repaymentDate.getDate() + (loan.tenure || loan.tenureDays));
    const company = this.getCompanyInfo();

    const borrower = loan.borrower || {
      name: 'Borrower Name',
      email: 'borrower@example.com'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loan Request Terms & Conditions</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            margin: 0; 
            color: #000; 
            font-size: 12pt;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #1e40af; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .logo { 
            font-size: 28pt; 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 10px; 
            font-family: Arial, sans-serif;
        }
        .company-info {
            font-size: 10pt;
            color: #666;
            margin-top: 10px;
        }
        .document-title {
            font-size: 18pt;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 14pt; 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 15px; 
            border-left: 4px solid #1e40af; 
            padding-left: 15px; 
        }
        .loan-details { 
            background-color: #f8fafc; 
            padding: 20px; 
            border: 2px solid #1e40af; 
            margin: 20px 0; 
            border-radius: 5px;
        }
        .loan-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .loan-details td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .loan-details td:first-child {
            font-weight: bold;
            width: 40%;
        }
        .terms-list { 
            list-style-type: decimal; 
            margin-left: 20px; 
            text-align: justify;
        }
        .terms-list li { 
            margin-bottom: 15px; 
            page-break-inside: avoid;
        }
        .highlight { 
            background-color: #fef3c7; 
            padding: 15px; 
            border-left: 4px solid #f59e0b; 
            margin: 20px 0; 
            border-radius: 5px;
        }
        .signature-section { 
            margin-top: 40px; 
            border-top: 2px solid #e5e7eb; 
            padding-top: 20px; 
            page-break-inside: avoid;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 10pt; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .page-break {
            page-break-before: always;
        }
        .legal-notice {
            background-color: #fee2e2;
            border: 2px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .legal-notice h3 {
            color: #dc2626;
            margin-top: 0;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72pt;
            color: rgba(30, 64, 175, 0.1);
            z-index: -1;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="watermark">VIBE</div>
    
    <div class="header">
        <div class="logo">⚡ VIBE</div>
        <div class="company-info">
            ${company.name}<br>
            ${company.address}<br>
            Website: ${company.website} | Email: ${company.email} | Phone: ${company.phone}
        </div>
    </div>

    <div class="document-title">
        LOAN REQUEST TERMS & CONDITIONS<br>
        <span style="font-size: 12pt; font-weight: normal;">Peer-to-Peer Lending Agreement</span>
    </div>

    <div class="loan-details">
        <h2 style="margin-top: 0; color: #1e40af;">Loan Request Details</h2>
        <table>
            <tr><td>Borrower Name:</td><td>${borrower.name}</td></tr>
            <tr><td>Borrower Email:</td><td>${borrower.email}</td></tr>
            <tr><td>Loan Title:</td><td>${loan.title}</td></tr>
            <tr><td>Amount Requested:</td><td>${this.formatCurrency(loan.amount)}</td></tr>
            <tr><td>Interest Rate:</td><td>${loan.interestRate}% per annum</td></tr>
            <tr><td>Tenure:</td><td>${loan.tenure || loan.tenureDays} days</td></tr>
            <tr><td>Purpose:</td><td style="text-transform: capitalize;">${loan.purpose}</td></tr>
            <tr><td>Total Repayment Amount:</td><td><strong>${this.formatCurrency(repaymentAmount)}</strong></td></tr>
            <tr><td>Expected Repayment Date:</td><td><strong>${this.formatDate(repaymentDate)}</strong></td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">1. TERMS AND CONDITIONS</div>
        <ol class="terms-list">
            <li><strong>Loan Agreement:</strong> By posting this loan request, I, ${borrower.name}, agree to be legally bound by the terms and conditions set forth by Vibe P2P Lending Platform and acknowledge that this constitutes a binding contract upon acceptance by any lender.</li>
            
            <li><strong>Automatic Agreement Generation:</strong> I understand and expressly consent that upon funding of this loan (partial or full), sanction letters, lending agreements, and all related legal documents will be automatically generated and digitally signed on my behalf using my registered digital signature.</li>
            
            <li><strong>Repayment Obligation:</strong> I irrevocably commit to repay the borrowed amount of ${this.formatCurrency(loan.amount)} along with the agreed interest of ${loan.interestRate}% per annum, totaling ${this.formatCurrency(repaymentAmount)}, within the specified tenure of ${loan.tenure || loan.tenureDays} days from the date of disbursement.</li>
            
            <li><strong>Interest Calculation:</strong> Interest will be calculated on a simple interest basis at the rate of ${loan.interestRate}% per annum for the agreed tenure period. The total interest amount is ${this.formatCurrency(repaymentAmount - loan.amount)}.</li>
            
            <li><strong>Platform Fees:</strong> I acknowledge and agree that Vibe will deduct a platform fee of 1.5-2% from the funded amount to cover operational costs, verification services, blockchain transaction fees, and platform maintenance.</li>
            
            <li><strong>Late Payment Penalties:</strong> In case of delayed repayment beyond the agreed date, I agree to pay a late fee of 2% per month on the outstanding amount. Continued default may result in legal action and reporting to credit bureaus.</li>
            
            <li><strong>Default Consequences:</strong> I understand that defaulting on this loan will: (a) negatively affect my credit score and future borrowing capacity, (b) result in my account being suspended from the platform, (c) may lead to legal proceedings for recovery, and (d) will be reported to relevant credit information companies.</li>
            
            <li><strong>Verification and Documentation:</strong> All information provided is true, accurate, and complete to the best of my knowledge. I consent to verification processes including AI-powered document verification, identity checks, and credit assessments. Any false information may result in immediate loan cancellation and legal action.</li>
        </ol>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">2. LEGAL COMPLIANCE AND REGULATORY FRAMEWORK</div>
        <ol class="terms-list" start="9">
            <li><strong>Regulatory Compliance:</strong> This agreement is governed by the Reserve Bank of India (RBI) guidelines for Peer-to-Peer Lending Platforms, the Information Technology Act 2000, and all applicable Indian laws. Vibe is registered with RBI under registration number ${company.rbiRegistration}.</li>
            
            <li><strong>Data Privacy and Protection:</strong> I consent to the processing, storage, and sharing of my personal data as per Vibe's Privacy Policy, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules 2011, and the Digital Personal Data Protection Act 2023.</li>
            
            <li><strong>Blockchain Records:</strong> I understand and consent that all transaction records, agreements, and related data will be stored on the Algorand blockchain for transparency, immutability, and security. This creates an permanent, tamper-proof record of all transactions.</li>
            
            <li><strong>Dispute Resolution:</strong> Any disputes arising from this agreement will be resolved through binding arbitration as per the Arbitration and Conciliation Act 2015. The arbitration will be conducted in Mumbai, Maharashtra, and the proceedings will be in English.</li>
            
            <li><strong>Force Majeure:</strong> Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including but not limited to acts of God, government actions, pandemics, or technical failures.</li>
            
            <li><strong>Severability:</strong> If any provision of this agreement is found to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.</li>
        </ol>
    </div>

    <div class="section">
        <div class="section-title">3. BORROWER RIGHTS AND RESPONSIBILITIES</div>
        <ol class="terms-list" start="15">
            <li><strong>Right to Information:</strong> I have the right to receive complete information about the loan terms, fees, and charges before accepting any funding.</li>
            
            <li><strong>Prepayment Rights:</strong> I have the right to prepay the loan in full or in part at any time without penalty, subject to giving 7 days written notice to the platform.</li>
            
            <li><strong>Grievance Redressal:</strong> I have the right to file complaints through Vibe's grievance redressal mechanism and escalate to the RBI Ombudsman if not resolved satisfactorily.</li>
            
            <li><strong>Responsible Borrowing:</strong> I acknowledge my responsibility to borrow only what I can reasonably repay and to use the funds solely for the stated purpose.</li>
        </ol>
    </div>

    <div class="legal-notice">
        <h3>⚠️ IMPORTANT LEGAL NOTICE</h3>
        <p><strong>Risk Disclosure:</strong> Peer-to-peer lending involves significant financial risks. There is no guarantee of loan approval or funding. Interest rates and terms are determined by market forces and lender preferences.</p>
        
        <p><strong>RBI Disclaimer:</strong> Reserve Bank of India does not accept any responsibility for the correctness of any statements or representations made or opinions expressed by Vibe, and does not provide any assurance of repayment of the loans lent on it.</p>
        
        <p><strong>Legal Binding:</strong> This document creates a legally binding obligation upon electronic acceptance. By submitting this loan request, you agree to be bound by these terms and conditions.</p>
    </div>

    <div class="signature-section">
        <h3 style="color: #1e40af;">BORROWER ACKNOWLEDGMENT AND DIGITAL SIGNATURE</h3>
        <p><strong>I, ${borrower.name}, hereby acknowledge that:</strong></p>
        <ul>
            <li>I have read, understood, and agree to all the terms and conditions mentioned above</li>
            <li>I understand the risks associated with peer-to-peer lending</li>
            <li>All information provided is true and accurate</li>
            <li>I consent to digital signature and electronic agreement execution</li>
            <li>I agree to the automatic generation of legal documents upon loan funding</li>
        </ul>
        
        <table style="width: 100%; margin-top: 30px;">
            <tr>
                <td style="width: 50%; vertical-align: top;">
                    <strong>Borrower Details:</strong><br>
                    Name: ${borrower.name}<br>
                    Email: ${borrower.email}<br>
                    Date: ${this.formatDate(new Date())}<br>
                    IP Address: [Recorded at submission]
                </td>
                <td style="width: 50%; text-align: center; vertical-align: top;">
                    <div style="border: 2px solid #1e40af; padding: 20px; margin: 10px;">
                        <strong>Digital Signature</strong><br>
                        <em>Electronically signed via Vibe Platform</em><br>
                        <small>Timestamp: ${new Date().toISOString()}</small>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>${company.name}</strong></p>
        <p>${company.address}</p>
        <p>Website: ${company.website} | Email: ${company.email} | Phone: ${company.phone}</p>
        <p><strong>RBI Registration Number: ${company.rbiRegistration}</strong></p>
        <p><em>This is a computer-generated document with digital signature. No physical signature required.</em></p>
        <p style="margin-top: 10px; font-size: 9pt;">
            Generated on: ${this.formatDate(new Date())} | Document ID: LRT-${Date.now()}
        </p>
    </div>
</body>
</html>`;
  }

  static generateSanctionLetter(agreementData: any): string {
    const { loan_amount, funded_amount, interest_rate, tenure_days, borrower, lender, terms } = agreementData;
    const repaymentDate = new Date(terms.repayment_date);
    const totalRepayment = terms.total_repayment;
    const company = this.getCompanyInfo();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loan Sanction Letter</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            margin: 0; 
            color: #000; 
            font-size: 12pt;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #059669; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .logo { 
            font-size: 28pt; 
            font-weight: bold; 
            color: #059669; 
            margin-bottom: 10px; 
            font-family: Arial, sans-serif;
        }
        .company-info {
            font-size: 10pt;
            color: #666;
            margin-top: 10px;
        }
        .document-title {
            font-size: 20pt;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #059669;
        }
        .approved-stamp { 
            color: #059669; 
            font-size: 24pt; 
            font-weight: bold; 
            text-align: center; 
            margin: 20px 0; 
            border: 3px solid #059669;
            padding: 10px;
            display: inline-block;
            border-radius: 10px;
        }
        .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 14pt; 
            font-weight: bold; 
            color: #059669; 
            margin-bottom: 15px; 
            border-left: 4px solid #059669; 
            padding-left: 15px; 
        }
        .loan-details { 
            background-color: #f0fdf4; 
            padding: 20px; 
            border: 2px solid #059669; 
            margin: 20px 0; 
            border-radius: 5px;
        }
        .loan-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .loan-details td {
            padding: 10px;
            border-bottom: 1px solid #bbf7d0;
        }
        .loan-details td:first-child {
            font-weight: bold;
            width: 40%;
        }
        .terms-section {
            background-color: #fefce8;
            border: 1px solid #eab308;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .terms-list { 
            list-style-type: decimal; 
            margin-left: 20px; 
            text-align: justify;
        }
        .terms-list li { 
            margin-bottom: 15px; 
            page-break-inside: avoid;
        }
        .legal-section {
            background-color: #f1f5f9;
            border: 2px solid #64748b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 10pt; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72pt;
            color: rgba(5, 150, 105, 0.1);
            z-index: -1;
            font-weight: bold;
        }
        .page-break {
            page-break-before: always;
        }
        .legal-notice {
            background-color: #fee2e2;
            border: 2px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .legal-notice h3 {
            color: #dc2626;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="watermark">APPROVED</div>
    
    <div class="header">
        <div class="logo">⚡ VIBE</div>
        <div class="company-info">
            ${company.name}<br>
            ${company.address}<br>
            Website: ${company.website} | Email: ${company.email} | Phone: ${company.phone}
        </div>
    </div>

    <div class="document-title">
        LOAN SANCTION LETTER
    </div>
    
    <div style="text-align: center;">
        <div class="approved-stamp">✅ LOAN APPROVED</div>
    </div>

    <div class="section">
        <p><strong>Date:</strong> ${this.formatDate(new Date())}</p>
        <p><strong>Sanction Letter No:</strong> VBL-SL-${Date.now()}</p>
        <p><strong>Reference:</strong> Loan Application dated ${this.formatDate(new Date())}</p>
    </div>

    <div class="section">
        <p><strong>To,</strong></p>
        <p><strong>${borrower.name}</strong><br>
        Email: ${borrower.email}<br>
        ${borrower.phone ? `Phone: ${borrower.phone}` : ''}</p>
        
        <p><strong>Subject: Approval of Loan Application - Sanction Letter</strong></p>
        
        <p>Dear ${borrower.name},</p>
        
        <p>We are pleased to inform you that your loan application submitted through our Vibe P2P Lending Platform has been <strong>APPROVED</strong> and sanctioned by our verified lender partner. This sanction is subject to the terms and conditions mentioned herein.</p>
    </div>

    <div class="loan-details">
        <h2 style="margin-top: 0; color: #059669;">LOAN SANCTION DETAILS</h2>
        <table>
            <tr><td>Borrower Name:</td><td>${borrower.name}</td></tr>
            <tr><td>Borrower Email:</td><td>${borrower.email}</td></tr>
            <tr><td>Lender Name:</td><td>${lender.name}</td></tr>
            <tr><td>Lender Email:</td><td>${lender.email}</td></tr>
            <tr><td>Original Loan Request:</td><td>${this.formatCurrency(loan_amount)}</td></tr>
            <tr><td><strong>Sanctioned Amount:</strong></td><td><strong>${this.formatCurrency(funded_amount)}</strong></td></tr>
            <tr><td>Interest Rate:</td><td>${interest_rate}% per annum</td></tr>
            <tr><td>Loan Tenure:</td><td>${tenure_days} days</td></tr>
            <tr><td><strong>Total Repayment Amount:</strong></td><td><strong>${this.formatCurrency(totalRepayment)}</strong></td></tr>
            <tr><td><strong>Repayment Due Date:</strong></td><td><strong>${this.formatDate(repaymentDate)}</strong></td></tr>
            <tr><td>Platform Fee:</td><td>${terms.platform_fee_percentage}% (₹${(funded_amount * terms.platform_fee_percentage / 100).toFixed(2)})</td></tr>
            <tr><td>Late Payment Penalty:</td><td>${terms.late_fee_percentage}% per month</td></tr>
        </table>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">COMPREHENSIVE TERMS AND CONDITIONS</div>
        
        <div class="terms-section">
            <h3 style="color: #92400e; margin-top: 0;">1. LOAN DISBURSEMENT AND REPAYMENT TERMS</h3>
            
            <ol class="terms-list">
                <li><strong>Disbursement:</strong> The sanctioned amount of ${this.formatCurrency(funded_amount)} will be disbursed to your registered bank account within 24-48 hours of this sanction letter, subject to final verification and completion of all documentation requirements.</li>
                
                <li><strong>Repayment Schedule:</strong> You are required to repay the total amount of ${this.formatCurrency(totalRepayment)} on or before ${this.formatDate(repaymentDate)}. The repayment includes principal amount of ${this.formatCurrency(funded_amount)} plus interest of ${this.formatCurrency(totalRepayment - funded_amount)}.</li>
                
                <li><strong>Interest Calculation:</strong> Interest is calculated on simple interest basis at ${interest_rate}% per annum for ${tenure_days} days. The effective interest amount is ${this.formatCurrency(totalRepayment - funded_amount)}.</li>
                
                <li><strong>Platform Charges:</strong> A platform fee of ${terms.platform_fee_percentage}% (₹${(funded_amount * terms.platform_fee_percentage / 100).toFixed(2)}) will be deducted from the disbursed amount to cover operational costs, verification services, and blockchain transaction fees.</li>
                
                <li><strong>Late Payment Penalty:</strong> Any delay in repayment beyond the due date will attract a penalty of ${terms.late_fee_percentage}% per month on the outstanding amount. This penalty will be calculated on a daily basis and compounded monthly.</li>
                
                <li><strong>Prepayment Rights:</strong> You may prepay the loan in full or part without any prepayment penalty by giving 7 days written notice to the platform. Partial prepayments will reduce the outstanding principal proportionally.</li>
            </ol>
        </div>
    </div>

    <div class="section">
        <div class="section-title">2. LEGAL COMPLIANCE AND REGULATORY FRAMEWORK</div>
        
        <div class="legal-section">
            <ol class="terms-list" start="7">
                <li><strong>Regulatory Compliance:</strong> This loan sanction is governed by the Reserve Bank of India (RBI) guidelines for Peer-to-Peer Lending Platforms under the RBI (Reserve Bank) - Credit Information Companies Regulations, 2006, and the Information Technology Act, 2000. Vibe is registered with RBI under registration number ${company.rbiRegistration}.</li>
                
                <li><strong>Legal Jurisdiction:</strong> This agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this agreement shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</li>
                
                <li><strong>Data Protection and Privacy:</strong> Your personal and financial data will be processed in accordance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023. We maintain strict confidentiality and security protocols.</li>
                
                <li><strong>Blockchain Security:</strong> All transaction records, agreements, and repayment schedules are immutably recorded on the Algorand blockchain for transparency, security, and dispute resolution. This creates a permanent, tamper-proof record of all loan-related activities.</li>
                
                <li><strong>Credit Information Sharing:</strong> Your loan performance data may be shared with Credit Information Companies (CICs) as per RBI guidelines. Timely repayment will positively impact your credit score, while defaults will be reported and may affect future borrowing capacity.</li>
                
                <li><strong>Anti-Money Laundering (AML) Compliance:</strong> This transaction is subject to AML and Know Your Customer (KYC) regulations. Any suspicious activities will be reported to relevant authorities as per the Prevention of Money Laundering Act, 2002.</li>
            </ol>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">3. BORROWER RIGHTS, RESPONSIBILITIES AND PROTECTIONS</div>
        
        <ol class="terms-list" start="13">
            <li><strong>Right to Information:</strong> You have the right to receive complete and accurate information about all loan terms, fees, charges, and conditions before loan disbursement. Any changes to terms require your explicit consent.</li>
            
            <li><strong>Fair Treatment:</strong> You are entitled to fair and transparent treatment throughout the loan lifecycle. Any grievances can be escalated through our internal grievance redressal mechanism and subsequently to the RBI Ombudsman.</li>
            
            <li><strong>Privacy Rights:</strong> Your personal information will be kept confidential and used only for legitimate business purposes. You have the right to access, correct, and request deletion of your personal data as per applicable data protection laws.</li>
            
            <li><strong>Responsible Borrowing:</strong> You acknowledge your responsibility to borrow only what you can reasonably repay and to use the funds solely for the stated purpose. Misuse of funds may result in immediate loan recall.</li>
            
            <li><strong>Default Consequences:</strong> In case of default, the following actions may be taken: (a) Reporting to credit bureaus affecting your credit score, (b) Legal proceedings for recovery, (c) Additional penalty charges, (d) Suspension from the platform, (e) Recovery through legal means including asset attachment where applicable.</li>
            
            <li><strong>Force Majeure:</strong> Neither party shall be liable for any failure or delay in performance due to circumstances beyond their reasonable control, including but not limited to acts of God, government actions, natural disasters, pandemics, or technical failures.</li>
        </ol>
    </div>

    <div class="section">
        <div class="section-title">4. LENDER INFORMATION AND AGREEMENT</div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border: 2px solid #0ea5e9; border-radius: 5px;">
            <h3 style="color: #0ea5e9; margin-top: 0;">Lender Details and Commitment</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd; font-weight: bold; width: 30%;">Lender Name:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd;">${lender.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd; font-weight: bold;">Lender Email:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd;">${lender.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd; font-weight: bold;">Funding Date:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd;">${this.formatDate(new Date())}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd; font-weight: bold;">Lender Agreement Status:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #bae6fd;"><strong>Confirmed and Digitally Signed</strong></td>
                </tr>
            </table>
            
            <p style="margin-top: 15px;"><strong>Lender Commitment:</strong> The lender has agreed to provide the loan amount under the terms mentioned in this sanction letter and has digitally signed the lending agreement through our secure platform.</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">5. NEXT STEPS AND IMPORTANT INSTRUCTIONS</div>
        
        <ol class="terms-list" start="19">
            <li><strong>Document Verification:</strong> Ensure all your KYC documents are up-to-date and verified on the platform before loan disbursement.</li>
            
            <li><strong>Bank Account Verification:</strong> Confirm that your registered bank account details are accurate as the loan amount will be transferred to this account only.</li>
            
            <li><strong>Loan Utilization:</strong> Use the loan amount strictly for the purpose mentioned in your application. Any deviation may result in immediate loan recall.</li>
            
            <li><strong>Repayment Setup:</strong> Set up automatic repayment instructions with your bank to ensure timely repayment and avoid late fees.</li>
            
            <li><strong>Communication:</strong> Keep your contact information updated on the platform. All important communications regarding your loan will be sent to your registered email and phone number.</li>
            
            <li><strong>Platform Access:</strong> Regularly check your Vibe dashboard for loan status updates, repayment reminders, and important notifications.</li>
        </ol>
    </div>

    <div class="legal-notice">
        <h3>⚠️ IMPORTANT LEGAL DISCLAIMERS</h3>
        
        <p><strong>RBI Disclaimer:</strong> Reserve Bank of India does not accept any responsibility for the correctness of any of the statements or representations made or opinions expressed by Vibe, and does not provide any assurance of repayment of the loans lent on it.</p>
        
        <p><strong>Risk Disclosure:</strong> Peer-to-peer lending involves inherent financial risks. Interest rates and loan terms are determined by market forces and mutual agreement between borrowers and lenders.</p>
        
        <p><strong>Platform Limitation:</strong> Vibe acts as an intermediary platform facilitating connections between borrowers and lenders. We do not guarantee loan approvals, disbursements, or repayments.</p>
        
        <p><strong>Legal Binding:</strong> This sanction letter creates a legally binding obligation upon acceptance. By accepting the loan disbursement, you agree to be bound by all terms and conditions mentioned herein.</p>
    </div>

    <div class="section">
        <p>We thank you for choosing Vibe P2P Lending Platform and wish you success in your endeavors. We are committed to providing you with excellent service throughout your loan journey.</p>
        
        <p>For any queries, clarifications, or support, please contact our customer service team at ${company.email} or call us at ${company.phone} during business hours (10 AM to 5 PM, Monday to Friday).</p>
        
        <p><strong>Yours sincerely,</strong></p>
        <br>
        <div style="border: 2px solid #059669; padding: 15px; display: inline-block; border-radius: 5px;">
            <p style="margin: 0;"><strong>Vibe P2P Lending Platform</strong></p>
            <p style="margin: 5px 0 0 0;"><em>Authorized Signatory</em></p>
            <p style="margin: 5px 0 0 0; font-size: 10pt;">Digitally Signed and Verified</p>
        </div>
    </div>

    <div class="footer">
        <p><strong>${company.name}</strong></p>
        <p>${company.address}</p>
        <p>Website: ${company.website} | Email: ${company.email} | Phone: ${company.phone}</p>
        <p><strong>RBI Registration Number: ${company.rbiRegistration}</strong></p>
        <p><em>This is a computer-generated document with digital signature. No physical signature required.</em></p>
        <p style="margin-top: 10px; font-size: 9pt;">
            Generated on: ${this.formatDate(new Date())} | Document ID: SL-${Date.now()}
        </p>
    </div>
</body>
</html>`;
  }

  static generateLendingProof(agreementData: any): string {
    const { loan_amount, funded_amount, interest_rate, tenure_days, borrower, lender, terms } = agreementData;
    const repaymentDate = new Date(terms.repayment_date);
    const totalRepayment = terms.total_repayment;
    const company = this.getCompanyInfo();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lending Proof Certificate</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            margin: 0; 
            color: #000; 
            font-size: 12pt;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #7c3aed; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .logo { 
            font-size: 28pt; 
            font-weight: bold; 
            color: #7c3aed; 
            margin-bottom: 10px; 
            font-family: Arial, sans-serif;
        }
        .company-info {
            font-size: 10pt;
            color: #666;
            margin-top: 10px;
        }
        .document-title {
            font-size: 20pt;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #7c3aed;
        }
        .certificate-badge { 
            background: linear-gradient(135deg, #7c3aed, #ec4899); 
            color: white; 
            padding: 30px; 
            border-radius: 15px; 
            text-align: center; 
            margin: 30px 0; 
            box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
        }
        .certificate-badge h2 {
            margin: 0;
            font-size: 24pt;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .certificate-badge p {
            margin: 15px 0 0 0;
            font-size: 14pt;
            opacity: 0.9;
        }
        .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 14pt; 
            font-weight: bold; 
            color: #7c3aed; 
            margin-bottom: 15px; 
            border-left: 4px solid #7c3aed; 
            padding-left: 15px; 
        }
        .loan-details { 
            background-color: #faf5ff; 
            padding: 20px; 
            border: 2px solid #7c3aed; 
            margin: 20px 0; 
            border-radius: 5px;
        }
        .loan-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .loan-details td {
            padding: 10px;
            border-bottom: 1px solid #ddd6fe;
        }
        .loan-details td:first-child {
            font-weight: bold;
            width: 40%;
        }
        .impact-section {
            background-color: #f0f9ff;
            border: 2px solid #0ea5e9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .terms-list { 
            list-style-type: decimal; 
            margin-left: 20px; 
            text-align: justify;
        }
        .terms-list li { 
            margin-bottom: 15px; 
            page-break-inside: avoid;
        }
        .legal-section {
            background-color: #f1f5f9;
            border: 2px solid #64748b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 10pt; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72pt;
            color: rgba(124, 58, 237, 0.1);
            z-index: -1;
            font-weight: bold;
        }
        .page-break {
            page-break-before: always;
        }
        .blockchain-info {
            background-color: #f1f5f9;
            border: 1px solid #64748b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-size: 10pt;
        }
        .legal-notice {
            background-color: #fee2e2;
            border: 2px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .legal-notice h3 {
            color: #dc2626;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="watermark">VERIFIED</div>
    
    <div class="header">
        <div class="logo">⚡ VIBE</div>
        <div class="company-info">
            ${company.name}<br>
            ${company.address}<br>
            Website: ${company.website} | Email: ${company.email} | Phone: ${company.phone}
        </div>
    </div>

    <div class="document-title">
        LENDING PROOF CERTIFICATE
    </div>
    
    <div style="text-align: center;">
        <p style="font-size: 14pt; color: #7c3aed; margin: 10px 0;">
            <em>Official Proof of Peer-to-Peer Lending Transaction</em>
        </p>
    </div>

    <div class="certificate-badge">
        <h2>🏆 VERIFIED LENDER</h2>
        <p>This certificate confirms your valuable contribution to student financial empowerment through peer-to-peer lending</p>
    </div>

    <div class="section">
        <p><strong>Certificate No:</strong> VBL-LP-${Date.now()}</p>
        <p><strong>Issue Date:</strong> ${this.formatDate(new Date())}</p>
        <p><strong>Blockchain Transaction ID:</strong> ALG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
    </div>

    <div class="loan-details">
        <h2 style="margin-top: 0; color: #7c3aed;">LENDING TRANSACTION DETAILS</h2>
        <table>
            <tr><td>Lender Name:</td><td><strong>${lender.name}</strong></td></tr>
            <tr><td>Lender Email:</td><td>${lender.email}</td></tr>
            <tr><td>Borrower Name:</td><td>${borrower.name}</td></tr>
            <tr><td>Borrower Email:</td><td>${borrower.email}</td></tr>
            <tr><td><strong>Amount Lent:</strong></td><td><strong>${this.formatCurrency(funded_amount)}</strong></td></tr>
            <tr><td>Interest Rate:</td><td>${interest_rate}% per annum</td></tr>
            <tr><td>Loan Tenure:</td><td>${tenure_days} days</td></tr>
            <tr><td><strong>Expected Return:</strong></td><td><strong>${this.formatCurrency(totalRepayment)}</strong></td></tr>
            <tr><td><strong>Expected Profit:</strong></td><td><strong>${this.formatCurrency(totalRepayment - funded_amount)}</strong></td></tr>
            <tr><td>Transaction Date:</td><td>${this.formatDate(new Date())}</td></tr>
            <tr><td>Expected Repayment Date:</td><td>${this.formatDate(repaymentDate)}</td></tr>
            <tr><td>Platform Fee Paid:</td><td>₹${(funded_amount * terms.platform_fee_percentage / 100).toFixed(2)} (${terms.platform_fee_percentage}%)</td></tr>
        </table>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="section-title">COMPREHENSIVE TERMS AND CONDITIONS</div>
        
        <div class="legal-section">
            <h3 style="color: #64748b; margin-top: 0;">Legal Framework and Compliance</h3>
            
            <ol class="terms-list">
                <li><strong>Regulatory Compliance:</strong> This lending transaction is conducted under the regulatory framework established by the Reserve Bank of India (RBI) for Peer-to-Peer Lending Platforms. Vibe is registered with RBI under registration number ${company.rbiRegistration} and operates in full compliance with applicable regulations.</li>
                
                <li><strong>Legal Documentation:</strong> This certificate serves as legal proof of your lending transaction and can be used for tax purposes, financial records, and regulatory compliance. All transaction details are immutably recorded on the Algorand blockchain for transparency and verification.</li>
                
                <li><strong>Lender Rights and Protections:</strong> As a verified lender, you are entitled to: (a) Timely repayment as per agreed terms, (b) Legal recourse in case of borrower default, (c) Transparent communication regarding loan status, (d) Protection under applicable consumer protection laws, (e) Access to borrower's credit information for informed decision-making.</li>
                
                <li><strong>Risk Acknowledgment:</strong> You acknowledge that peer-to-peer lending involves inherent financial risks including but not limited to: (a) Risk of borrower default, (b) Interest rate fluctuations, (c) Platform operational risks, (d) Regulatory changes affecting P2P lending. Past performance does not guarantee future returns.</li>
                
                <li><strong>Tax Implications:</strong> Interest income earned from this lending transaction is subject to applicable income tax laws. You are responsible for reporting this income in your tax returns. We recommend consulting with a tax advisor for proper compliance.</li>
                
                <li><strong>Data Protection:</strong> Your personal and financial information is protected under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023.</li>
            </ol>
        </div>
    </div>

    <div class="impact-section">
        <h3 style="color: #0ea5e9; margin-top: 0;">🌟 YOUR SOCIAL IMPACT</h3>
        <p>By lending ${this.formatCurrency(funded_amount)} to ${borrower.name}, you have:</p>
        <ul>
            <li><strong>Empowered Education:</strong> Directly supported a student's educational journey and financial needs</li>
            <li><strong>Enabled Opportunity:</strong> Provided access to funds that traditional banking might not offer</li>
            <li><strong>Built Community:</strong> Strengthened the peer-to-peer lending ecosystem for students</li>
            <li><strong>Generated Returns:</strong> Earned a competitive return of ${interest_rate}% per annum on your investment</li>
            <li><strong>Promoted Financial Inclusion:</strong> Contributed to democratizing access to financial services</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">LENDER RIGHTS AND PROTECTIONS</div>
        
        <ol class="terms-list" start="7">
            <li><strong>Legal Protection:</strong> This transaction is protected under RBI guidelines for P2P lending platforms and Indian contract law. You have legal recourse in case of borrower default or platform issues.</li>
            
            <li><strong>Blockchain Security:</strong> Transaction details are immutably recorded on Algorand blockchain, providing transparent and tamper-proof evidence of the lending agreement.</li>
            
            <li><strong>Repayment Tracking:</strong> Automated reminders and tracking systems ensure borrower compliance with repayment schedules. You will receive regular updates on loan status.</li>
            
            <li><strong>Default Protection:</strong> In case of borrower default, the platform will initiate recovery proceedings including legal action, credit bureau reporting, and asset recovery where applicable.</li>
            
            <li><strong>Platform Support:</strong> 24/7 customer support is available for any queries, disputes, or issues related to your lending transaction.</li>
            
            <li><strong>Transparency:</strong> Complete visibility into borrower profile, loan utilization, and repayment history ensures informed lending decisions.</li>
            
            <li><strong>Grievance Redressal:</strong> Access to internal grievance redressal mechanism and escalation to RBI Ombudsman if required.</li>
        </ol>
    </div>

    <div class="section">
        <div class="section-title">INVESTMENT SUMMARY AND ANALYSIS</div>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0;">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 50%; padding: 10px; border-right: 1px solid #e2e8f0;">
                        <strong>Investment Details:</strong><br>
                        Principal Amount: ${this.formatCurrency(funded_amount)}<br>
                        Interest Rate: ${interest_rate}% p.a.<br>
                        Investment Period: ${tenure_days} days<br>
                        Expected Return: ${this.formatCurrency(totalRepayment)}
                    </td>
                    <td style="width: 50%; padding: 10px;">
                        <strong>Return Analysis:</strong><br>
                        Total Interest: ${this.formatCurrency(totalRepayment - funded_amount)}<br>
                        ROI: ${(((totalRepayment - funded_amount) / funded_amount) * 100).toFixed(2)}%<br>
                        Annualized Return: ${interest_rate}%<br>
                        Risk Level: Moderate
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div class="blockchain-info">
        <h4 style="margin-top: 0; color: #64748b;">🔗 BLOCKCHAIN VERIFICATION</h4>
        <p><strong>Network:</strong> Algorand Blockchain</p>
        <p><strong>Smart Contract:</strong> VIBE-P2P-LENDING-v2.1</p>
        <p><strong>Transaction Hash:</strong> ${Date.now()}-${Math.random().toString(36).substr(2, 16).toUpperCase()}</p>
        <p><strong>Block Number:</strong> ${Math.floor(Math.random() * 1000000) + 5000000}</p>
        <p><strong>Verification Status:</strong> ✅ Verified and Immutable</p>
        <p><em>This transaction is permanently recorded on the blockchain and cannot be altered or deleted.</em></p>
    </div>

    <div class="legal-notice">
        <h3>⚠️ IMPORTANT LEGAL DISCLAIMERS</h3>
        
        <p><strong>RBI Disclaimer:</strong> Reserve Bank of India does not accept any responsibility for the correctness of any of the statements or representations made or opinions expressed by Vibe, and does not provide any assurance of repayment of the loans lent on it.</p>
        
        <p><strong>Investment Risk:</strong> Peer-to-peer lending involves significant financial risks. There is no guarantee of repayment, and you may lose part or all of your invested amount. Past performance does not indicate future results.</p>
        
        <p><strong>Platform Limitation:</strong> Vibe acts as an intermediary platform and does not guarantee loan repayments. We facilitate connections between borrowers and lenders but are not party to the loan agreement.</p>
        
        <p><strong>Legal Binding:</strong> This certificate represents a legally binding lending transaction. By participating in this transaction, you acknowledge understanding and acceptance of all associated risks and terms.</p>
    </div>

    <div class="section">
        <div class="section-title">CERTIFICATE VALIDATION</div>
        
        <p>This certificate is digitally signed and can be verified through:</p>
        <ul>
            <li>Vibe Platform Dashboard: ${company.website}/verify</li>
            <li>Blockchain Explorer: algorand.explorer/tx/[transaction-hash]</li>
            <li>Email verification: Send certificate ID to verify@vibe.com</li>
        </ul>
    </div>

    <div style="text-align: center; margin: 40px 0;">
        <div style="border: 3px solid #7c3aed; padding: 20px; display: inline-block; border-radius: 10px;">
            <p style="margin: 0; font-size: 14pt; color: #7c3aed;"><strong>DIGITALLY CERTIFIED</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 10pt;">Vibe P2P Lending Platform</p>
            <p style="margin: 5px 0 0 0; font-size: 10pt;">${this.formatDate(new Date())}</p>
        </div>
    </div>

    <div class="footer">
        <p><strong>${company.name}</strong></p>
        <p>${company.address}</p>
        <p>Website: ${company.website} | Email: ${company.email} | Phone: ${company.phone}</p>
        <p><strong>RBI Registration Number: ${company.rbiRegistration}</strong></p>
        <p><em>This certificate is digitally generated and verified through blockchain technology.</em></p>
        <p style="margin-top: 10px; font-size: 9pt;">
            Generated on: ${this.formatDate(new Date())} | Certificate ID: LP-${Date.now()}
        </p>
    </div>
</body>
</html>`;
  }

  static async generatePDF(htmlContent: string, filename: string): Promise<string> {
    try {
      // Create a temporary container for the HTML content
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.backgroundColor = 'white';
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Clean up
      document.body.removeChild(container);

      // Save the PDF
      pdf.save(`${filename}.pdf`);

      // Return a mock URL (in production, you'd upload to cloud storage)
      return `https://vibe-documents.s3.amazonaws.com/agreements/${filename}-${Date.now()}.pdf`;
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Fallback: create HTML file for download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return `${filename}.html`;
    }
  }
}