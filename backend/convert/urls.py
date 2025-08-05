from django.urls import path
from .views import ColumnPreview, VCardConverter,PDFExportView

urlpatterns = [
    path("preview-columns/", ColumnPreview.as_view(), name="preview-columns"),
    path("convert/", VCardConverter.as_view(), name="convert"),
    path("export-pdf/", PDFExportView.as_view(), name="export-pdf"),
]
