# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity | Frontend component | Backend endpoints | Database SQL |
| --- | --- | --- | --- |
| View home page | home.jsx | [GET] /api/order/menu | SELECT id, name, description, price FROM menu WHERE status = 'active' |
| Register new user (t@jwt.com, pw: test) | register.jsx | [POST] /api/auth | INSERT INTO user (name, email, password) VALUES (?, ?, ?); INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?) |
| Login new user (t@jwt.com, pw: test) | login.jsx | [PUT] /api/auth | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| Order pizza | order.jsx | [POST] /api/order/{storeId} | SELECT * FROM store WHERE id = ? AND status = 'open'; INSERT INTO orders (userId, storeId, menuId, price) VALUES (?, ?, ?, ?) |
| Verify pizza | verify.jsx | [GET] /api/order/{orderId}/verify | SELECT o.*, s.name as storeName, m.name as menuName FROM orders o JOIN store s ON o.storeId = s.id JOIN menu m ON o.menuId = m.id WHERE o.id = ? |
| View profile page | profile.jsx | [GET] /api/auth/profile | SELECT * FROM user WHERE id = ?; SELECT role, objectId FROM userRole WHERE userId = ?; SELECT franchiseId FROM franchiseAdmin WHERE userId = ? |
| View franchise (as diner) | franchise.jsx | [GET] /api/franchise | SELECT * FROM franchise WHERE status = 'open' |
| Logout | nav.jsx | *none* | *none* |
| View About page | about.jsx | *none* | *none* |
| View History page | history.jsx | [GET] /api/order/history | SELECT o.*, s.name as storeName, m.name as menuName FROM orders o JOIN store s ON o.storeId = s.id JOIN menu m ON o.menuId = m.id WHERE o.userId = ? ORDER BY o.createdAt DESC |
| Login as franchisee (f@jwt.com, pw: franchisee) | login.jsx | [PUT] /api/auth | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| View franchise (as franchisee) | franchise.jsx | [GET] /api/franchise/{franchiseId} | SELECT * FROM franchise WHERE id = ? AND status = 'open'; SELECT * FROM store WHERE franchiseId = ? ORDER BY createdAt DESC |
| Create a store | store.jsx | [POST] /api/franchise/{franchiseId}/store | SELECT * FROM franchise WHERE id = ? AND status = 'open'; INSERT INTO store (franchiseId, name, status, revenue, createdAt, updatedAt) VALUES (?, ?, 'open', 0, NOW(), NOW()) |
| Close a store | store.jsx | [PUT] /api/franchise/{franchiseId}/store/{storeId} | SELECT * FROM store WHERE id = ? AND franchiseId = ?; UPDATE store SET status = 'closed', updatedAt = NOW() WHERE id = ? |
| Login as admin (a@jwt.com, pw: admin) | login.jsx | [PUT] /api/auth | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| View Admin page | admin.jsx | [GET] /api/admin/users | SELECT u.*, ur.role, ur.objectId FROM user u LEFT JOIN userRole ur ON u.id = ur.userId ORDER BY u.id |
| Create a franchise for t@jwt.com | admin.jsx | [POST] /api/franchise | INSERT INTO franchise (name, status, createdAt, updatedAt) VALUES (?, 'open', NOW(), NOW()); INSERT INTO franchiseAdmin (franchiseId, userId) VALUES (?, ?) |
| Close the franchise for t@jwt.com | admin.jsx | [PUT] /api/franchise/{franchiseId} | SELECT * FROM franchise WHERE id = ?; UPDATE franchise SET status = 'closed', updatedAt = NOW() WHERE id = ? |
