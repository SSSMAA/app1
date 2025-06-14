from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from academics.models import Subject, Class
from .models import Grade

User = get_user_model()

class TestGradeModel(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='gradestudent', password='password123', role='student')
        self.teacher = User.objects.create_user(username='gradeteacher', password='password123', role='teacher')
        self.subject = Subject.objects.create(name="GradingSubject")
        self.class_instance = Class.objects.create(
            name="Grading Class",
            subject=self.subject,
            teacher=self.teacher,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=30)
        )
        self.class_instance.enrolled_students.add(self.student)

    def test_create_grade_record(self):
        grade_record = Grade.objects.create(
            student=self.student,
            class_instance=self.class_instance,
            assessment_name="Midterm Exam",
            grade="A+"
        )
        self.assertEqual(grade_record.student, self.student)
        self.assertEqual(grade_record.class_instance, self.class_instance)
        self.assertEqual(grade_record.assessment_name, "Midterm Exam")
        self.assertEqual(grade_record.grade, "A+")
        self.assertIsNotNone(grade_record.date_recorded)
        self.assertEqual(str(grade_record), f"{self.student.username} - {self.class_instance.name} - Midterm Exam - A+")

    def test_grade_unique_together_constraint(self):
        Grade.objects.create(
            student=self.student,
            class_instance=self.class_instance,
            assessment_name="Final Project",
            grade="B"
        )
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Grade.objects.create(
                student=self.student,
                class_instance=self.class_instance,
                assessment_name="Final Project", # Same student, class, and assessment
                grade="C"
            )
