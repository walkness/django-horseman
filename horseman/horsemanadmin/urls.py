from django.conf.urls import url, include

from . import views

app_name = 'horsemanadmin'

urlpatterns = [
    url(r'^login/', views.login),
    url(r'^$', views.default, name='home'),
    url(r'^', views.default),
]
