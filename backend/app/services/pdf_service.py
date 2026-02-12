from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime

class PDFService:
    def generate_transaction_statement(self, transactions: list, user_name: str, start_date=None, end_date=None) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Custom Royal Style
        title_style = ParagraphStyle(
            'RoyalTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#D4AF37'), # Gold
            alignment=1, # Center
            spaceAfter=20
        )
        
        # Header
        elements.append(Paragraph("ROYAL AMOUNT COLLECTOR", title_style))
        elements.append(Paragraph(f"Transaction Statement for: {user_name}", styles['Heading2']))
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))

        # Table Data
        data = [['Date', 'Type', 'Amount', 'Performed By', 'Mode']] # Header row
        
        total_in = 0
        total_out = 0

        for t in transactions:
            date_str = t.created_at.strftime("%Y-%m-%d %H:%M")
            amount_str = f"Rs. {t.amount:,.2f}"
            
            # Logic for color coding if needed, but keeping text simple
            row = [
                date_str,
                t.transaction_type,
                amount_str,
                t.performed_by.full_name if t.performed_by else 'System',
                t.payment_mode
            ]
            data.append(row)
            
            if t.transaction_type == "PAYMENT":
                total_in += t.amount
            elif t.transaction_type == "DISBURSEMENT":
                total_out += t.amount

        # Table Style
        table = Table(data, colWidths=[110, 100, 100, 120, 80])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')), # Royal Dark Blue
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#D4AF37')), # Gold Text
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 20))
        
        # Summary
        elements.append(Paragraph(f"Total Collected: Rs. {total_in:,.2f}", styles['Normal']))
        elements.append(Paragraph(f"Total Disbursed: Rs. {total_out:,.2f}", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_service = PDFService()
