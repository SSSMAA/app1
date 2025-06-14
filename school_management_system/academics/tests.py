from django.test import TestCase
from .models import Subject, Class, LessonMaterial, Schedule
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class TestSubjectModel(TestCase):
    def test_create_subject(self):
        subject = Subject.objects.create(name="Mathematics", description="Study of numbers, quantity, space, structure, and change.")
        self.assertEqual(subject.name, "Mathematics")
        self.assertEqual(subject.description, "Study of numbers, quantity, space, structure, and change.")
        self.assertEqual(str(subject), "Mathematics")

class TestClassModel(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='classteacher', password='password123', role='teacher')
        self.subject = Subject.objects.create(name="Science")
        self.start_date = timezone.now().date()
        self.end_date = self.start_date + timedelta(days=90)

    def test_create_class(self):
        class_instance = Class.objects.create(
            name="Grade 10 Science",
            subject=self.subject,
            teacher=self.teacher,
            start_date=self.start_date,
            end_date=self.end_date
        )
        self.assertEqual(class_instance.name, "Grade 10 Science")
        self.assertEqual(class_instance.subject, self.subject)
        self.assertEqual(class_instance.teacher, self.teacher)
        self.assertEqual(str(class_instance), f"Grade 10 Science (Science - {self.teacher.username})")

    def test_class_enroll_student(self):
        student = User.objects.create_user(username='enrollstudent', password='password123', role='student')
        class_instance = Class.objects.create(
            name="History 101",
            subject=self.subject, # Reusing science subject for simplicity
            teacher=self.teacher,
            start_date=self.start_date,
            end_date=self.end_date
        )
        class_instance.enrolled_students.add(student)
        self.assertIn(student, class_instance.enrolled_students.all())

class TestLessonMaterialModel(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='lessonteacher', password='password123', role='teacher')
        self.subject = Subject.objects.create(name="Physics")
        self.start_date = timezone.now().date()
        self.end_date = self.start_date + timedelta(days=90)
        self.class_instance = Class.objects.create(
            name="Physics Class",
            subject=self.subject,
            teacher=self.teacher,
            start_date=self.start_date,
            end_date=self.end_date
        )

    def test_create_lesson_material(self):
        material = LessonMaterial.objects.create(
            class_instance=self.class_instance,
            title="Introduction to Mechanics",
            description="Basic concepts of Newtonian mechanics.",
            uploaded_by=self.teacher
            # file field can be omitted if blank=True, null=True or tested separately
        )
        self.assertEqual(material.title, "Introduction to Mechanics")
        self.assertEqual(material.class_instance, self.class_instance)
        self.assertEqual(material.uploaded_by, self.teacher)
        self.assertEqual(str(material), f"{self.class_instance.name} - Introduction to Mechanics")

class TestScheduleModel(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(username='scheduleteacher', password='password123', role='teacher')
        self.subject = Subject.objects.create(name="Chemistry")
        self.start_date = timezone.now().date()
        self.end_date = self.start_date + timedelta(days=90)
        self.class_instance = Class.objects.create(
            name="Chemistry Lab",
            subject=self.subject,
            teacher=self.teacher,
            start_date=self.start_date,
            end_date=self.end_date
        )

    def test_create_schedule(self):
        from datetime import time
        schedule = Schedule.objects.create(
            class_instance=self.class_instance,
            day_of_week='MON',
            start_time=time(9, 0, 0), # Use datetime.time
            end_time=time(10, 30, 0), # Use datetime.time
            room_number='Lab 101'
        )
        self.assertEqual(schedule.day_of_week, 'MON')
        self.assertEqual(schedule.room_number, 'Lab 101')
        self.assertEqual(str(schedule), f"{self.class_instance.name} - Monday at 09:00")

# Consider adding tests for Attendance and Grade models in their respective apps' test files.
