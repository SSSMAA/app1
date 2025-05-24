from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from .models import Attendance
from academics.models import Class
from users.models import User # For type hinting or direct queries if needed
from .forms import SelectClassDateForm, AttendanceFormSet, AttendanceForm # Added AttendanceForm
from django.forms import formset_factory # For a simpler formset if modelformset_factory is problematic
from django.db import transaction # For atomic operations

# Permission helpers (can be moved to a central place like users.views or a dedicated permissions.py)
def is_teacher(user):
    return user.is_authenticated and user.role == 'teacher'

def is_student(user):
    return user.is_authenticated and user.role == 'student'

class SelectClassDateView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'attendance/select_class_date_for_attendance.html'

    def test_func(self):
        return is_teacher(self.request.user)

    def get(self, request, *args, **kwargs):
        form = SelectClassDateForm(teacher=request.user)
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = SelectClassDateForm(request.POST, teacher=request.user)
        if form.is_valid():
            class_instance_id = form.cleaned_data['class_instance'].id
            date = form.cleaned_data['date'].isoformat() # Convert date to string for URL
            return redirect(reverse('mark_attendance', kwargs={'class_id': class_instance_id, 'date': date}))
        return render(request, self.template_name, {'form': form})


class MarkAttendanceView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'attendance/mark_attendance.html'

    def test_func(self):
        if not is_teacher(self.request.user):
            return False
        class_id = self.kwargs.get('class_id')
        if class_id:
            class_instance = get_object_or_404(Class, id=class_id)
            return class_instance.teacher == self.request.user
        return False

    def get(self, request, class_id, date, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        students = class_instance.enrolled_students.all().order_by('last_name', 'first_name')
        
        initial_data_for_formset = []
        for student in students:
            attendance_obj, created = Attendance.objects.get_or_create(
                student=student,
                class_instance=class_instance,
                date=date,
                defaults={'status': 'Present'} # Default to 'Present' if new
            )
            initial_data_for_formset.append({
                'id': attendance_obj.id, # Important for updates
                'student': student.id, 
                'class_instance': class_instance.id, 
                'date': date,
                'status': attendance_obj.status,
                'remarks': attendance_obj.remarks
            })
        
        # Use the initial data with the formset
        formset = AttendanceFormSet(initial=initial_data_for_formset, queryset=Attendance.objects.none())
        
        # Pair forms with student names for easier template rendering
        student_forms = []
        for i, student in enumerate(students):
            student_name = f"{student.first_name} {student.last_name} ({student.username})"
            # Ensure we don't go out of bounds if formset.forms is shorter (e.g. extra=0 and no initial)
            if i < len(formset.forms):
                 student_forms.append({'student_name': student_name, 'form': formset.forms[i]})
            else: # Should not happen if initial data is correctly populated for all students
                 # This case might occur if len(initial_data_for_formset) != len(students)
                 # Or if formset factory behaves unexpectedly with 'extra=0' and initial data.
                 # For safety, create a blank form for any remaining students.
                 # This part needs careful testing.
                 temp_form = AttendanceForm(initial={
                     'student': student.id, 
                     'class_instance': class_instance.id, 
                     'date': date,
                     'status': 'Present' # Default
                 })
                 student_forms.append({'student_name': student_name, 'form': temp_form})


        context = {
            'class_instance': class_instance,
            'date': date,
            'formset': formset, # Pass the formset itself
            'student_forms': student_forms, # Pass the paired list
            'students_count': students.count()
        }
        return render(request, self.template_name, context)

    @transaction.atomic
    def post(self, request, class_id, date, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        formset = AttendanceFormSet(request.POST)

        if formset.is_valid():
            for form in formset.cleaned_data: # Iterate over each form's cleaned_data
                if not form: # Can happen if a form in the formset was empty and not submitted
                    continue
                
                student_id = form.get('student') # student is a ModelChoiceField in the form
                status = form.get('status')
                remarks = form.get('remarks', '') # Get remarks, default to empty string

                if not student_id:
                    messages.error(request, "Error: Student ID missing in one of the forms.")
                    # Re-render form with error, need to reconstruct context
                    # This part is complex, ideally form validation should catch this.
                    # For now, redirecting to GET.
                    return redirect(request.path) 

                student = User.objects.get(id=student_id.id) # Get the User instance

                # Update or create attendance record
                Attendance.objects.update_or_create(
                    student=student,
                    class_instance=class_instance,
                    date=date,
                    defaults={'status': status, 'remarks': remarks}
                )
            
            messages.success(request, f"Attendance for {class_instance.name} on {date} saved successfully.")
            return redirect(reverse('select_class_date_attendance'))
        else:
            # If formset is not valid, re-render with errors
            students = class_instance.enrolled_students.all().order_by('last_name', 'first_name')
            student_forms = []
            # It's important to align forms with students correctly, even with errors.
            # formset.forms will contain the forms with their submitted data and errors.
            for i, student in enumerate(students):
                student_name = f"{student.first_name} {student.last_name} ({student.username})"
                if i < len(formset.forms):
                    student_forms.append({'student_name': student_name, 'form': formset.forms[i]})
                # This else case for safety, though ideally len(formset.forms) == len(students)
                # if handling initial data correctly.

            context = {
                'class_instance': class_instance,
                'date': date,
                'formset': formset, # Pass the formset with errors
                'student_forms': student_forms,
                'students_count': students.count()
            }
            messages.error(request, "Please correct the errors below.")
            return render(request, self.template_name, context)


class StudentAttendanceView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'attendance/view_student_attendance.html'

    def test_func(self):
        return is_student(self.request.user)

    def get(self, request, *args, **kwargs):
        attendance_records = Attendance.objects.filter(student=request.user).select_related('class_instance', 'class_instance__subject').order_by('-date', 'class_instance__name')
        
        context = {
            'attendance_records': attendance_records,
        }
        return render(request, self.template_name, context)
