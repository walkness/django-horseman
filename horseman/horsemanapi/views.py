from rest_framework.views import APIView
from rest_framework.response import Response

import pytz


class TimezoneListView(APIView):

    def get(self, request, format=None):
        return Response(pytz.all_timezones)
