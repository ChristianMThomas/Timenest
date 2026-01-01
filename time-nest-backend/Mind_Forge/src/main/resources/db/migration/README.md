# Database Migration Scripts

## Performance Optimization Indexes

These migration scripts add database indexes to improve query performance and reduce resource usage.

### Files
- `V1__add_performance_indexes.sql` - PostgreSQL version
- `V1__add_performance_indexes_mysql.sql` - MySQL/MariaDB version

## How to Apply

### Option 1: Using Flyway (Recommended)

If you're using Flyway for migrations:

1. Add Flyway dependency to `pom.xml` (if not already present):
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

2. Configure Flyway in `application.properties`:
```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

3. Restart the application - Flyway will automatically apply the migration

### Option 2: Manual SQL Execution

#### PostgreSQL:
```bash
psql -U your_username -d your_database -f V1__add_performance_indexes.sql
```

#### MySQL:
```bash
mysql -u your_username -p your_database < V1__add_performance_indexes_mysql.sql
```

### Option 3: Let JPA Auto-Update

Update `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

Restart the application and Hibernate will automatically create the indexes based on the `@Table` annotations in the entity classes.

**Note**: This option is less controlled and may take longer on first startup with large datasets.

## What Gets Created

### TimeLog Table Indexes:
- `idx_active_shift` - Speeds up active shift queries
- `idx_last_location_check` - Speeds up monitoring queries
- `idx_user_active_shift` - Composite index for user shift lookups

### User Table Indexes:
- `idx_email` - Speeds up login queries
- `idx_company_role` - Speeds up executive notification queries

## Expected Performance Improvements

- **Active shift monitoring queries**: 10-100x faster
- **User login**: 5-50x faster (on large user bases)
- **Executive notifications**: 10-50x faster

## Rollback

To remove the indexes if needed:

### PostgreSQL:
```sql
DROP INDEX IF EXISTS idx_active_shift;
DROP INDEX IF EXISTS idx_last_location_check;
DROP INDEX IF EXISTS idx_user_active_shift;
DROP INDEX IF EXISTS idx_email;
DROP INDEX IF EXISTS idx_company_role;
```

### MySQL:
```sql
DROP INDEX idx_active_shift ON timelogs;
DROP INDEX idx_last_location_check ON timelogs;
DROP INDEX idx_user_active_shift ON timelogs;
DROP INDEX idx_email ON users;
DROP INDEX idx_company_role ON users;
```
