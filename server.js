import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jsonServer from "json-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(middlewares);

const getNextId = () => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")));
  const users = db.users || [];
  if (users.length === 0) return 1;
  return Math.max(...users.map((u) => u.id)) + 1;
};

server.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")));
  const users = db.users || [];

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: getNextId(), 
    name,
    email,
    password, 
  };

  users.push(newUser);
  db.users = users;
  fs.writeFileSync(path.join(__dirname, "db.json"), JSON.stringify(db, null, 2));

  res.status(201).json({ user: newUser });
});

server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")));
  const users = db.users || [];

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  res.json({ user });
});

server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server running on http://localhost:${PORT}`);
});
