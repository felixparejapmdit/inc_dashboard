# INC Dashboard

A comprehensive dashboard application for managing personnel, enrollment, and reporting within the organization.

## Project Overview

The INC Dashboard is designed to streamline administrative tasks, specifically focusing on personnel management, enrollment processes, and data reporting. It provides a robust interface for handling complex data structures such as family backgrounds, educational history, and church-related information.

## Key Features

### 📝 Enrollment System
The core of the application is the multi-step Enrollment Form, designed to capture detailed personnel information:
- **Step 1: Personal Information** - Basic details, church registration, and baptism data.
- **Step 4: Parents Information** - Detailed records for father and mother.
- **Step 5: Siblings Information** - Comprehensive list of siblings.
- **Step 6: Spouse Information** - Details for married personnel.
- **Step 7: Children Information** - Records of children.
- **Progress Tracking**: A dynamic `StepProgressTracker` is integrated across all steps. It visualizes the completion percentage based on the number of required fields filled, supporting complex array-based data (multiple siblings, children, etc.).

### 👥 User Management
- **Role-Based Access Control**: Supports multiple roles including `Admin`, `Team Leader`, `User`, and the newly added `Encoder` role.
- **User Administration**: Create, edit, and manage user accounts and permissions.
- **Student Roles**: Specialized handling for segregated student roles (`student_plenary`, `student_production`).

### 📊 Reporting & Analytics
- **Summary Reports**: Generate and view summarized data reports.
- **Personnel Statistics**: View real-time statistics on active personnel and user accounts.

### 🏢 Organization Management
- **District & Congregation Management**: Tools to manage the structural hierarchy of districts and local congregations.

## Technology Stack

- **Frontend**: React.js
- **UI Framework**: Chakra UI (for components and styling), Framer Motion (for animations)
- **Routing**: React Router DOM
- **Backend**: Node.js / Express (implied)
- **State Management**: React Hooks (useState, useEffect, useContext)

## Getting Started

### Prerequisites
- Node.js installed on your local machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd inc_dashboard
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Deployment

The project includes automated scripts for both local development and production deployment.

### 🏠 Local Deployment
To run the application locally using Docker:

1.  Ensure Docker and Docker Compose are installed.
2.  Run the deployment script:
    ```bash
    ./deploy_local.sh
    ```
    This script will:
    - Sync `.env.docker` to `.env`.
    - Stop and remove existing containers.
    - Clean up unused Docker resources.
    - Build and start the services using `docker-compose.yml`.

    **Access:**
    - App: [http://localhost:8081](http://localhost:8081)

### 🚀 Production Deployment
To deploy the application to the production server (Proxmox):

1.  Ensure you have access to the server environment.
2.  Run the production deployment script:
    ```bash
    ./deploy_prod.sh
    ```
    This script will:
    - Sync `.env.docker` to `.env`.
    - Stop existing containers using `docker-compose.prod.yml`.
    - Perform a deep clean of Docker resources.
    - Build and start the production services.
    - Display the status and recent backend logs.

    **Access:**
    - Dashboard: [https://test-portal.pmdmc.net](https://test-portal.pmdmc.net)
    - API: [https://test-api-portal.pmdmc.net](https://test-api-portal.pmdmc.net)

## Recent Updates

- **Enrollment Form Enhancement**:
    - Integrated `StepProgressTracker` for Steps 4-7.
    - Implemented robust handling for array-based data (Parents, Siblings, Spouses, Children) to ensure accurate progress calculation.
    - Resolved data persistence issues in Step 4 by optimizing state updates and API feedback loops.
- **Bug Fixes**:
    - Fixed "reduce is not a function" errors by implementing defensive coding for family data arrays.
    - Corrected functional state update patterns in `EnrollmentForm.js`.
