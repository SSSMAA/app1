from django.urls import path
from .views import (
    SelectClassDateView,
    MarkAttendanceView,
    StudentAttendanceView,
)

urlpatterns = [
    # Teacher URLs
    path('teacher/select-class-date/', SelectClassDateView.as_view(), name='select_class_date_attendance'),
    path('teacher/mark/<int:class_id>/<str:date>/', MarkAttendanceView.as_view(), name='mark_attendance'),

    # Student URLs
    path('student/my-attendance/', StudentAttendanceView.as_view(), name='view_student_attendance'),
]
