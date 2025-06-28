from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
import pandas as pd
import json
from django.http import HttpResponse





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

        if not file_obj or not mapping:
            return Response({"error": "Missing file or mapping"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file_obj)
            vcards = []

            for _, row in df.iterrows():
                vcard = "BEGIN:VCARD\nVERSION:3.0\n"
                if mapping.get("first_name"):
                    vcard += f"N:{row.get(mapping['first_name'], '')};;;\n"
                if mapping.get("last_name"):
                    vcard += f"FN:{row.get(mapping['last_name'], '')}\n"
                if mapping.get("email"):
                    vcard += f"EMAIL:{row.get(mapping['email'], '')}\n"
                if mapping.get("phone"):
                    vcard += f"TEL:{row.get(mapping['phone'], '')}\n"
                vcard += "END:VCARD\n"
                vcards.append(vcard)

            vcard_content = "".join(vcards)
            response = HttpResponse(vcard_content, content_type='text/vcard')
            response['Content-Disposition'] = 'attachment; filename=contacts.vcf'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
from django.views.generic import View
from django.shortcuts import render


class FrontendAppView(View):
    def get(self, request):
        return render(request, 'index.html')

