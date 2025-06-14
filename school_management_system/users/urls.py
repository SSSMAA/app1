from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import (
    TeacherRegistrationView, StudentRegistrationView, UserLoginView, home_view,
    StudentProfileView, StudentProfileEditView, StudentListView, StudentDetailView,
    TeacherProfileView, TeacherProfileEditView, TeacherListView, TeacherDetailView,
    AdminDashboardView, TeacherDashboardView, StudentDashboardView # Added Dashboard Views
)

urlpatterns = [
    # Original Auth and Profile URLs
    path('register/teacher/', TeacherRegistrationView.as_view(), name='register_teacher'),
    path('register/student/', StudentRegistrationView.as_view(), name='register_student'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),

    # Home/Dispatch view - this is the main landing after login
    path('home/', home_view, name='home'),

    # Role-based Dashboards
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('dashboard/teacher/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('dashboard/student/', StudentDashboardView.as_view(), name='student_dashboard'),

    # Student profile URLs
    path('profile/', StudentProfileView.as_view(), name='student_profile'),
    path('profile/edit/', StudentProfileEditView.as_view(), name='student_profile_edit'),

    # Admin/Teacher views for students
    path('manage/students/', StudentListView.as_view(), name='student_list'),
    path('manage/student/<int:student_id>/', StudentDetailView.as_view(), name='student_detail'),

    # Teacher profile URLs (for teachers)
    path('teacher/profile/', TeacherProfileView.as_view(), name='teacher_profile'),
    path('teacher/profile/edit/', TeacherProfileEditView.as_view(), name='teacher_profile_edit'),

    # Admin views for teachers
    path('admin/teachers/', TeacherListView.as_view(), name='teacher_list'),
    path('admin/teacher/<int:teacher_id>/', TeacherDetailView.as_view(), name='teacher_detail'),
]
