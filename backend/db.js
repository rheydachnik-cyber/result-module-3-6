import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'data.json');
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ 
    applications: [], 
    users: [],
    idCounter: 1,
    userIdCounter: 1
  }, null, 2));
}

export function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

export function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getAllApplications() {
  const db = readDB();
  return db.applications || [];
}

export function addApplication(application) {
  const db = readDB();
  const newApp = {
    id: db.idCounter++,
    ...application,
    createdAt: new Date().toISOString()
  };
  db.applications = db.applications || [];
  db.applications.unshift(newApp);
  writeDB(db);
  return newApp;
}

export function getApplicationsWithFilters(page = 1, limit = 10, search = '') {
  let apps = getAllApplications();

  if (search) {
    const term = search.toLowerCase();
    apps = apps.filter(app => 
      app.fullName.toLowerCase().includes(term) ||
      app.phone.includes(term) ||
      (app.problem && app.problem.toLowerCase().includes(term))
    );
  }

  const total = apps.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApps = apps.slice(startIndex, endIndex);
  
  return {
    applications: paginatedApps,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
}

export function clearAllApplications() {
  const db = readDB();
  db.applications = [];
  db.idCounter = 1;
  writeDB(db);
}
