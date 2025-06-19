# Claude Prompt: Implement Auth0 Authentication & Row Level Security (RLS)

## Context
You are implementing Auth0 authentication and Row Level Security (RLS) in a Will Counter application with:
- **Frontend**: React Native/Expo with Redux Toolkit
- **Backend**: Kotlin/Ktor API with Supabase PostgreSQL
- **Database**: Supabase with RLS policies already defined
- **Authentication**: Auth0 integration needed

## Prerequisites (Already Done)
- Auth0 account and application created
- Supabase project with RLS policies
- Environment variables configured
- Database schema with RLS policies applied

## Required Changes

### 1. Frontend Auth0 Integration

#### Install Dependencies
```bash
cd frontend
npm install @auth0/react-native-auth0 react-native-keychain
```

#### Create Auth0 Configuration
**File**: `frontend/src/config/auth0.ts`

```typescript
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!,
});

export default auth0;
```

#### Create Authentication Context
**File**: `frontend/src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import auth0 from '../config/auth0';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../store/slices/userSlice';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<any | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const credentials = await auth0.credentials.getCredentials();
      if (credentials) {
        setIsAuthenticated(true);
        setUserState(credentials.user);
        dispatch(setUser(credentials.user));
      }
    } catch (error) {
      console.log('No valid credentials found');
    }
  };

  const login = async () => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
      });
      
      setIsAuthenticated(true);
      setUserState(credentials.user);
      dispatch(setUser(credentials.user));
      
      // Create or get user in your API
      await createOrGetUser(credentials.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth0.webAuth.clearSession();
      setIsAuthenticated(false);
      setUserState(null);
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const credentials = await auth0.credentials.getCredentials();
      return credentials?.accessToken || null;
    } catch (error) {
      return null;
    }
  };

  const createOrGetUser = async (auth0User: any) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          auth0_id: auth0User.sub,
          email: auth0User.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create/get user');
      }
    } catch (error) {
      console.error('User creation failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Update API Service with Authentication
**File**: `frontend/src/services/api.ts`

```typescript
import auth0 from '../config/auth0';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = async () => {
  try {
    const credentials = await auth0.credentials.getCredentials();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials?.accessToken}`,
    };
  } catch (error) {
    return {
      'Content-Type': 'application/json',
    };
  }
};

export const apiService = {
  async getTodayCount(userId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/will-counts/${userId}/today`, {
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch today count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async incrementCount(userId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/will-counts/increment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to increment count');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async createUser(auth0Id: string, email: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ auth0_id: auth0Id, email }),
    });
    if (!response.ok) throw new Error('Failed to create user');
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
};
```

### 2. Backend Auth0 Integration

#### Add Auth0 Dependencies
**File**: `api/build.gradle.kts`

```kotlin
dependencies {
    // Existing dependencies...
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("com.auth0:jwks-rsa:0.22.1")
}
```

#### Create Auth0 Configuration
**File**: `api/src/main/kotlin/com/willcounter/api/config/Auth0Config.kt`

```kotlin
package com.willcounter.api.config

import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import java.util.concurrent.TimeUnit

object Auth0Config {
    private val domain = System.getenv("AUTH0_DOMAIN") ?: "your-tenant.auth0.com"
    private val audience = System.getenv("AUTH0_AUDIENCE") ?: "https://api.willcounter.com"
    
    private val jwkProvider = JwkProviderBuilder(domain)
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    fun verifyToken(token: String): DecodedJWT? {
        return try {
            val algorithm = Algorithm.RSA256(jwkProvider, null)
            val verifier = JWT.require(algorithm)
                .withIssuer("https://$domain/")
                .withAudience(audience)
                .build()
            
            verifier.verify(token)
        } catch (e: Exception) {
            println("Token verification failed: ${e.message}")
            null
        }
    }

    fun extractUserId(jwt: DecodedJWT): String? {
        return jwt.subject
    }
}
```

#### Create Authentication Plugin
**File**: `api/src/main/kotlin/com/willcounter/api/config/AuthenticationPlugin.kt`

```kotlin
package com.willcounter.api.config

