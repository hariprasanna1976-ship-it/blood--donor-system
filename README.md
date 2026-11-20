
🩸 Smart Blood Donation and Coordination System

1. Project Overview

The Smart Blood Donation and Coordination System is a web-based application designed to connect blood donors, hospitals, and people in need of blood. It helps coordinate blood requests and donor availability efficiently.

2. Problem Statement

Finding suitable blood donors during emergencies can be difficult and time-consuming. Traditional methods of searching for donors lack centralized coordination and real-time information.

3. Objectives

- Connect blood donors with people who need blood.
- Simplify donor registration.
- Search for donors based on blood groups.
- Manage blood requests efficiently.
- Improve communication between donors and hospitals.

4. Main Features

- User Login
- Donor Registration
- Blood Donor Search
- Blood Request Management
- Donation History
- Donor Management
- Hospital Coordination

5. Technologies Used

- Frontend: Next.js, React, TypeScript
- Styling: CSS
- Backend: Next.js API Routes
- Database: Prisma ORM with SQLite (verify your actual database configuration)

6. Project Structure

- "src/app/" – Application pages and API routes
- "src/components/" – Reusable UI components
- "src/lib/" – Application utilities and libraries
- "prisma/" – Database schema and configuration
- "public/" – Static assets

7. Installation and Execution

Clone the repository:

git clone https://github.com/hariprasanna1976-ship-it/blood--donor-system.git

Navigate to the project folder:

cd blood--donor-system

Install dependencies:

npm install

Start the development server:

npm run dev

Open your browser:

http://localhost:3000

8. Future Enhancements

- Email notifications
- Location-based donor search
- Emergency blood request alerts
- Improved hospital coordination

9. Conclusion
10. flowchart LR
    Donor((Donor))
    Hospital((Hospital))
    User((User))

    subgraph System[Blood Donation System]
        A[Login]
        B[Register Donor]
        C[Search Blood Donors]
        D[Create Blood Request]
        E[View Donation History]
        F[Manage Donors]
    end

    Donor --> A
    Donor --> B
    Donor --> C
    Donor --> E
    Hospital --> A
    Hospital --> D
    Hospital --> C
    User --> A
    User --> C

The Smart Blood Donation and Coordination System aims to make blood donation coordination easier, faster, and more accessible through a centralized web application.
