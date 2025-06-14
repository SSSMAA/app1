from django.urls import path
from .views import (
    SelectClassForMaterialsView,
    UploadLessonMaterialView,
    ListTeacherMaterialsView,
    EditLessonMaterialView,
    DeleteLessonMaterialView,
    ListStudentMaterialsView,
    DownloadLessonMaterialView,
)

urlpatterns = [
    # Common view for selecting a class first
    path('materials/select-class/', SelectClassForMaterialsView.as_view(), name='select_class_for_materials'),

    # Teacher URLs for Lesson Materials
    path('materials/teacher/list/<int:class_id>/', ListTeacherMaterialsView.as_view(), name='list_teacher_materials'),
    path('materials/teacher/upload/<int:class_id>/', UploadLessonMaterialView.as_view(), name='upload_lesson_material'),
    path('materials/teacher/edit/<int:material_id>/', EditLessonMaterialView.as_view(), name='edit_lesson_material'),
    path('materials/teacher/delete/<int:material_id>/', DeleteLessonMaterialView.as_view(), name='delete_lesson_material'),

    # Student URLs for Lesson Materials
    path('materials/student/list/<int:class_id>/', ListStudentMaterialsView.as_view(), name='list_student_materials'),
    path('materials/student/download/<int:material_id>/', DownloadLessonMaterialView.as_view(), name='download_lesson_material'),
]
