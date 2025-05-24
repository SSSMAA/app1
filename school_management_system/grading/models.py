from django.db import models
from django.conf import settings
from academics.models import Class # Assuming Class model is in academics.models

class Grade(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'},
        related_name='grades'
    )
    class_instance = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='grades_for_class'
    )
    assessment_name = models.CharField(max_length=150)
    grade = models.CharField(max_length=20) # e.g., "A+", "85%", "Pass", "4.0"
    date_recorded = models.DateField(auto_now_add=True)
    comments = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.class_instance.name} - {self.assessment_name} - {self.grade}"

    class Meta:
        unique_together = ('student', 'class_instance', 'assessment_name')
        ordering = ['-date_recorded', 'class_instance__name', 'assessment_name']
