from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login
from .forms import TeacherRegistrationForm, StudentRegistrationForm, StudentProfileForm, TeacherProfileForm # Import all forms
from .models import User
from django.contrib import messages # For success messages

class TeacherRegistrationView(CreateView):
    model = User
    form_class = TeacherRegistrationForm
    template_name = 'users/register_teacher.html'
    success_url = reverse_lazy('login') # Redirect to login page after successful registration

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect(self.success_url)

class StudentRegistrationView(CreateView):
    model = User
    form_class = StudentRegistrationForm
    template_name = 'users/register_student.html'
    success_url = reverse_lazy('login') # Redirect to login page after successful registration

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect(self.success_url)

class UserLoginView(LoginView):
    template_name = 'users/login.html'
    redirect_authenticated_user = True # Redirect if user is already authenticated
    success_url = reverse_lazy('home') # Redirect to a home page (to be created later)

# For LogoutView, we can use the default implementation or customize if needed.
# For simplicity, we'll use the default LogoutView and just define a success_url.
# The actual logout link in a template would point to the URL named 'logout'.
# No explicit view class needed here if using default behavior mostly.
# However, if you need to override get_next_page or other methods, you would.

def home_view(request):
    # A simple home page view to redirect to after login
    # This should be replaced with a more meaningful home page later.
    return render(request, 'users/home.html')

# Permissions
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, DetailView
from django.views.generic.edit import UpdateView


def is_student(user):
    return user.is_authenticated and user.role == 'student'

def is_teacher_or_admin(user):
    return user.is_authenticated and (user.role == 'teacher' or user.role == 'admin')

# Student Profile View (for Students)
class StudentProfileView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = User
    template_name = 'users/student_profile.html'
    context_object_name = 'profile'

    def test_func(self):
        return is_student(self.request.user)

    def get_object(self, queryset=None):
        return self.request.user # Student views their own profile

# Student Profile Edit (for Students)
class StudentProfileEditView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = User
    form_class = StudentProfileForm
    template_name = 'users/student_profile_edit.html'
    success_url = reverse_lazy('student_profile') # Redirect to profile view after edit

    def test_func(self):
        return is_student(self.request.user)

    def get_object(self, queryset=None):
        return self.request.user # Student edits their own profile

    def form_valid(self, form):
        messages.success(self.request, 'Profile updated successfully!')
        return super().form_valid(form)

# Student List View (for Admins/Teachers)
class StudentListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = User
    template_name = 'users/student_list.html'
    context_object_name = 'students'

    def test_func(self):
        return is_teacher_or_admin(self.request.user)

    def get_queryset(self):
        return User.objects.filter(role='student').order_by('last_name', 'first_name')

# Student Detail View (for Admins/Teachers)
class StudentDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = User
    template_name = 'users/student_detail.html'
    context_object_name = 'student' # Use 'student' to avoid clash with 'user' in template
    pk_url_kwarg = 'student_id' # To match the URL pattern

    def test_func(self):
        return is_teacher_or_admin(self.request.user)

    def get_queryset(self):
        # Ensure that only students can be viewed through this detail view by admins/teachers
        return User.objects.filter(role='student')

# Teacher specific views

def is_teacher(user):
    return user.is_authenticated and user.role == 'teacher'

def is_admin(user):
    return user.is_authenticated and user.role == 'admin'

# Teacher Profile View (for Teachers)
class TeacherProfileView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = User
    template_name = 'users/teacher_profile.html'
    context_object_name = 'profile'

    def test_func(self):
        return is_teacher(self.request.user)

    def get_object(self, queryset=None):
        return self.request.user # Teacher views their own profile

# Teacher Profile Edit (for Teachers)
class TeacherProfileEditView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = User
    form_class = TeacherProfileForm # Use TeacherProfileForm
    template_name = 'users/teacher_profile_edit.html'
    success_url = reverse_lazy('teacher_profile') # Redirect to teacher profile view

    def test_func(self):
        return is_teacher(self.request.user)

    def get_object(self, queryset=None):
        return self.request.user # Teacher edits their own profile

    def form_valid(self, form):
        messages.success(self.request, 'Profile updated successfully!')
        return super().form_valid(form)

# Teacher List View (for Admins)
class TeacherListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = User
    template_name = 'users/teacher_list.html'
    context_object_name = 'teachers'

    def test_func(self):
        return is_admin(self.request.user)

    def get_queryset(self):
        return User.objects.filter(role='teacher').order_by('last_name', 'first_name')

# Teacher Detail View (for Admins)
class TeacherDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = User
    template_name = 'users/teacher_detail.html'
    context_object_name = 'teacher' # Use 'teacher' to avoid clash with 'user'
    pk_url_kwarg = 'teacher_id' # To match the URL pattern

    def test_func(self):
        return is_admin(self.request.user)

    def get_queryset(self):
        # Ensure that only teachers can be viewed through this detail view by admins
        return User.objects.filter(role='teacher')
