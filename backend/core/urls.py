from django.contrib import admin
from django.urls import path, include, re_path
from convert.views import FrontendAppView
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('convert.urls')),
    re_path(r'^.*$', FrontendAppView.as_view()), 
        path("", TemplateView.as_view(template_name="index.html")),
 # Catch-all for React Router
]
