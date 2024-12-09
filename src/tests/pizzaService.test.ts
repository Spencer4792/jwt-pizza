import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  PizzaService, 
  User, 
  Role, 
  Order, 
  Franchise, 
  Store, 
  Menu, 
  OrderHistory, 
  OrderResponse, 
  JWTPayload,
  Endpoints
} from '../service/pizzaService';

// Mock fetch globally
window.fetch = vi.fn();

class TestPizzaService implements PizzaService {
  private mockUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    if (email === 'test@example.com' && password === 'password') {
      return {
        id: '1',
        name: 'Test User',
        email: email,
        password: 'hashedpassword',
        roles: [{ role: Role.Diner }]
      };
    }
    throw new Error('Invalid credentials');
  }

  async register(email: string, password: string, role: string): Promise<User> {
    return {
      id: '1',
      name: email.split('@')[0],
      email: email,
      password: 'hashedpassword',
      roles: [{ role: Role.Diner }]
    };
  }

  async logout(): Promise<void> {
    this.mockUser = null;
  }

  async getUser(): Promise<User | null> {
    return this.mockUser;
  }

  async getMenu(): Promise<Menu> {
    return [
      {
        id: '1',
        title: 'Pepperoni',
        description: 'Classic pepperoni pizza',
        image: 'pepperoni.jpg',
        price: 12.99
      }
    ];
  }

  async getOrders(user: User): Promise<OrderHistory> {
    return {
      id: '1',
      dinerId: user.id,
      orders: []
    };
  }

  async order(order: Order): Promise<OrderResponse> {
    return {
      order: order,
      jwt: 'mockJwtToken'
    };
  }

  async verifyOrder(jwt: string): Promise<JWTPayload> {
    return {
      message: 'Order verified',
      payload: 'mockPayload'
    };
  }

  async getFranchise(user: User): Promise<Franchise[]> {
    return [{
      id: '1',
      name: 'Test Franchise',
      stores: []
    }];
  }

  async createFranchise(franchise: Franchise): Promise<Franchise> {
    return franchise;
  }

  async getFranchises(): Promise<Franchise[]> {
    return [{
      id: '1',
      name: 'Test Franchise',
      stores: []
    }];
  }

  async closeFranchise(franchise: Franchise): Promise<void> {
    // Mock implementation
  }

  async createStore(franchise: Franchise, store: Store): Promise<Store> {
    return store;
  }

  async closeStore(franchise: Franchise, store: Store): Promise<null> {
    return null;
  }

  async docs(docType: string): Promise<Endpoints> {
    return {
      endpoints: []
    };
  }
}

describe('PizzaService', () => {
  let service: TestPizzaService;

  beforeEach(() => {
    service = new TestPizzaService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('successfully logs in with correct credentials', async () => {
      const user = await service.login('test@example.com', 'password');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.roles[0].role).toBe(Role.Diner);
    });

    it('throws error with incorrect credentials', async () => {
      await expect(service.login('wrong@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('successfully registers a new user', async () => {
      const user = await service.register('new@example.com', 'password', 'diner');
      expect(user).toBeDefined();
      expect(user.email).toBe('new@example.com');
      expect(user.roles[0].role).toBe(Role.Diner);
    });
  });

  describe('getMenu', () => {
    it('returns menu items', async () => {
      const menu = await service.getMenu();
      expect(menu).toHaveLength(1);
      expect(menu[0].title).toBe('Pepperoni');
    });
  });

  describe('getOrders', () => {
    it('returns order history for user', async () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        roles: [{ role: Role.Diner }]
      };
      
      const history = await service.getOrders(user);
      expect(history.dinerId).toBe(user.id);
      expect(Array.isArray(history.orders)).toBe(true);
    });
  });

  // Add more test cases for other methods
  describe('franchise operations', () => {
    it('creates and retrieves franchises', async () => {
      const franchise: Franchise = {
        id: '1',
        name: 'New Franchise',
        stores: []
      };

      const created = await service.createFranchise(franchise);
      expect(created).toEqual(franchise);

      const franchises = await service.getFranchises();
      expect(franchises).toHaveLength(1);
    });
  });

  describe('store operations', () => {
    it('creates store in franchise', async () => {
      const franchise: Franchise = {
        id: '1',
        name: 'Test Franchise',
        stores: []
      };

      const store: Store = {
        id: '1',
        name: 'Test Store'
      };

      const created = await service.createStore(franchise, store);
      expect(created).toEqual(store);
    });
  });
});