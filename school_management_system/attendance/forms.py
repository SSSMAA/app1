from django import forms
from .models import Attendance
from academics.models import Class # Corrected import for Class
from django.forms import modelformset_factory

class SelectClassDateForm(forms.Form):
    class_instance = forms.ModelChoiceField(
        queryset=Class.objects.none(), # Will be populated in the view
        label="Select Class",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        label="Select Date"
    )

    def __init__(self, *args, **kwargs):
        teacher = kwargs.pop('teacher', None)
        super().__init__(*args, **kwargs)
        if teacher:
            self.fields['class_instance'].queryset = Class.objects.filter(teacher=teacher).order_by('name')

class AttendanceForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['student', 'class_instance', 'date', 'status', 'remarks']
        # Hide student, class_instance, and date as they will be set programmatically or are fixed per formset
        widgets = {
            'student': forms.HiddenInput(),
            'class_instance': forms.HiddenInput(),
            'date': forms.HiddenInput(),
            'status': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'remarks': forms.Textarea(attrs={'rows': 1, 'class': 'form-control form-control-sm'}),
        }

# Formset for handling multiple attendance records
# We will specify queryset and initial data in the view
AttendanceFormSet = modelformset_factory(
    Attendance,
    form=AttendanceForm,
    extra=0, # Don't show empty forms by default
    can_delete=False # We are not deleting attendance via this formset, only creating/updating
)