import com.willcounter.api.config.Auth0Config.verifyToken
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureAuthentication() {
    install(Authentication) {
        bearer("auth0") {
            realm = "Will Counter API"
            authenticate { credential ->
                val token = credential.token
                val jwt = verifyToken(token)
                
                if (jwt != null) {
                    val userId = Auth0Config.extractUserId(jwt)
                    if (userId != null) {
                        UserIdPrincipal(userId)
                    } else {
                        null
                    }
                } else {
                    null
                }
            }
        }
    }
}
```

#### Update Database Configuration for RLS
**File**: `api/src/main/kotlin/com/willcounter/api/config/DatabaseConfig.kt`

```kotlin
package com.willcounter.api.config

import com.willcounter.api.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource

object DatabaseConfig {
    
    fun init() {
        // Use service role key for API operations (bypasses RLS)
        val supabaseUrl = System.getenv("SUPABASE_URL") ?: "YOUR_SUPABASE_URL"
        val serviceRoleKey = System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: "YOUR_SERVICE_ROLE_KEY"
        
        val projectId = supabaseUrl.replace("https://", "").replace(".supabase.co", "")
        
        val config = HikariConfig().apply {
            driverClassName = "org.postgresql.Driver"
            jdbcUrl = "jdbc:postgresql://$projectId.supabase.co:5432/postgres"
            username = "postgres"
            password = serviceRoleKey // Use service role key
            maximumPoolSize = 10
            addDataSourceProperty("sslmode", "require")
        }
        
        val dataSource = HikariDataSource(config)
        Database.connect(dataSource)
        
        transaction {
            SchemaUtils.createMissingTablesAndColumns(Users, WillCounts)
        }
    }

    // Function to set JWT context for RLS (when needed)
    fun setJwtContext(jwt: String) {
        // This would set the JWT context for RLS policies
        // Implementation depends on your specific needs
    }
}
```

#### Update Routes with Authentication
**File**: `api/src/main/kotlin/com/willcounter/api/routes/UserRoutes.kt`

```kotlin
package com.willcounter.api.routes

import com.willcounter.api.dto.*
import com.willcounter.api.services.DatabaseService
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Route.userRoutes(databaseService: DatabaseService) {
    route("/api/users") {
        
        post {
            try {
                // Get authenticated user info
                val principal = call.principal<UserIdPrincipal>()
                val auth0Id = principal?.name ?: run {
                    call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                        success = false,
                        error = "Authentication required"
                    ))
                    return@post
                }

                val request = call.receive<CreateUserRequest>()
                
                // Verify the auth0_id matches the authenticated user
                if (request.auth0Id != auth0Id) {
                    call.respond(HttpStatusCode.Forbidden, ApiResponse<Any>(
                        success = false,
                        error = "Cannot create user for different auth0_id"
                    ))
                    return@post
                }
                
                val user = databaseService.createUser(request)
                call.respond(HttpStatusCode.Created, ApiResponse(
                    success = true,
                    data = user,
                    message = "User created successfully"
                ))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                    success = false,
                    error = "Failed to create user: ${e.message}"
                ))
            }
        }
        
        get("/me") {
            authenticate("auth0") {
                try {
                    val principal = call.principal<UserIdPrincipal>()
                    val auth0Id = principal?.name ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@get
                    }
                    
                    val user = databaseService.getUserByAuth0Id(auth0Id)
                    if (user != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = user
                        ))
                    } else {
                        call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                            success = false,
                            error = "User not found"
                        ))
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to get user: ${e.message}"
                    ))
                }
            }
        }
    }
}
```

#### Update WillCount Routes with Authentication
**File**: `api/src/main/kotlin/com/willcounter/api/routes/WillCountRoutes.kt`

```kotlin
package com.willcounter.api.routes

