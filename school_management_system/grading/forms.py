from django import forms
from .models import Grade
from academics.models import Class # Corrected import for Class

class SelectClassAssessmentForm(forms.Form):
    class_instance = forms.ModelChoiceField(
        queryset=Class.objects.none(), # Will be populated in the view by teacher
        label="Select Class",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    # Allow teacher to select an existing assessment or create a new one
    assessment_name_existing = forms.ChoiceField(
        label="Existing Assessment (Optional)",
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    assessment_name_new = forms.CharField(
        label="Or New Assessment Name",
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., Midterm Exam'})
    )

    def __init__(self, *args, **kwargs):
        teacher = kwargs.pop('teacher', None)
        class_instance = kwargs.pop('class_instance', None) # For populating existing assessments
        super().__init__(*args, **kwargs)
        if teacher:
            self.fields['class_instance'].queryset = Class.objects.filter(teacher=teacher).order_by('name')
        
        if class_instance:
            # Populate existing assessment names for the selected class
            existing_assessments = Grade.objects.filter(class_instance=class_instance)\
                                                .values_list('assessment_name', flat=True)\
                                                .distinct()\
                                                .order_by('assessment_name')
            assessment_choices = [('', '---------')] + [(name, name) for name in existing_assessments]
            self.fields['assessment_name_existing'].choices = assessment_choices
        else:
            self.fields['assessment_name_existing'].choices = [('', '---------')]


    def clean(self):
        cleaned_data = super().clean()
        existing_assessment = cleaned_data.get('assessment_name_existing')
        new_assessment = cleaned_data.get('assessment_name_new')

        if not existing_assessment and not new_assessment:
            raise forms.ValidationError("You must select an existing assessment or provide a new assessment name.")
        if existing_assessment and new_assessment:
            raise forms.ValidationError("Please select an existing assessment OR enter a new one, not both.")
        
        # Determine the final assessment name
        if new_assessment:
            cleaned_data['assessment_name'] = new_assessment
        elif existing_assessment:
            cleaned_data['assessment_name'] = existing_assessment
        
        return cleaned_data

class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = ['student', 'class_instance', 'assessment_name', 'grade', 'comments']
        widgets = {
            'student': forms.HiddenInput(),
            'class_instance': forms.HiddenInput(),
            'assessment_name': forms.HiddenInput(),
            'grade': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'comments': forms.Textarea(attrs={'rows': 1, 'class': 'form-control form-control-sm'}),
        }

# Formset for handling multiple grade records
GradeFormSet = forms.modelformset_factory(
    Grade,
    form=GradeForm,
    extra=0, # Don't show empty forms by default
    can_delete=False 
)
