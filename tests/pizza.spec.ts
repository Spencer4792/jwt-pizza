import { test, expect } from 'playwright-test-coverage';

interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<{ role: string }>;
}

test.setTimeout(30000);

// Common mocked responses
const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@jwt.com',
  roles: [{ role: 'diner' }]
};

const mockAdminUser: User = {
  id: 2,
  name: 'Admin User',
  email: 'admin@jwt.com',
  roles: [{ role: 'admin' }]
};

const mockFranchiseUser: User = {
  id: 3,
  name: 'Franchise Owner',
  email: 'franchise@jwt.com',
  roles: [{ role: 'franchise' }]
};

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    window.localStorage.clear();
  });

  // Mock common endpoints
  await page.route('**/api/order/menu', async (route) => {
    await route.fulfill({ 
      json: [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' }
      ]
    });
  });
});

test('login functionality', async ({ page }) => {
  // Mock auth endpoint
  await page.route('**/api/auth', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.email === 'test@jwt.com' && body?.password === 'testpass') {
      await route.fulfill({ json: { user: mockUser, token: 'test-token' } });
    } else {
      await route.fulfill({ status: 401, json: { message: 'Invalid credentials' } });
    }
  });

  await page.goto('http://localhost:5173/login');

  // Test invalid login
  await page.getByPlaceholder('Email address').fill('wrong@email.com');
  await page.getByPlaceholder('Password').fill('wrongpass');
  await page.getByRole('button', { name: 'Login' }).click();

  // Test valid login
  await page.getByPlaceholder('Email address').fill('test@jwt.com');
  await page.getByPlaceholder('Password').fill('testpass');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Verify localStorage is set after valid login
  const localStorage = await page.evaluate(() => {
    return {
      user: window.localStorage.getItem('user'),
      token: window.localStorage.getItem('token')
    };
  });
  expect(localStorage.user).toBeTruthy();
  expect(localStorage.token).toBe('test-token');
});

test('home page navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check main elements are visible
  await expect(page.locator('span.text-4xl')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
  
  // Navigate to menu
  await page.getByRole('button', { name: 'Order now' }).click();
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
});

test('menu page functionality', async ({ page }) => {
  // Mock franchise data for store selection
  await page.route('**/api/franchise', async (route) => {
    await route.fulfill({ 
      json: [{
        id: 1,
        name: 'Test Franchise',
        stores: [{ id: 4, name: 'Test Store' }]
      }]
    });
  });

  await page.goto('http://localhost:5173/menu');
  
  // Check menu items
  await expect(page.getByText('Veggie')).toBeVisible();
  await expect(page.getByText('A garden of delight')).toBeVisible();
  
  // Select a store
  await page.waitForSelector('select');
  await page.locator('select').selectOption({ value: '4' });
  
  // Add a pizza
  await page.getByText('Veggie').click();
  await expect(page.getByText('Selected pizzas: 1')).toBeVisible();
});

test('diner dashboard functionality', async ({ page }) => {
  // Set up authenticated diner user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'test-token');
  }, mockUser);

  // Mock order history
  await page.route('**/api/order', async (route) => {
    await route.fulfill({ 
      json: { 
        orders: [{
          id: 1,
          items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }],
          date: new Date().toISOString()
        }]
      }
    });
  });

  await page.goto('http://localhost:5173/diner-dashboard');
  await expect(page.getByText(mockUser.name)).toBeVisible();
  await expect(page.getByText(mockUser.email)).toBeVisible();
});

test('admin dashboard functionality', async ({ page }) => {
  // Set up authenticated admin user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'admin-token');
  }, mockAdminUser);

  // Mock franchise data
  await page.route('**/api/franchise', async (route) => {
    await route.fulfill({ 
      json: [{
        id: 1,
        name: 'Test Franchise',
        admins: [{ name: 'Franchise Admin' }],
        stores: [
          { id: 1, name: 'Store 1', totalRevenue: 100 }
        ]
      }]
    });
  });

  await page.goto('http://localhost:5173/admin-dashboard');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.getByText('Test Franchise')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
});

test('franchise dashboard functionality', async ({ page }) => {
  // Setup franchise user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'franchise-token');
  }, mockFranchiseUser);

  // Mock franchise data
  await page.route('**/api/franchise/*', async (route) => {
    await route.fulfill({ 
      json: [{
        id: 1,
        name: 'Test Franchise',
        stores: [
          { id: 1, name: 'Store 1', totalRevenue: 100 },
          { id: 2, name: 'Store 2', totalRevenue: 200 }
        ]
      }]
    });
  });

  await page.goto('http://localhost:5173/franchise-dashboard');
  
  // Check franchise dashboard content
  await expect(page.getByText('Test Franchise')).toBeVisible();
  await expect(page.getByText('Store 1')).toBeVisible();
  await expect(page.getByText('Store 2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
});

