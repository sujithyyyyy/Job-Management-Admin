
# 🚀 JobVista Admin – Job Management Admin System
Website URL-https://job-management-system-admin.netlify.app


> A full-stack **Job Management Admin Panel** to create, filter, and manage job postings with precision and style — all powered by vanilla web tech and a blazing-light SQLite backend.

---

## 🧠 What It Does

- 🔍 **Filter** jobs by role, type, location, and salary
- 📝 **Create** new job postings using a modal interface
- 📦 **Store** data in SQLite with instant access
- 🧰 **REST API** with endpoints for job creation and retrieval
- 🎯 **Deployed frontend** (Vercel) + **backend** (Render/Node.js)

---

## 🖼️ Preview

![UI Screenshot]!
[image](https://github.com/user-attachments/assets/c02c31af-b15b-4267-a836-a1b065ac1034)
![image](https://github.com/user-attachments/assets/b82d2d1b-520b-4630-af1b-8fe14c59e9c8)


---

## 📁 Project Structure


├── index.html # Clean, semantic HTML
├── styles.css # Tailored UI with modern CSS
├── script.js # Handles UI, fetch, rendering logic
├── server.js # Express server + SQLite API backend
├── database.sqlite # Local SQLite DB


---

## ⚙️ Tech Stack

| Frontend | Backend  | Database | Deployment |
|----------|----------|----------|------------|
| HTML/CSS/JS | Node.js + Express | SQLite3 | Netlify + Render |

---

## 🔧 Local Setup

```bash
# Clone the repo
git clone https://github.com/sujithyyyyy/Job-Management-Admin.git
cd job-vista-admin

# Install backend dependencies
npm install

# Start server
node server.js
🎯 API Endpoints
Method	Endpoint	Description
GET	/api/jobs	Get all jobs (with filters)
POST	/api/jobs	Create a new job
GET	/api/jobs/:id	Get a job by ID

💡 Innovation Highlights
✅ Modal-powered UX: Replaces full-page reloads with focused user flows.

✅ Smart defaults: Random work model if not provided.

✅ Lightweight DB: Zero external dependencies—portable via SQLite.

📌 To-Do / Future Scope
 Add job editing/deletion

 User login + role-based admin access

 Pagination + lazy loading

 Deployment instructions & CI

🧑‍💻 Author
Sujith Sridhar
🚀 Always learning. Forever building.
LinkedIn | Portfolio | Email

🛡️ License
MIT © 2025 Sujith Sridhar

yaml
Copy
Edit

---

Let me know if you want a dynamic badge version (e.g., GitHub stats, Vercel preview, or Render logs) — or if you'd like this styled for a GitHub profile instead of a repo.