import com.willcounter.api.dto.*
import com.willcounter.api.services.DatabaseService
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Route.willCountRoutes(databaseService: DatabaseService) {
    route("/api/will-counts") {
        
        get("/today") {
            authenticate("auth0") {
                try {
                    val principal = call.principal<UserIdPrincipal>()
                    val auth0Id = principal?.name ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@get
                    }
                    
                    // Get user by auth0_id first
                    val user = databaseService.getUserByAuth0Id(auth0Id)
                    if (user == null) {
                        call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                            success = false,
                            error = "User not found"
                        ))
                        return@get
                    }
                    
                    val willCount = databaseService.getTodayCount(user.id)
                    if (willCount != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = willCount
                        ))
                    } else {
                        call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                            success = false,
                            error = "Failed to get today's count"
                        ))
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to get today's count: ${e.message}"
                    ))
                }
            }
        }
        
        post("/increment") {
            authenticate("auth0") {
                try {
                    val principal = call.principal<UserIdPrincipal>()
                    val auth0Id = principal?.name ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@post
                    }
                    
                    // Get user by auth0_id first
                    val user = databaseService.getUserByAuth0Id(auth0Id)
                    if (user == null) {
                        call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                            success = false,
                            error = "User not found"
                        ))
                        return@post
                    }
                    
                    val willCount = databaseService.incrementCount(user.id)
                    if (willCount != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = willCount,
                            message = "Count incremented successfully"
                        ))
                    } else {
                        call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                            success = false,
                            error = "Failed to increment count"
                        ))
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to increment count: ${e.message}"
                    ))
                }
            }
        }
    }
}
```

### 3. Update Application Entry Point
**File**: `api/src/main/kotlin/com/willcounter/api/Application.kt`

```kotlin
package com.willcounter.api

import com.willcounter.api.config.DatabaseConfig
import com.willcounter.api.config.configureAuthentication
import com.willcounter.api.services.DatabaseService
import com.willcounter.api.routes.userRoutes
import com.willcounter.api.routes.willCountRoutes
import com.willcounter.api.dto.HealthResponse
import com.willcounter.api.dto.ApiResponse
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import java.time.LocalDateTime

fun main() {
    // Initialize database
    println("Initializing database...")
    try {
        DatabaseConfig.init()
        println("Database initialized successfully")
    } catch (e: Exception) {
        println("Failed to initialize database: ${e.message}")
        return
    }
    
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // Configure authentication
    configureAuthentication()
    
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
    
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Get)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        anyHost()
    }
    
    val databaseService = DatabaseService()
    
    routing {
        get("/") {
            call.respond(ApiResponse(
                success = true,
                data = mapOf("message" to "Will Counter API", "version" to "1.0.0"),
                message = "Welcome to Will Counter API"
            ))
        }
        
        get("/health") {
            call.respondText("API is running and healthy", ContentType.Text.Plain)
        }
        
        // Add user routes
        userRoutes(databaseService)
        
        // Add will count routes
        willCountRoutes(databaseService)
    }
}
```

### 4. Update Frontend App Entry Point
**File**: `frontend/App.tsx`

```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </Provider>
  );
}
```

### 5. Update Navigation with Authentication
**File**: `frontend/src/navigation/AppNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../components/auth/LoginScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 6. Create Login Screen
**File**: `frontend/src/components/auth/LoginScreen.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Will Counter</Text>
      <Text style={styles.subtitle}>Track your daily willpower</Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;
```

## Implementation Steps

1. **Install frontend dependencies**
2. **Create Auth0 configuration files**
3. **Update API with authentication**
4. **Update routes with auth middleware**
5. **Create authentication context**
6. **Update navigation flow**
7. **Test authentication flow**

## Expected Outcome

After implementation:
- ✅ Users must authenticate with Auth0
- ✅ JWT tokens are validated on API requests
- ✅ RLS policies protect user data
- ✅ Users can only access their own data
- ✅ Secure authentication flow
- ✅ Proper error handling

## Testing

1. **Test login flow** in frontend
2. **Verify JWT validation** in API
3. **Test RLS policies** by accessing other users' data
4. **Verify data isolation** between users

Please implement these changes step by step, ensuring each modification works before proceeding to the next. 