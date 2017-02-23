from rest_framework.routers import SimpleRouter

from horseman.horsemannodes import views as node_views

router = SimpleRouter()

router.register(r'nodes', node_views.NodeViewSet)

urlpatterns = router.urls
