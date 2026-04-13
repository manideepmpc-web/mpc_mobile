# Postman API Testing Guide

This guide provides the necessary details to test the backend APIs for the MPC HRMS application.

## Base URL
All API requests are relative to: `http://localhost:5000/api`

---

## 1. Authentication

Most endpoints require a JWT token in the `Authorization` header.
Format: `Bearer <YOUR_TOKEN>`

### **A. Login**
*   **Method:** `POST`
*   **Endpoint:** `/auth/login`
*   **Request Body (JSON):**
    ```json
    {
      "email": "admin@mpc.com",
      "password": "Admin@123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "data": {
        "token": "eyJhbGci...",
        "employee": { "id": 1, "name": "MPC Admin", ... }
      }
    }
    ```

### **B. Register (Admin Only)**
*   **Method:** `POST`
*   **Endpoint:** `/auth/register`
*   **Auth Required:** Yes (Admin)
*   **Request Body (JSON):**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@mpc.com",
      "password": "Password123",
      "role": "employee",
      "department_id": 2,
      "designation": "Developer"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Employee registered successfully. ID: EMP002",
      "data": { "employee_id": "EMP002" }
    }
    ```

### **C. Get Current User Profile**
*   **Method:** `GET`
*   **Endpoint:** `/auth/me`
*   **Auth Required:** Yes
*   **Response (200 OK):** Profile data for the logged-in user.

---

## 2. Attendance

### **A. Check-in**
*   **Method:** `POST`
*   **Endpoint:** `/attendance/checkin`
*   **Auth Required:** Yes
*   **Request Body (Optional JSON):**
    ```json
    {
      "latitude": 17.1234,
      "longitude": 78.1234
    }
    ```
*   **Response (201 Created):** Success message and check-in record.

### **B. Check-out**
*   **Method:** `POST`
*   **Endpoint:** `/attendance/checkout`
*   **Auth Required:** Yes
*   **Request Body (Optional JSON):**
    ```json
    {
      "latitude": 17.1235,
      "longitude": 78.1235
    }
    ```

### **C. Today's Status**
*   **Method:** `GET`
*   **Endpoint:** `/attendance/today`
*   **Auth Required:** Yes

---

## 3. Employee Management

### **A. Get All Employees (Admin)**
*   **Method:** `GET`
*   **Endpoint:** `/employees`
*   **Auth Required:** Yes (Admin)

### **B. Update Employee Profile**
*   **Method:** `PUT`
*   **Endpoint:** `/employees/:id`
*   **Auth Required:** Yes (Self or Admin)
*   **Request Body (Partial JSON):**
    ```json
    {
      "phone": "9876543210",
      "address": "123 Update Street"
    }
    ```

---

## 4. Leaves

### **A. Apply for Leave**
*   **Method:** `POST`
*   **Endpoint:** `/leaves/apply`
*   **Auth Required:** Yes
*   **Request Body (JSON):**
    ```json
    {
      "leave_type": "casual",
      "from_date": "2026-04-15",
      "to_date": "2026-04-16",
      "reason": "Personal work"
    }
    ```

### **B. Get Pending Leaves (Manager/Admin)**
*   **Method:** `GET`
*   **Endpoint:** `/leaves/pending`
*   **Auth Required:** Yes (Manager/Admin)

---

## 5. Loans

### **A. Create Loan Record**
*   **Method:** `POST`
*   **Endpoint:** `/loans`
*   **Auth Required:** Yes
*   **Request Body (JSON):**
    ```json
    {
      "borrower_name": "Friend Name",
      "type": "given",
      "principal_amount": 5000,
      "start_date": "2026-04-10",
      "due_date": "2026-05-10",
      "interest_rate": 2.0
    }
    ```

### **B. Add Loan Payment**
*   **Method:** `POST`
*   **Endpoint:** `/loans/:id/payments`
*   **Auth Required:** Yes
*   **Request Body (JSON):**
    ```json
    {
      "amount": 1000,
      "payment_date": "2026-04-12",
      "note": "First installment"
    }
    ```

---

## 6. Real-time Location Tracking

### **A. Update Location**
*   **Method:** `POST`
*   **Endpoint:** `/location/update`
*   **Auth Required:** Yes
*   **Request Body (JSON):**
    ```json
    {
      "latitude": 17.5566,
      "longitude": 78.5566,
      "accuracy": 15
    }
    ```
