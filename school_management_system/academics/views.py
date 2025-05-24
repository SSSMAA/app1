from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from django.http import HttpResponseForbidden, FileResponse # For file download
import os # For file download path construction

from .models import Class, LessonMaterial
from .forms import LessonMaterialForm, SelectClassForLessonsForm
from users.models import User # For type hinting and permission checks

# Permission helpers (can be shared or defined per app as needed)
def is_teacher(user):
    return user.is_authenticated and user.role == 'teacher'

def is_student(user):
    return user.is_authenticated and user.role == 'student'

class SelectClassForMaterialsView(LoginRequiredMixin, View):
    """
    A view for both teachers and students to select a class.
    Teachers will be redirected to manage/upload materials for that class.
    Students will be redirected to view materials for that class.
    """
    template_name = 'academics/select_class_for_lessons.html'
    form_class = SelectClassForLessonsForm

    def get(self, request, *args, **kwargs):
        form = self.form_class(user=request.user)
        return render(request, self.template_name, {'form': form, 'user_role': request.user.role})

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, user=request.user)
        if form.is_valid():
            class_instance = form.cleaned_data['class_instance']
            if request.user.role == 'teacher':
                return redirect(reverse('list_teacher_materials', kwargs={'class_id': class_instance.id}))
            elif request.user.role == 'student':
                return redirect(reverse('list_student_materials', kwargs={'class_id': class_instance.id}))
            else:
                messages.error(request, "Your role does not have a designated materials page.")
                return redirect('home') 
        return render(request, self.template_name, {'form': form, 'user_role': request.user.role})


