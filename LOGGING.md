# Logging with Winston

This project uses Winston for structured logging instead of `console.log`. Winston provides better performance, structured logging, and file output capabilities.

## Usage

### Basic Import
```typescript
import logger from '@/lib/logger';
```

### Log Levels
- `logger.error()` - For errors and exceptions
- `logger.warn()` - For warnings
- `logger.info()` - For general information
- `logger.http()` - For HTTP requests (used by Morgan middleware)
- `logger.debug()` - For debug information (controlled by LOG_LEVEL env var)

### Examples

#### Simple Logging
```typescript
// Instead of console.log
logger.info('User logged in successfully');

// Instead of console.error
logger.error('Failed to connect to database');

// Debug logging (only shown when LOG_LEVEL=debug)
logger.debug('Processing user request', { userId: 'user123', action: 'login' });
```

#### Structured Logging with Metadata
```typescript
logger.info('User action completed', {
  userId: 'user123',
  action: 'login',
  timestamp: new Date().toISOString()
});

logger.error('Database connection failed', {
  error: error.message,
  retryCount: 3,
  endpoint: '/api/users'
});
```

#### API Route Example
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  logger.info('API request received', { 
    method: 'GET', 
    endpoint: '/api/users',
    userId 
  });
  
  if (!userId) {
    logger.warn('Missing required parameter', { parameter: 'userId' });
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }
  
  try {
    const user = await getUser(userId);
    logger.info('User retrieved successfully', { userId });
    return NextResponse.json(user);
  } catch (error) {
    logger.error('Failed to retrieve user', { 
      userId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}
```

## Configuration

### Environment Variable Control
Set the `LOG_LEVEL` environment variable to control logging verbosity:
- `LOG_LEVEL=debug` - All log levels (debug, info, warn, error)
- `LOG_LEVEL=info` - Info, warn, and error levels (default)
- `LOG_LEVEL=warn` - Only warn and error levels
- `LOG_LEVEL=error` - Only error level

### Output Destinations
- **Console**: Colored output for development
- **File**: `logs/all.log` - All log messages
- **File**: `logs/error.log` - Only error messages

### Log Format
```
2024-01-15 14:30:25:123 info: User logged in successfully
2024-01-15 14:30:25:124 error: Database connection failed
```

## Migration from console.log

### Before (console.log)
```typescript
console.log('🔍 API Debug - GET /api/users:', { userId });
console.error('🔍 API Debug - Error:', error);
```

### After (Winston)
```typescript
logger.info('🔍 API Debug - GET /api/users', { userId });
logger.error('🔍 API Debug - Error', { 
  error: error instanceof Error ? error.message : 'Unknown error' 
});
```

## Benefits

1. **Structured Logging**: JSON-like metadata for better parsing
2. **Performance**: Winston is optimized for high-volume logging
3. **File Output**: Automatic log file rotation and management
4. **Environment Awareness**: Different log levels for dev/prod
5. **Color Coding**: Easy-to-read colored output in development
6. **Timestamp**: Automatic timestamp formatting
7. **Error Handling**: Better error object serialization

## Best Practices

1. **Use appropriate log levels**: Don't log everything as info
2. **Include relevant metadata**: Add context like userId, requestId, etc.
3. **Handle errors properly**: Extract error messages for structured logging
4. **Avoid logging sensitive data**: Never log passwords, tokens, etc.
5. **Use consistent message format**: Keep log messages clear and consistent
