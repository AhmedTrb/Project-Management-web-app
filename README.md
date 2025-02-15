# Project-Management-web-app

This project is a task management and visualization tool designed to help users create, organize, and manage tasks within a project. 
The tool leverages a visual graph-based representation to display task dependencies.

*** 
### Insipiration :
This project was inspired by a university course on Graph Theory, where I explored topological sorting to determine task degrees and optimize project visualization. Currently, I use topological sorting in this project to:

- Calculate the degree of each task based on its dependencies.
- Determine the positioning of tasks in the graph view.
- Improve the visualization of task dependencies for better project planning. 



*** 

![image](https://github.com/user-attachments/assets/9bea527e-4672-427b-b1a6-728c58dc1e7d)


[VIDEO DEMO](https://drive.google.com/file/d/1psJ0-kM9dSsjbwhorV3Kbu-Qhh6OpEc1/view?usp=sharing)
*** 
### Overview : 
Prerequisites :
Node.js (v16+ recommended)
PostgreSQL  (configured in .env file)
Prisma ORM

- [Features](#1-features)
- [Project Structure](#2-project-structure-)
- [Project setup](#3-setup-)
- [Database setup](#4-database-setup-)

***
### 1. Features

- Project & Task Management – Create and manage projects, assign tasks, and track progress.
- Graph View (DAG Representation): Visualize project dependencies as a Directed Acyclic Graph (DAG) using topological sorting.
- Team Collaboration: Assign team members to projects, manage roles, and send invite links via email.
- Authentication & Authorization : Secure login with jwt Refresh and Access tokens
- Responsive & Modern UI : Designed with TailwindCSS for a clean and intuitive user experience.

### 2. Project Structure :
```bash
# Frontend folder
client/
├── .next/
├── node_modules/
├── public/
├── src/
│   ├── app/
├── .env
# backend folder
server/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── .env
```
### 3. Setup :

```bash
# Clone the repository
git clone https://github.com/AhmedTrb/Project-Management-web-app.git
```
Install npm packages :

```bash
cd project-management-platform
```
**Install dependencies**
```bash
cd client
npm install
```
```bash
cd server
npm install
```

Create an environment variables file :

**Frontend :** 

```bash 
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

```
**Backend .env file :** 

``` 
PORT=8000
DATABASE_URL=postgresql://postgres:<Database password>@localhost:5432/<db name>?schema=public

JWT_ACCESS_TOKEN_SECRET=1234567890
JWT_REFRESH_TOKEN_SECRET=0987654321

STATUS=development

FRONTEND_URL=http://localhost:3000

```
### 4. Database setup :
- install PgAdmin 
- create a new postgres database 
- save database name and password
- update DATABSE_URL in .env file in server directory
- create database with the commands : 

    ```bash 
    cd server
    npx prisma migrate dev --name init
    ```

### 5. Running the project :
```bash
    cd client
    npm run dev
```
```bash
    cd server
    npm run dev
```


