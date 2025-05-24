from django.contrib import admin
from .models import Grade
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_instance', 'assessment_name', 'grade', 'date_recorded')
    list_filter = ('class_instance__name', 'student__username', 'assessment_name', 'date_recorded')
    search_fields = ('student__username', 'class_instance__name', 'assessment_name', 'grade')
    raw_id_fields = ('student', 'class_instance') # For better performance

    def get_queryset(self, request):
        # Optimize query
        qs = super().get_queryset(request)
        return qs.select_related('student', 'class_instance', 'class_instance__subject', 'class_instance__teacher')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "student":
            # Optionally, further filter students based on the selected class_instance if possible,
            # though this is complex in the admin list view.
            # For adding/editing, this ensures only students are selectable.
            kwargs["queryset"] = User.objects.filter(role='student')
        # If you wanted to filter students based on the class selected in the form:
        # This requires more advanced JavaScript or a custom form.
        # For now, limiting to 'student' role is a good first step.
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
