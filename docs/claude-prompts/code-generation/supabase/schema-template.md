# Supabase Database Pattern Generator

## 🎯 Purpose
Generate Supabase PostgreSQL database schemas, RLS policies, and functions following Will Counter project patterns.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior database engineer specializing in Supabase PostgreSQL with expertise in Row Level Security (RLS) and real-time subscriptions. Create database patterns for the Will Counter application.

**PROJECT CONTEXT**:
- **Database**: Supabase PostgreSQL with real-time capabilities
- **Security**: Row Level Security (RLS) for multi-tenant isolation
- **Authentication**: Auth0 JWT integration with user identification
- **Access Patterns**: Mobile app with offline-first data sync

**EXISTING SCHEMA REFERENCES**:
- Database Schema: `/will-counter/shared/database/schema.sql`
- Current Tables: `users`, `will_counts`
- Auth Integration: Auth0 user ID mapping
- RLS Policies: User data isolation patterns

**SUPABASE PATTERNS TO FOLLOW**:
```sql
-- Standard table structure
CREATE TABLE table_name (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy pattern
CREATE POLICY "Users can only access their own data" 
ON table_name FOR ALL 
USING (user_id = auth.uid());

-- Real-time subscription
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE table_name;
```

## DATABASE REQUIREMENT

**Feature/Table Purpose**: [e.g., User progress tracking, Social features, Analytics data]

**Data Requirements**:
- **Primary Entity**: [Main data being stored]
- **Relationships**: [How it connects to existing tables]
- **Access Patterns**: [How data will be queried]
- **Real-time Needs**: [What needs live updates]

**Schema Specification**:
```sql
-- Describe the data structure needed
table_name {
    field1: data_type (constraints)
    field2: data_type (constraints)
    // relationships and indexes
}
```

**Security Requirements**:
- [ ] **User Isolation**: Each user can only access their own data
- [ ] **Role-based Access**: Different permissions for different user types
- [ ] **Public Data**: Some data readable by all authenticated users
- [ ] **Admin Access**: Administrative data access patterns

**Performance Requirements**:
- [ ] **High Read Volume**: Optimized for frequent queries
- [ ] **High Write Volume**: Optimized for frequent updates
- [ ] **Complex Queries**: Multi-table joins and aggregations
- [ ] **Real-time Updates**: Live subscription support

## SPECIFIC REQUIREMENTS

### For User Data Tables:
- User isolation with auth.uid() RLS policies
- Efficient user-scoped queries with proper indexes
- Audit trails with created_at/updated_at timestamps
- Soft deletion patterns where appropriate

### For Analytics Tables:
- Time-series data with efficient date range queries
- Aggregation-friendly structures
- Partitioning for large datasets
- Read-optimized with materialized views

### For Social Features:
- Multi-user relationship handling
- Privacy controls with granular RLS
- Activity feed optimization
- Notification system support

### For Configuration Tables:
- Global configuration with admin access
- User preferences with inheritance
- Feature flags and A/B testing support
- Hierarchical configuration patterns

## OUTPUT FORMAT

Please generate:

### 📊 Database Schema

#### Table Definition
```sql
-- Drop existing table if recreating
DROP TABLE IF EXISTS table_name CASCADE;

-- Create table with proper structure
CREATE TABLE table_name (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Business fields
    field1 TEXT NOT NULL,
    field2 INTEGER DEFAULT 0,
    field3 JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

#### Indexes for Performance
```sql
-- User-scoped queries (most common)
CREATE INDEX idx_table_name_user_id ON table_name(user_id);

-- Time-based queries
CREATE INDEX idx_table_name_created_at ON table_name(created_at);

-- Composite indexes for common query patterns
CREATE INDEX idx_table_name_user_date ON table_name(user_id, created_at DESC);

-- Unique constraints where needed
CREATE UNIQUE INDEX idx_table_name_unique_constraint 
ON table_name(user_id, field1);
```

#### Row Level Security Policies
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy for user data isolation
CREATE POLICY "Users can manage their own data" 
ON table_name 
FOR ALL 
USING (user_id = auth.uid());

-- Policy for reading public data (if applicable)
CREATE POLICY "Public data is readable by authenticated users" 
ON table_name 
FOR SELECT 
USING (is_public = true AND auth.role() = 'authenticated');

-- Policy for admin access (if needed)
CREATE POLICY "Admins can access all data" 
ON table_name 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');
```

### 🔧 Database Functions

