// Service Layer Exports
export * from './interfaces/IBaseService';
export * from './interfaces/IUserService';
export * from './interfaces/IWillCountService';

export * from './implementations/BaseService';
export * from './implementations/UserService';
export * from './implementations/WillCountService';

export * from './ServiceContainer';
export * from './improvedApiService';

// Legacy API service (for backward compatibility)
export { apiService } from './api';