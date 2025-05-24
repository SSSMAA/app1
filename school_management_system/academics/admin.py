from django.contrib import admin
from .models import Subject, Class, Schedule

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class ScheduleInline(admin.TabularInline): # Or admin.StackedInline for a different layout
    model = Schedule
    extra = 1 # Number of empty forms to display
    fields = ('day_of_week', 'start_time', 'end_time', 'room_number')

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'teacher', 'start_date', 'end_date')
    list_filter = ('subject', 'teacher', 'start_date', 'end_date')
    search_fields = ('name', 'subject__name', 'teacher__username', 'teacher__first_name', 'teacher__last_name')
    inlines = [ScheduleInline]
    raw_id_fields = ('teacher',) # Use for better performance if many users

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "teacher":
            # Filter to show only users with the 'teacher' role
            kwargs["queryset"] = User.objects.filter(role='teacher') # Use User model
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('class_instance', 'day_of_week', 'start_time', 'end_time', 'room_number')
    list_filter = ('day_of_week', 'class_instance__subject', 'class_instance__teacher')
    search_fields = ('class_instance__name', 'room_number')
    autocomplete_fields = ['class_instance'] # For easier selection of class_instance

# Need to import settings and User model for the ClassAdmin formfield_for_foreignkey
from django.conf import settings
from django.contrib.auth import get_user_model # To get the User model
from .models import LessonMaterial # Import LessonMaterial
User = get_user_model()

@admin.register(LessonMaterial)
class LessonMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'class_instance', 'upload_date', 'uploaded_by')
    list_filter = ('class_instance', 'uploaded_by', 'upload_date')
    search_fields = ('title', 'description', 'class_instance__name', 'uploaded_by__username')
    raw_id_fields = ('class_instance', 'uploaded_by') # For performance

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "uploaded_by":
            # Filter to show only users with the 'teacher' role
            kwargs["queryset"] = User.objects.filter(role='teacher')
        # If we want to filter class_instance by the logged-in teacher in admin,
        # it's more complex and might require overriding get_form or get_queryset.
        # For now, ensuring uploaded_by is a teacher is a good step.
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # If not superuser, filter materials by the logged-in teacher (if they are a teacher)
        # This is a basic example; more granular permissions might be needed.
        if not request.user.is_superuser and request.user.role == 'teacher':
            return qs.filter(uploaded_by=request.user)
        return qs.select_related('class_instance', 'uploaded_by', 'class_instance__subject')
