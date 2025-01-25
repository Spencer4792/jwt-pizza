# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity | Frontend component | Backend endpoints | Database SQL |
|--------------|-------------------|-------------------|--------------|
| View home page | home.jsx | [GET] /api/order/menu | SELECT * FROM menu WHERE status = 'active'; SELECT * FROM store WHERE status = 'open' |
| Register new user (t@jwt.com, pw: test) | register.jsx | [POST] /api/auth | BEGIN; SELECT * FROM user WHERE email = ?; INSERT INTO user (name, email, password, status, createdAt, updatedAt) VALUES (?, ?, ?, 'active', NOW(), NOW()); INSERT INTO userRole (userId, role, objectId, createdAt, updatedAt) VALUES (LAST_INSERT_ID(), 'diner', NULL, NOW(), NOW()); COMMIT |
| Login new user (t@jwt.com, pw: test) | login.jsx | [PUT] /api/auth | SELECT id, name, email, password, status FROM user WHERE email = ? AND status = 'active'; SELECT role, objectId FROM userRole WHERE userId = ? |
| Order pizza | order.jsx | [POST] /api/order/{storeId} | BEGIN; SELECT * FROM store WHERE id = ? AND status = 'open'; INSERT INTO orders (userId, storeId, menuId, price, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'pending', NOW(), NOW()); UPDATE store SET revenue = revenue + ? WHERE id = ?; COMMIT |
| Verify pizza | verify.jsx | [GET] /api/order/{orderId}/verify | SELECT o.*, m.title, m.description FROM orders o JOIN menu m ON o.menuId = m.id WHERE o.id = ? |
| View profile page | profile.jsx | [GET] /api/auth/profile | SELECT id, name, email, status FROM user WHERE id = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| View franchise (as diner) | franchise.jsx | [GET] /api/franchise | SELECT f.*, GROUP_CONCAT(DISTINCT u.name) as admins FROM franchise f LEFT JOIN franchiseAdmin fa ON f.id = fa.franchiseId LEFT JOIN user u ON fa.userId = u.id WHERE f.status = 'open' GROUP BY f.id |
| Logout | nav.jsx | *none* | *none* |
| View About page | about.jsx | *none* | *none* |
| View History page | history.jsx | [GET] /api/order/history | SELECT o.*, m.title, s.name as storeName, f.name as franchiseName FROM orders o JOIN menu m ON o.menuId = m.id JOIN store s ON o.storeId = s.id JOIN franchise f ON s.franchiseId = f.id WHERE o.userId = ? ORDER BY o.createdAt DESC |
| Login as franchisee (f@jwt.com, pw: franchisee) | login.jsx | [PUT] /api/auth | SELECT id, name, email, password, status FROM user WHERE email = ? AND status = 'active'; SELECT role, objectId FROM userRole WHERE userId = ? |
| View franchise (as franchisee) | franchise.jsx | [GET] /api/franchise/{franchiseId} | SELECT f.*, GROUP_CONCAT(DISTINCT u.name) as admins FROM franchise f LEFT JOIN franchiseAdmin fa ON f.id = fa.franchiseId LEFT JOIN user u ON fa.userId = u.id WHERE f.id = ? GROUP BY f.id; SELECT * FROM store WHERE franchiseId = ? AND status != 'deleted' ORDER BY createdAt DESC |
| Create a store | store.jsx | [POST] /api/franchise/{franchiseId}/store | BEGIN; SELECT * FROM franchise WHERE id = ? AND status = 'open'; INSERT INTO store (franchiseId, name, status, revenue, createdAt, updatedAt) VALUES (?, ?, 'open', 0, NOW(), NOW()); COMMIT |
| Close a store | store.jsx | [PUT] /api/franchise/{franchiseId}/store/{storeId} | BEGIN; SELECT * FROM franchise WHERE id = ? AND status = 'open'; UPDATE store SET status = 'closed', updatedAt = NOW() WHERE id = ? AND franchiseId = ?; COMMIT |
| Login as admin (a@jwt.com, pw: admin) | login.jsx | [PUT] /api/auth | SELECT id, name, email, password, status FROM user WHERE email = ? AND status = 'active'; SELECT role, objectId FROM userRole WHERE userId = ? |
| View Admin page | admin.jsx | [GET] /api/admin/users | SELECT u.*, GROUP_CONCAT(r.role) as roles FROM user u LEFT JOIN userRole r ON u.id = r.userId GROUP BY u.id |
| Create a franchise for t@jwt.com | admin.jsx | [POST] /api/franchise | BEGIN; SELECT id FROM user WHERE email = ? AND status = 'active'; INSERT INTO franchise (name, status, createdAt, updatedAt) VALUES (?, 'open', NOW(), NOW()); INSERT INTO franchiseAdmin (franchiseId, userId, createdAt, updatedAt) VALUES (LAST_INSERT_ID(), ?, NOW(), NOW()); COMMIT |
| Close the franchise for t@jwt.com | admin.jsx | [PUT] /api/franchise/{franchiseId} | BEGIN; UPDATE store SET status = 'closed', updatedAt = NOW() WHERE franchiseId = ?; UPDATE franchise SET status = 'closed', updatedAt = NOW() WHERE id = ?; COMMIT |
