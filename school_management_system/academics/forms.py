from django import forms
from .models import LessonMaterial, Class # Assuming Class is in academics.models

class LessonMaterialForm(forms.ModelForm):
    class Meta:
        model = LessonMaterial
        fields = ['title', 'description', 'file', 'class_instance'] # uploaded_by will be set in the view
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
            'class_instance': forms.Select(attrs={'class': 'form-control'}), # Will be filtered in the view
        }

    def __init__(self, *args, **kwargs):
        teacher = kwargs.pop('teacher', None)
        super().__init__(*args, **kwargs)
        if teacher:
            # Limit class_instance choices to classes taught by this teacher
            self.fields['class_instance'].queryset = Class.objects.filter(teacher=teacher).order_by('name')
        elif 'instance' in kwargs and kwargs['instance'] and kwargs['instance'].uploaded_by:
            # If editing, and an instance is provided with an uploader, filter by that uploader
            # This is a fallback, ideally 'teacher' should always be passed for consistency
             self.fields['class_instance'].queryset = Class.objects.filter(teacher=kwargs['instance'].uploaded_by).order_by('name')
        else:
            # If no teacher is provided (e.g. superuser in admin adding directly), show all classes
            # Or, more restrictively, show no classes: self.fields['class_instance'].queryset = Class.objects.none()
            self.fields['class_instance'].queryset = Class.objects.all().order_by('name')


class SelectClassForLessonsForm(forms.Form):
    class_instance = forms.ModelChoiceField(
        queryset=Class.objects.none(), # To be populated based on user (teacher or student)
        label="Select Class",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            if user.role == 'teacher':
                self.fields['class_instance'].queryset = Class.objects.filter(teacher=user).order_by('name')
                self.fields['class_instance'].label = "Select Your Class to Manage Materials"
            elif user.role == 'student':
                self.fields['class_instance'].queryset = Class.objects.filter(enrolled_students=user).order_by('name')
                self.fields['class_instance'].label = "Select Your Class to View Materials"
            else: # Admin or other roles
                 self.fields['class_instance'].queryset = Class.objects.all().order_by('name')
                 self.fields['class_instance'].label = "Select Class"