class UploadLessonMaterialView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'academics/upload_lesson_material.html'
    form_class = LessonMaterialForm

    def test_func(self):
        if not is_teacher(self.request.user):
            return False
        class_id = self.kwargs.get('class_id')
        if class_id: # Ensure teacher is assigned to this class
            class_instance = get_object_or_404(Class, id=class_id)
            return class_instance.teacher == self.request.user
        return False # Must provide class_id to upload material

    def get(self, request, class_id, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        form = self.form_class(teacher=request.user, initial={'class_instance': class_instance})
        form.fields['class_instance'].queryset = Class.objects.filter(id=class_instance.id)
        form.fields['class_instance'].initial = class_instance
        form.fields['class_instance'].disabled = True # Class is fixed by URL
        return render(request, self.template_name, {'form': form, 'class_instance': class_instance})

    def post(self, request, class_id, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        # Initialize form with POST data, FILES data, and limit class_instance choices for the teacher
        form = self.form_class(request.POST, request.FILES, teacher=request.user)
        
        # Since class_instance is disabled, it won't be in request.POST.
        # We need to ensure the model instance gets it before validation/saving.
        if form.is_valid():
            material = form.save(commit=False)
            material.uploaded_by = request.user
            material.class_instance = class_instance # Set class_instance from URL
            material.save()
            messages.success(request, f"Material '{material.title}' uploaded successfully for {class_instance.name}.")
            return redirect(reverse('list_teacher_materials', kwargs={'class_id': class_instance.id}))
        else:
            # If form is invalid, we need to re-initialize the class_instance field for the template
            form.fields['class_instance'].queryset = Class.objects.filter(id=class_instance.id)
            form.fields['class_instance'].initial = class_instance
            form.fields['class_instance'].disabled = True
            messages.error(request, "Please correct the errors below.")
            return render(request, self.template_name, {'form': form, 'class_instance': class_instance})


class ListTeacherMaterialsView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'academics/list_teacher_materials.html'

    def test_func(self):
        if not is_teacher(self.request.user): return False
        class_id = self.kwargs.get('class_id')
        class_instance = get_object_or_404(Class, id=class_id)
        return class_instance.teacher == self.request.user 

    def get(self, request, class_id, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id, teacher=request.user)
        materials = LessonMaterial.objects.filter(class_instance=class_instance, uploaded_by=request.user).order_by('-upload_date')
        return render(request, self.template_name, {'materials': materials, 'class_instance': class_instance})


class EditLessonMaterialView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'academics/edit_lesson_material.html' 
    form_class = LessonMaterialForm

    def test_func(self):
        if not is_teacher(self.request.user): return False
        material_id = self.kwargs.get('material_id')
        material = get_object_or_404(LessonMaterial, id=material_id)
        return material.uploaded_by == self.request.user and material.class_instance.teacher == self.request.user

    def get(self, request, material_id, *args, **kwargs):
        material = get_object_or_404(LessonMaterial, id=material_id, uploaded_by=request.user)
        form = self.form_class(instance=material, teacher=request.user)
        form.fields['class_instance'].queryset = Class.objects.filter(id=material.class_instance.id)
        form.fields['class_instance'].initial = material.class_instance
        form.fields['class_instance'].disabled = True # Class cannot be changed during edit
        return render(request, self.template_name, {'form': form, 'material': material, 'class_instance': material.class_instance})

    def post(self, request, material_id, *args, **kwargs):
        material = get_object_or_404(LessonMaterial, id=material_id, uploaded_by=request.user)
        form = self.form_class(request.POST, request.FILES, instance=material, teacher=request.user)
        
        if form.is_valid():
            updated_material = form.save(commit=False)
            # Ensure fixed fields are not changed
            updated_material.uploaded_by = request.user 
            updated_material.class_instance = material.class_instance 
            updated_material.save()
            messages.success(request, f"Material '{updated_material.title}' updated successfully.")
            return redirect(reverse('list_teacher_materials', kwargs={'class_id': material.class_instance.id}))
        else:
            form.fields['class_instance'].queryset = Class.objects.filter(id=material.class_instance.id)
            form.fields['class_instance'].initial = material.class_instance
            form.fields['class_instance'].disabled = True
            messages.error(request, "Please correct the errors below.")
            return render(request, self.template_name, {'form': form, 'material': material, 'class_instance': material.class_instance})


class DeleteLessonMaterialView(LoginRequiredMixin, UserPassesTestMixin, View):
    def test_func(self):
        if not is_teacher(self.request.user): return False
        material_id = self.kwargs.get('material_id')
        material = get_object_or_404(LessonMaterial, id=material_id)
        return material.uploaded_by == self.request.user

    def post(self, request, material_id, *args, **kwargs):
        material = get_object_or_404(LessonMaterial, id=material_id, uploaded_by=request.user)
        class_id_of_material = material.class_instance.id # Save for redirect
        
        # Attempt to delete the file from storage
        try:
            if material.file and os.path.exists(material.file.path):
                os.remove(material.file.path)
        except Exception as e:
            messages.warning(request, f"Could not delete the file for '{material.title}'. Error: {e}")
            # Decide if you want to proceed with deleting the DB record even if file deletion fails
        
        material_title = material.title # Save for message
        material.delete()
        messages.success(request, f"Material '{material_title}' deleted successfully.")
        return redirect(reverse('list_teacher_materials', kwargs={'class_id': class_id_of_material}))


class ListStudentMaterialsView(LoginRequiredMixin, UserPassesTestMixin, View):
    template_name = 'academics/list_student_materials.html'

    def test_func(self):
        if not is_student(self.request.user): return False
        class_id = self.kwargs.get('class_id')
        class_instance = get_object_or_404(Class, id=class_id)
        return class_instance.enrolled_students.filter(id=self.request.user.id).exists()

    def get(self, request, class_id, *args, **kwargs):
        class_instance = get_object_or_404(Class, id=class_id)
        if not class_instance.enrolled_students.filter(id=request.user.id).exists():
            return HttpResponseForbidden("You are not enrolled in this class.")
            
        materials = LessonMaterial.objects.filter(class_instance=class_instance).order_by('-upload_date')
        return render(request, self.template_name, {'materials': materials, 'class_instance': class_instance})

class DownloadLessonMaterialView(LoginRequiredMixin, UserPassesTestMixin, View):
    def test_func(self):
        if not (is_student(self.request.user) or is_teacher(self.request.user)):
            return False
        
        material_id = self.kwargs.get('material_id')
        material = get_object_or_404(LessonMaterial, id=material_id)
        class_instance = material.class_instance

        if is_student(self.request.user):
            return class_instance.enrolled_students.filter(id=self.request.user.id).exists()
        elif is_teacher(self.request.user): # Teacher of the class or uploader
            return class_instance.teacher == self.request.user or material.uploaded_by == self.request.user
        return False

    def get(self, request, material_id, *args, **kwargs):
        material = get_object_or_404(LessonMaterial, id=material_id)
        try:
            file_path = material.file.path
            # FileResponse is good for large files as it streams them.
            # Ensure the file is opened in binary mode ('rb').
            response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename=os.path.basename(file_path))
            return response
        except FileNotFoundError:
            messages.error(request, "File not found. It might have been moved or deleted from the server.")
            # Redirect to a relevant page. HTTP_REFERER can be unreliable.
            # A safer redirect might be to the class materials list.
            if request.user.role == 'student':
                 return redirect(reverse('list_student_materials', kwargs={'class_id': material.class_instance.id}))
            elif request.user.role == 'teacher':
                 return redirect(reverse('list_teacher_materials', kwargs={'class_id': material.class_instance.id}))
            else:
                 return redirect('home') # Fallback
        except Exception as e:
            messages.error(request, f"An error occurred while trying to download the file: {e}")
            if request.user.role == 'student':
                 return redirect(reverse('list_student_materials', kwargs={'class_id': material.class_instance.id}))
            elif request.user.role == 'teacher':
                 return redirect(reverse('list_teacher_materials', kwargs={'class_id': material.class_instance.id}))
            else:
                 return redirect('home') # Fallback
