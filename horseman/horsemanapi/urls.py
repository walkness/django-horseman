from django.conf.urls import url

from rest_framework.routers import SimpleRouter

from . import views

from horseman.horsemannodes import views as node_views
from horseman.horsemanimages import views as image_views
from horseman.horsemanusers import views as user_views
from horseman.horsemancomments import views as comment_views

router = SimpleRouter()

router.register(r'nodes', node_views.NodeViewSet)
router.register(r'images', image_views.ImageViewSet)
router.register(r'image_tasks', image_views.ImageTaskViewSet)
router.register(r'users', user_views.UserViewSet)
router.register(r'comments', comment_views.CommentViewSet)

urlpatterns = router.urls

urlpatterns += [
    url(r'timezones', views.TimezoneListView.as_view()),
    url(r'^auth/$', user_views.AuthView.as_view()),
    url(r'^auth/password/reset/$', user_views.PasswordResetView.as_view()),
    url(r'^auth/password/change/$', user_views.PasswordChangeView.as_view()),
]
