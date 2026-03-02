---
config:
  layout: elk
---
erDiagram

    SuperAdmin ||--o{ School : manages

    School ||--o{ AcademicYear : defines
    School ||--o{ User : hosts
    School ||--o{ Grade : owns
    School ||--o{ FeeStructure : configures

    User ||--|| Principal : is_a
    User ||--|| Teacher : is_a
    User ||--|| Student : is_a

    Grade ||--o{ Section : contains
    Grade ||--o{ Subject : offers

    Student ||--o{ Enrollment : enrolls_in
    Grade ||--o{ Enrollment : includes
    AcademicYear ||--o{ Enrollment : tracks

    Student ||--o{ Attendance : marked_for
    AcademicYear ||--o{ Attendance : belongs_to

    Student ||--o{ FeeInvoice : billed
    FeeStructure ||--o{ FeeInvoice : generates
    AcademicYear ||--o{ FeeInvoice : applies_to

    SuperAdmin {
        string admin_id PK
        string name
        string email
        string password_hash
    }

    School {
        string school_id PK
        string name
        string location
        boolean is_active
        datetime created_at
    }

    AcademicYear {
        string year_id PK
        string school_id FK
        string label
        date start_date
        date end_date
        boolean is_current
    }

    User {
        string user_id PK
        string school_id FK
        string email
        string password_hash
        string role_enum
        datetime last_login
        boolean is_active
    }

    Principal {
        string user_id PK
        string office_no
    }

    Teacher {
        string user_id PK
        string employee_id
        string specialization
    }

    Student {
        string user_id PK
        string admission_number
        date date_of_birth
    }

    Grade {
        string class_id PK
        string school_id FK
        string grade_label
    }

    Section {
        string section_id PK
        string class_id FK
        string name
    }

    Subject {
        string subject_id PK
        string class_id FK
        string name
        string code
    }

    Enrollment {
        string enrollment_id PK
        string student_id FK
        string class_id FK
        string year_id FK
        string status
    }

    Attendance {
        string attendance_id PK
        string student_id FK
        string year_id FK
        date attendance_date
        string status
    }

    FeeStructure {
        string fee_structure_id PK
        string school_id FK
        string class_id FK
        decimal amount
        string frequency
    }

    FeeInvoice {
        string invoice_id PK
        string student_id FK
        string fee_structure_id FK
        string year_id FK
        decimal total_amount
        string payment_status
        date due_date
    }