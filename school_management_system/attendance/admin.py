from django.contrib import admin
from .models import Attendance

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_instance', 'date', 'status', 'remarks')
    list_filter = ('class_instance', 'date', 'status', 'student__username') # Filter by student username
    search_fields = ('student__username', 'class_instance__name', 'date')
    # For better performance with many students/classes, consider raw_id_fields for ForeignKey
    raw_id_fields = ('student', 'class_instance')
    # Customize the form to ensure student selection is limited to actual students in the class
    # This might require a more complex form or overriding get_form method

    def get_queryset(self, request):
        # Optimize query
        qs = super().get_queryset(request)
        return qs.select_related('student', 'class_instance', 'class_instance__subject')