#### CRUD Functions
```sql
-- Get or create pattern (common for user data)
CREATE OR REPLACE FUNCTION get_or_create_user_record(p_user_id UUID)
RETURNS table_name
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result table_name;
BEGIN
    -- Try to get existing record
    SELECT * INTO result 
    FROM table_name 
    WHERE user_id = p_user_id;
    
    -- Create if doesn't exist
    IF NOT FOUND THEN
        INSERT INTO table_name (user_id, field1, field2)
        VALUES (p_user_id, 'default_value', 0)
        RETURNING * INTO result;
    END IF;
    
    RETURN result;
END;
$$;
```

#### Business Logic Functions
```sql
-- Example: Aggregate user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_count', COUNT(*),
        'avg_per_day', COUNT(*)::FLOAT / p_days,
        'max_streak', calculate_max_streak(p_user_id),
        'last_activity', MAX(created_at)
    ) INTO result
    FROM table_name
    WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
    
    RETURN result;
END;
$$;
```

### 🔄 Real-time Configuration
```sql
-- Enable real-time for table
ALTER PUBLICATION supabase_realtime ADD TABLE table_name;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_table_name_updated_at 
    BEFORE UPDATE ON table_name 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 🧪 Test Data and Validation
```sql
-- Insert test data for development
INSERT INTO table_name (user_id, field1, field2) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'test_value_1', 10),
    ('550e8400-e29b-41d4-a716-446655440002', 'test_value_2', 20);

-- Validate RLS policies work
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "550e8400-e29b-41d4-a716-446655440001"}';

-- Should only return user 1's data
SELECT * FROM table_name;

-- Reset role
RESET ROLE;
```

### 📱 Frontend Integration Examples

#### TypeScript Types
```typescript
// Generated types for frontend use
export interface TableNameRecord {
  id: string;
  user_id: string;
  field1: string;
  field2: number;
  field3?: any;
  created_at: string;
  updated_at: string;
}

export interface TableNameInsert {
  user_id: string;
  field1: string;
  field2?: number;
  field3?: any;
}

export interface TableNameUpdate {
  field1?: string;
  field2?: number;
  field3?: any;
}
```

#### Supabase Client Usage
```typescript
// Get user's data
const getUserData = async (userId: string) => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Real-time subscription
const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
  return supabase
    .channel('user_data_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'table_name',
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe();
};
```

### 🔍 Performance Analysis
```sql
-- Query performance analysis
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM table_name 
WHERE user_id = 'user-id' 
AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Index usage validation
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'table_name';
```

---

**CONSTRAINTS**:
- Must integrate with existing Auth0/users table structure
- Should follow established RLS patterns for user isolation
- Must support real-time subscriptions where needed
- Should optimize for mobile app query patterns
- Must include proper audit trails and timestamps

## 🔄 Migration and Deployment

### Migration Script
```sql
-- Migration: Add new table
-- File: migrations/add_table_name.sql

BEGIN;

-- Create table
-- (Table creation SQL from above)

-- Add foreign key constraints
-- (Constraint SQL from above)

-- Create indexes
-- (Index SQL from above)

-- Set up RLS
-- (RLS policy SQL from above)

-- Create functions
-- (Function SQL from above)

-- Enable real-time
-- (Real-time configuration from above)

COMMIT;
```

### Rollback Script
```sql
-- Rollback: Remove new table
-- File: migrations/rollback_add_table_name.sql

BEGIN;

-- Remove from real-time
ALTER PUBLICATION supabase_realtime DROP TABLE table_name;

-- Drop functions
DROP FUNCTION IF EXISTS get_or_create_user_record(UUID);
DROP FUNCTION IF EXISTS get_user_statistics(UUID, INTEGER);

-- Drop table (cascades policies and triggers)
DROP TABLE IF EXISTS table_name CASCADE;

COMMIT;
```

## 📚 Related Documentation

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Will Counter Database Schema](/shared/database/schema.sql)
- [API Integration Patterns](/docs/claude-prompts/code-generation/kotlin-ktor/api-endpoint.md)

## 💡 Database Design Tips

1. **Start Simple**: Begin with core fields, add complexity later
2. **Index Strategically**: Focus on common query patterns
3. **Security First**: Apply RLS policies from the start
4. **Plan for Scale**: Consider partitioning for large tables
5. **Audit Everything**: Include created_at/updated_at on all tables
6. **Test Policies**: Validate RLS works with real user scenarios