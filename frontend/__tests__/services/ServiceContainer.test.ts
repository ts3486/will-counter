import { ServiceContainer } from '../../src/services/ServiceContainer';

// Mock fetch for testing
global.fetch = jest.fn();

describe('ServiceContainer', () => {
  let serviceContainer: ServiceContainer;

  beforeEach(() => {
    ServiceContainer.reset();
    serviceContainer = ServiceContainer.getInstance();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize services successfully', async () => {
      // Mock successful health check
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const config = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
        supabaseServiceKey: 'test-service-key',
      };

      await expect(serviceContainer.initialize(config)).resolves.not.toThrow();
    });

    it('should throw error with invalid configuration', async () => {
      const config = {
        supabaseUrl: '',
        supabaseAnonKey: '',
      };

      await expect(serviceContainer.initialize(config)).rejects.toThrow();
    });

    it('should not reinitialize if already initialized', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      const config = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      };

      await serviceContainer.initialize(config);
      
      // This test mainly verifies no errors are thrown on re-initialization
      await expect(serviceContainer.initialize(config)).resolves.not.toThrow();
    });
  });

  describe('service access', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      
      await serviceContainer.initialize({
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      });
    });

    it('should provide user service', () => {
      const userService = serviceContainer.getUserService();
      expect(userService).toBeDefined();
      expect(userService.serviceName).toBe('UserService');
    });

    it('should provide will count service', () => {
      const willCountService = serviceContainer.getWillCountService();
      expect(willCountService).toBeDefined();
      expect(willCountService.serviceName).toBe('WillCountService');
    });

    it('should throw error when accessing services before initialization', () => {
      ServiceContainer.reset();
      const newContainer = ServiceContainer.getInstance();
      
      expect(() => newContainer.getUserService()).toThrow(
        'UserService not initialized. Call initialize() first.'
      );
      expect(() => newContainer.getWillCountService()).toThrow(
        'WillCountService not initialized. Call initialize() first.'
      );
    });
  });

  describe('health check', () => {
    it('should return overall health status', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      
      await serviceContainer.initialize({
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      });

      const healthStatus = await serviceContainer.healthCheck();
      
      expect(healthStatus.overall).toBe(true);
      expect(healthStatus.services.userService).toEqual({ healthy: true });
      expect(healthStatus.services.willCountService).toEqual({ healthy: true });
    });

    it('should return false when not initialized', async () => {
      const healthStatus = await serviceContainer.healthCheck();
      
      expect(healthStatus.overall).toBe(false);
      expect(healthStatus.services.container).toEqual({
        healthy: false,
        error: 'Not initialized'
      });
    });

    it('should handle service health check failures', async () => {
      // Mock successful initialization
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      
      await serviceContainer.initialize({
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      });

      // Mock failed health checks
      (fetch as jest.Mock).mockResolvedValue({ ok: false });

      const healthStatus = await serviceContainer.healthCheck();
      
      expect(healthStatus.overall).toBe(false);
      expect(healthStatus.services.userService.healthy).toBe(false);
      expect(healthStatus.services.willCountService.healthy).toBe(false);
    });
  });

  describe('disposal', () => {
    it('should dispose all services', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: true });
      
      await serviceContainer.initialize({
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      });

      await expect(serviceContainer.dispose()).resolves.not.toThrow();
      
      // Should throw error when trying to access services after disposal
      expect(() => serviceContainer.getUserService()).toThrow();
      expect(() => serviceContainer.getWillCountService()).toThrow();
    });

    it('should not throw when disposing uninitialized container', async () => {
      await expect(serviceContainer.dispose()).resolves.not.toThrow();
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = ServiceContainer.getInstance();
      const instance2 = ServiceContainer.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton correctly', () => {
      const instance1 = ServiceContainer.getInstance();
      ServiceContainer.reset();
      const instance2 = ServiceContainer.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});