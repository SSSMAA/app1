from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from .models import Grade
from academics.models import Class
from users.models import User
from .forms import SelectClassAssessmentForm, GradeFormSet
from django.db import transaction

# Permission helpers
def is_teacher(user):
    return user.is_authenticated and user.role == 'teacher'

def is_student(user):
    return user.is_authenticated and user.role == 'student'

class SelectClassAssessmentView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'grading/select_class_assessment_for_grading.html'
    form_class = SelectClassAssessmentForm

    def test_func(self):
        return is_teacher(self.request.user)

    def get(self, request, *args, **kwargs):
        class_id = request.GET.get('class_instance')
        class_instance = None
        initial_form_data = {}

        if class_id:
            class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
            initial_form_data['class_instance'] = class_instance

        form = self.form_class(teacher=request.user, class_instance=class_instance, initial=initial_form_data)
        return render(request, self.template_name, {'form': form, 'selected_class': class_instance})

    def post(self, request, *args, **kwargs):
        # This view now handles a two-step process via GET parameters and specific submit button names

        # Step 1: Teacher selects a class and submits.
        if 'select_class_submit' in request.POST:
            class_id = request.POST.get('class_instance')
            if class_id:
                # Redirect to the same view (GET) with class_instance in query params
                # This will allow the form to re-initialize with assessment choices for the selected class
                return redirect(f"{reverse('select_class_assessment_grading')}?class_instance={class_id}")
            else:
                # No class selected, re-render form with error
                form = self.form_class(request.POST, teacher=request.user)
                messages.error(request, "Please select a class.")
                return render(request, self.template_name, {'form': form})

        # Step 2: Teacher has selected a class (it's in the form's hidden field or action)
        # and now submits the assessment choice.
        # The class_instance should be part of the POST data if the form was set up correctly.
        class_id_from_post = request.POST.get('class_instance')
        if not class_id_from_post:
             messages.error(request, "Class selection was lost. Please select a class again.")
             return redirect(reverse('select_class_assessment_grading'))

        class_instance = get_object_or_404(Class, id=class_id_from_post, teacher=request.user)
        form = self.form_class(request.POST, teacher=request.user, class_instance=class_instance)

        if form.is_valid():
            assessment_name = form.cleaned_data['assessment_name']
            # Proceed to record grades page
            return redirect(reverse('record_grades', kwargs={
                'class_id': class_instance.id,
                'assessment_name': assessment_name
            }))

        # Form is invalid, re-render with errors, preserving selected class for context
        return render(request, self.template_name, {'form': form, 'selected_class': class_instance})


class RecordGradesView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'grading/record_grades.html'

    def test_func(self):
        if not is_teacher(self.request.user):
            return False
        class_id = self.kwargs.get('class_id')
        if class_id:
            class_instance = get_object_or_404(Class, id=class_id)
            return class_instance.teacher == self.request.user
        return False

    def get(self, request, class_id, assessment_name, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        students = class_instance.enrolled_students.all().order_by('last_name', 'first_name')

        initial_data = []
        for student in students:
            grade_obj, created = Grade.objects.get_or_create(
                student=student,
                class_instance=class_instance,
                assessment_name=assessment_name,
                defaults={'grade': ''} # Default grade to empty
            )
            initial_data.append({
                'id': grade_obj.id,
                'student': student.id,
                'class_instance': class_instance.id,
                'assessment_name': assessment_name,
                'grade': grade_obj.grade,
                'comments': grade_obj.comments
            })

        formset = GradeFormSet(initial=initial_data, queryset=Grade.objects.none())

        student_forms = []
        for i, student in enumerate(students):
            student_name = f"{student.first_name} {student.last_name} ({student.username})"
            if i < len(formset.forms):
                student_forms.append({'student_name': student_name, 'form': formset.forms[i]})

        context = {
            'class_instance': class_instance,
            'assessment_name': assessment_name,
            'formset': formset,
            'student_forms': student_forms,
            'students_count': students.count()
        }
        return render(request, self.template_name, context)

    @transaction.atomic
    def post(self, request, class_id, assessment_name, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        formset = GradeFormSet(request.POST) # Bind POST data to the formset

        if formset.is_valid():
            for form_data_dict in formset.cleaned_data: # cleaned_data is a list of dicts
                if not form_data_dict: continue

                student_instance = form_data_dict.get('student') # This is a User instance
                grade_value = form_data_dict.get('grade')
                comments_value = form_data_dict.get('comments', '')

                # The ID of the Grade object itself, if updating
                grade_id = form_data_dict.get('id')

                if not student_instance:
                    # This should ideally be caught by form validation if student field is required
                    messages.error(request, "A student was not specified for one of the grade entries.")
                    continue # Or handle error more robustly

                Grade.objects.update_or_create(
                    student=student_instance,
                    class_instance=class_instance,
                    assessment_name=assessment_name,
                    defaults={'grade': grade_value, 'comments': comments_value}
                )

            messages.success(request, f"Grades for '{assessment_name}' in {class_instance.name} saved successfully.")
            # Redirect back to the selection page, perhaps pre-filling the class
            return redirect(reverse('select_class_assessment_grading') + f'?class_instance={class_instance.id}')
        else:
            # Formset is invalid, re-render with errors
            students = class_instance.enrolled_students.all().order_by('last_name', 'first_name')
            student_forms = []
            # formset.forms will contain the forms with their submitted data and errors.
            for i, student in enumerate(students):
                student_name = f"{student.first_name} {student.last_name} ({student.username})"
                if i < len(formset.forms): # Ensure alignment
                    student_forms.append({'student_name': student_name, 'form': formset.forms[i]})

            context = {
                'class_instance': class_instance,
                'assessment_name': assessment_name,
                'formset': formset, # Formset with errors
                'student_forms': student_forms,
                'students_count': students.count()
            }
            messages.error(request, "Please correct the errors below.")
            return render(request, self.template_name, context)


class StudentGradesView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'grading/view_student_grades.html'

    def test_func(self):
        return is_student(self.request.user)

    def get(self, request, *args, **kwargs):
        grades = Grade.objects.filter(student=request.user)\
                              .select_related('class_instance', 'class_instance__subject')\
                              .order_by('class_instance__name', '-date_recorded', 'assessment_name')

        selected_class_id = request.GET.get('class_filter')
        # Students should only be able to filter by classes they are enrolled in.
        enrolled_classes = Class.objects.filter(enrolled_students=request.user).order_by('name')

        if selected_class_id:
            # Ensure the student is actually enrolled in the class they are trying to filter by.
            if enrolled_classes.filter(id=selected_class_id).exists():
                grades = grades.filter(class_instance_id=selected_class_id)
            else:
                # Handle case where student tries to filter by a class they are not in (e.g. manipulated URL)
                messages.warning(request, "You can only filter by classes you are enrolled in.")
                selected_class_id = None # Reset filter

        context = {
            'grades': grades,
            'enrolled_classes': enrolled_classes,
            'selected_class_id': selected_class_id if selected_class_id else '' # Ensure context var is a string
        }
        return render(request, self.template_name, context)
