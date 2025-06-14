# School Management System - 314.ma

## Overview

The School Management System is a comprehensive web application designed to streamline various administrative and academic processes within an educational institution. It provides a centralized platform for managing users (admins, teachers, students), academic structures (classes, subjects), student performance (attendance, grades), and internal communication.

## Features

The system includes the following core modules:

*   **User Roles & Authentication**: Secure registration and login for Admins, Teachers, and Students, each with distinct permissions and profile management capabilities.
*   **Student Management**: Admins and Teachers can view student profiles. Students can manage their own profiles.
*   **Teacher Management**: Admins can manage teacher profiles. Teachers can manage their own profiles.
*   **Class & Subject Management**: Admins can define subjects and classes, assign teachers to classes, and manage class schedules.
*   **Student Enrollment**: Admins/Teachers can enroll students in classes.
*   **Class Scheduling**: Define timetables for classes including days of the week, start/end times, and room numbers.
*   **Attendance Tracking**: Teachers can mark and update attendance for students in their classes. Students can view their own attendance records.
*   **Grade Recording**: Teachers can record and update grades for various assessments for students in their classes. Students can view their own grades.
*   **Lesson Planning & Material Sharing**: Teachers can upload lesson materials (documents, presentations, etc.) for their classes. Students can access and download these materials.
*   **Internal Messaging**: Users can send and receive private messages within the system, facilitating communication between admins, teachers, and students based on defined rules (e.g., teachers to students in their class, students to their teachers).

## Technology Stack

*   **Backend**: Python, Django Framework
*   **Database**: SQLite (default, suitable for development and small deployments)
*   **Frontend**: HTML, CSS (Bootstrap for basic styling via templates - implicitly used, can be expanded)

## Prerequisites

Before you begin, ensure you have the following installed:

*   Python (3.8+ recommended)
*   pip (Python package installer, usually comes with Python)
*   Git (for cloning the repository)

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone https://example.com/school_management_system.git
    ```
    *(Replace the URL with the actual repository URL when available.)*

2.  **Navigate to the project directory**:
    ```bash
    cd school_management_system
    ```

3.  **Create a virtual environment**:
    It's highly recommended to use a virtual environment to manage project dependencies.
    ```bash
    python -m venv venv
    ```

4.  **Activate the virtual environment**:
    *   On Windows:
        ```bash
        venv\Scripts\activate
        ```
    *   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
    You should see `(venv)` at the beginning of your command prompt.

5.  **Install dependencies**:
    Install all the required packages using the `requirements.txt` file.
    ```bash
    pip install -r requirements.txt
    ```
    *(This file will be generated in the project; ensure it's up-to-date.)*

6.  **Apply database migrations**:
    This command sets up your database schema.
    ```bash
    python manage.py migrate
    ```

7.  **Create a superuser account**:
    This account will have access to the Django admin panel.
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to set a username, email (optional), and password.

8.  **Run the development server**:
    ```bash
    python manage.py runserver
    ```

9.  **Access the application**:
    *   Open your web browser and go to `http://127.0.0.1:8000/` to see the application.
    *   Access the admin panel at `http://127.0.0.1:8000/admin/` and log in with your superuser credentials.

## Generating `requirements.txt`

If you add new dependencies or want to update the `requirements.txt` file based on the current state of your virtual environment, run the following command while your virtual environment is active:

```bash
pip freeze > requirements.txt
```
This ensures that other developers or deployment environments use the same package versions.

---

Happy managing!
