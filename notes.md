# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity | Frontend component | Backend endpoints | Database SQL |
|--------------|-------------------|-------------------|--------------|
| View home page | home.jsx | *none* | *none* |
| Register new user (t@jwt.com, pw: test) | register.jsx | [POST] /api/auth | INSERT INTO user (name, email, password) VALUES (?, ?, ?); INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?) |
| Login new user (t@jwt.com, pw: test) | login.jsx | [PUT] /api/auth | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| Order pizza | order.jsx | [POST] /api/order/{storeId} | INSERT INTO orders (userId, storeId, menuId, price) VALUES (?, ?, ?, ?) |
| Verify pizza | verify.jsx | [GET] /api/order/{orderId}/verify | SELECT * FROM orders WHERE id = ? |
| View profile page | profile.jsx | [GET] /api/auth/profile | SELECT * FROM user WHERE id = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| View franchise (as diner) | franchise.jsx | [GET] /api/franchise | SELECT * FROM franchise |
| Logout | nav.jsx | *none* | *none* |
| View About page | about.jsx | *none* | *none* |
| View History page | history.jsx | [GET] /api/order/history | SELECT * FROM orders WHERE userId = ? |
| Login as franchisee (f@jwt.com, pw: franchisee) | login.jsx | [PUT] /api/auth | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| View franchise (as franchisee) | franchise.jsx | [GET] /api/franchise/{franchiseId} | SELECT * FROM franchise WHERE id = ?; SELECT * FROM store WHERE franchiseId = ? |
| Create a store | store.jsx | [POST] /api/franchise/{franchiseId}/store | INSERT INTO store (franchiseId, name, status, createdAt, updatedAt) VALUES (?, ?, 'open', NOW(), NOW()) |
| Close a store | store.jsx | [PUT] /api/franchise/{franchiseId}/store/{storeId} | UPDATE store SET status = 'closed' WHERE id = ? |
| Login as admin (a@jwt.com, pw: admin) | login.jsx | [PUT] /api/auth | SELECT * FROM user WHERE email = ?; SELECT role, objectId FROM userRole WHERE userId = ? |
| View Admin page | admin.jsx | [GET] /api/admin/users | SELECT * FROM user; SELECT * FROM userRole |
| Create a franchise for t@jwt.com | admin.jsx | [POST] /api/franchise | INSERT INTO franchise (name) VALUES (?); INSERT INTO franchiseAdmin (franchiseId, userId) VALUES (?, ?) |
| Close the franchise for t@jwt.com | admin.jsx | [PUT] /api/franchise/{franchiseId} | UPDATE franchise SET status = 'closed' WHERE id = ? |
