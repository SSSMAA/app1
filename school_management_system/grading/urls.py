from django.urls import path
from .views import (
    SelectClassAssessmentView,
    RecordGradesView,
    StudentGradesView,
)

urlpatterns = [
    # Teacher URLs
    path('teacher/select-assessment/', SelectClassAssessmentView.as_view(), name='select_class_assessment_grading'),
    path('teacher/record/<int:class_id>/<str:assessment_name>/', RecordGradesView.as_view(), name='record_grades'),

    # Student URLs
    path('student/my-grades/', StudentGradesView.as_view(), name='view_student_grades'),
]
