# Learning notes

## JWT Pizza user activity mapping

User activity | Frontend component | Backend endpoints | Database SQL
--------------|-------------------|------------------|------------
View home page | home.jsx | *none* | *none*
Register new user (t@jwt.com, pw: test) | register.jsx | [POST] /api/auth | INSERT INTO user (name, email, password) VALUES (?, ?, ?); INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)
Login new user (t@jwt.com, pw: test) | login.jsx | [POST] /api/auth/login | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ?
Order pizza | order.jsx | [POST] /api/order | INSERT INTO orders (userId, storeId, pizza, status) VALUES (?, ?, ?, ?)
Verify pizza | verify.jsx | [GET] /api/order/{orderId} | SELECT * FROM orders WHERE orderId = ?
View profile page | profile.jsx | [GET] /api/user/profile | SELECT * FROM user WHERE userId = ?; SELECT * FROM userRole WHERE userId = ?
View franchise (as diner) | franchise.jsx | [GET] /api/franchise/{franchiseId} | SELECT * FROM franchise WHERE franchiseId = ?; SELECT * FROM store WHERE franchiseId = ?
Logout | navbar.jsx | *none* | *none*
View About page | about.jsx | *none* | *none*
View History page | history.jsx | [GET] /api/order/history | SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC
Login as franchisee (f@jwt.com, pw: franchisee) | login.jsx | [POST] /api/auth/login | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ?
View franchise (as franchisee) | franchise.jsx | [GET] /api/franchise/{franchiseId} | SELECT * FROM franchise WHERE franchiseId = ?; SELECT * FROM store WHERE franchiseId = ?
Create a store | store.jsx | [POST] /api/store | INSERT INTO store (franchiseId, location, status) VALUES (?, ?, ?)
Close a store | store.jsx | [PUT] /api/store/{storeId} | UPDATE store SET status = 'closed' WHERE storeId = ?
Login as admin (a@jwt.com, pw: admin) | login.jsx | [POST] /api/auth/login | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ?
View Admin page | admin.jsx | [GET] /api/admin/users | SELECT * FROM user; SELECT * FROM userRole
Create a franchise for t@jwt.com | admin.jsx | [POST] /api/franchise | INSERT INTO franchise (name, userId) VALUES (?, ?); INSERT INTO userRole (userId, role, objectId) VALUES (?, 'franchisee', ?)
Close the franchise for t@jwt.com | admin.jsx | [PUT] /api/franchise/{franchiseId} | UPDATE franchise SET status = 'closed' WHERE franchiseId = ?; UPDATE store SET status = 'closed' WHERE franchiseId = ?
