from django.conf.urls import url

from rest_framework.routers import SimpleRouter

from . import views

from horseman.horsemannodes import views as node_views
from horseman.horsemanimages import views as image_views

router = SimpleRouter()

router.register(r'nodes', node_views.NodeViewSet)
router.register(r'images', image_views.ImageViewSet)

urlpatterns = router.urls

urlpatterns += [
    url(r'timezones', views.TimezoneListView.as_view()),
]