test('register functionality', async ({ page }) => {
  // Mock register endpoint
  await page.route('**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ 
        json: { 
          user: {
            id: 4,
            name: body.name,
            email: body.email,
            roles: [{ role: 'diner' }]
          },
          token: 'new-user-token'
        }
      });
    }
  });

  await page.goto('http://localhost:5173/register');
  
  // Fill registration form
  await page.getByPlaceholder('Email address').fill('new@jwt.com');
  await page.getByPlaceholder('Password').fill('newpass');
  await page.getByPlaceholder(/name/i).fill('New User');
  
  // Submit form
  await page.getByRole('button', { name: /register/i }).click();

  // Verify localStorage was set
  const storage = await page.evaluate(() => ({
    user: JSON.parse(window.localStorage.getItem('user') || 'null'),
    token: window.localStorage.getItem('token')
  }));
  
  expect(storage.user.email).toBe('new@jwt.com');
  expect(storage.token).toBe('new-user-token');
});

test('docs api display', async ({ page }) => {
  // Setup user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'test-token');
  }, mockUser);

  // Mock docs endpoint
  await page.route('**/api/docs', async (route) => {
    await route.fulfill({ 
      json: {
        endpoints: [
          { path: '/api/order', method: 'GET', description: 'Get orders' }
        ]
      }
    });
  });

  await page.goto('http://localhost:5173/docs');
  await expect(page.getByText('/api/order')).toBeVisible();
});

test('delivery page with order verification', async ({ page }) => {
  // Setup user with order data
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'test-token');
  }, mockUser);

  // Mock verify endpoint
  await page.route('**/api/order/verify', async (route) => {
    await route.fulfill({ 
      json: { 
        message: 'valid',
        payload: { orderId: 1, verified: true }
      }
    });
  });

  const orderData = {
    order: {
      id: 1,
      items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }]
    },
    jwt: 'test-jwt-token'
  };

  await page.goto('http://localhost:5173/delivery');
  
  // Set state for delivery page
  await page.evaluate((state) => {
    window.history.pushState(state, '');
  }, orderData);

  await page.reload();

  // Click verify button and check modal
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('#hs-jwt-modal')).toBeVisible();
});

test('payment page display', async ({ page }) => {
  // Setup user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'test-token');
  }, mockUser);

  const orderData = {
    order: {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 }
      ]
    }
  };

  await page.goto('http://localhost:5173/payment');
  
  // Set state for payment page
  await page.evaluate((state) => {
    window.history.pushState(state, '');
  }, orderData);

  await page.reload();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay now' })).toBeVisible();
});

test('about page content', async ({ page }) => {
  await page.goto('http://localhost:5173/about');
  await expect(page.locator('main')).toBeVisible();
});

test('history page display', async ({ page }) => {
  // Setup authenticated user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'test-token');
  }, mockUser);

  // Mock order history endpoint
  await page.route('**/api/order', async (route) => {
    await route.fulfill({ 
      json: { 
        orders: [{
          id: 1,
          items: [{ menuId: 1, description: 'Veggie', price: 0.0038 }],
          date: new Date().toISOString()
        }]
      }
    });
  });

  await page.goto('http://localhost:5173/history');
  await expect(page.locator('main')).toBeVisible();
});

test('create franchise process', async ({ page }) => {
  // Setup admin user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'admin-token');
  }, mockAdminUser);

  // Mock franchise creation endpoint
  await page.route('**/api/franchise', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ 
        json: {
          id: 1,
          name: 'New Franchise',
          stores: []
        }
      });
    }
  });

  await page.goto('http://localhost:5173/admin-dashboard/create-franchise');
  
  // Fill and submit form
  await page.getByPlaceholder(/franchise name/i).fill('New Franchise');
  await page.getByPlaceholder(/admin email/i).fill('admin@franchise.com');
  await page.getByRole('button', { name: 'Create' }).click();
});

test('create store process', async ({ page }) => {
  // Setup franchise user
  await page.evaluate((user: User) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', 'franchise-token');
  }, mockFranchiseUser);

  // Mock store creation endpoint
  await page.route('**/api/franchise/*/store', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ 
        json: {
          id: 1,
          name: 'New Store'
        }
      });
    }
  });

  // Set up location state
  await page.goto('http://localhost:5173/franchise-dashboard/create-store');
  await page.evaluate((state) => {
    window.history.pushState({ 
      franchise: { id: 1, name: 'Test Franchise' }
    }, '');
  }, {});

  await page.reload();
  
  // Fill and submit form
  await page.getByPlaceholder(/store name/i).fill('New Store');
  await page.getByRole('button', { name: 'Create' }).click();
});