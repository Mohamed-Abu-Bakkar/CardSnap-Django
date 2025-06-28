from django.contrib import admin
from django.urls import path, include, re_path
from convert.views import FrontendAppView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('convert.urls')),
    re_path(r'^.*$', FrontendAppView.as_view()),  # Catch-all for React Router
]
