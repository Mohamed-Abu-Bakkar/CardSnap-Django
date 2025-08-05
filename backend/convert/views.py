from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
from django.views.generic import View
from django.shortcuts import render
import pandas as pd
import json
from fpdf import FPDF
from django.http import FileResponse
import io


class ColumnPreview(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(file)
            columns = list(df.columns)
            return Response({"columns": columns}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VCardConverter(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        mapping = json.loads(request.data.get("mapping", "{}"))
        phones = json.loads(request.data.get("phones", "[]"))
        group_col = request.data.get("group", "")
        label = request.data.get("label", "").strip()

        if not file_obj or not mapping:
            return Response({"error": "Missing file or mapping"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file_obj)
            vcards = []

            for _, row in df.iterrows():
                vcard = "BEGIN:VCARD\nVERSION:3.0\n"
                # Use mapping for all fields
                first_name = row.get(mapping.get('first_name', ''), '')
                last_name = row.get(mapping.get('last_name', ''), '')
                email = row.get(mapping.get('email', ''), '')
                # Group: prefer mapping, fallback to group_col
                group = ''
                if 'group' in mapping and mapping['group']:
                    group = row.get(mapping['group'], '')
                elif group_col:
                    group = row.get(group_col, '')

                # Compose full name
                full_name = f"{first_name} {last_name}".strip() or "Unnamed Contact"
                name_label = label  # preserve original label for FN only
                labeled_name = f"{name_label} {full_name}".strip() if name_label else full_name
                vcard += f"N:{last_name};{first_name};;;\n"
                vcard += f"FN:{labeled_name}\n"

                if email:
                    vcard += f"EMAIL:{email}\n"

                # Handle multiple phones with labels, using mapping for column
                for phone in phones:
                    col = phone.get("column", "")
                    phone_label = phone.get("label", "CELL").upper() or "CELL"
                    col_name = mapping.get(col, col)  # allow mapping alias or direct column
                    number = row.get(col_name, "")
                    if number:
                        vcard += f"TEL;TYPE={phone_label}:{number}\n"

                # Grouping
                if group:
                    vcard += f"CATEGORIES:{group}\n"

                vcard += "END:VCARD\n"
                vcards.append(vcard)

            vcard_content = "".join(vcards)
            response = HttpResponse(vcard_content, content_type='text/vcard')
            response['Content-Disposition'] = 'attachment; filename=contacts.vcf'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PDFExportView(APIView):
    def post(self, request):
        """
        Expects: POST request with parsed contacts list
        {
            "contacts": [
                {"name": "John Doe", "email": "john@example.com", "phones": [{"label": "work", "number": "123456"}], "group": "Office"},
                ...
            ]
        }
        """
        contacts = request.data.get("contacts", [])
        if not contacts:
            print("No contact data provided")
            return Response({"error": "No contact data provided"}, status=400)

        buffer = io.BytesIO()
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Contacts Report", ln=True, align='C')

        pdf.set_font("Arial", '', 12)
        for contact in contacts:
            name = contact.get("name", "N/A")
            email = contact.get("email", "")
            group = contact.get("group", "")
            phones = contact.get("phones", [])

            pdf.ln(8)
            pdf.set_text_color(0, 0, 0)
            pdf.cell(0, 10, f"Name: {name}", ln=True)
            if email:
                pdf.cell(0, 8, f"Email: {email}", ln=True)
            for phone in phones:
                pdf.cell(0, 8, f"{phone['label'].capitalize()} Phone: {phone['number']}", ln=True)
            if group:
                pdf.cell(0, 8, f"Group: {group}", ln=True)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())  # separator

        pdf.output(buffer)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename="contacts.pdf")


class FrontendAppView(View):
    def get(self, request):
        return render(request, 'index.html')
