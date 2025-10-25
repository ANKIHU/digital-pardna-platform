import { FastifyPluginAsync, FastifyError } from 'fastify';
import { ZodError } from 'zod';

// Custom error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, originalError?: any) {
    super(502, `External service error: ${service}`, 'EXTERNAL_SERVICE_ERROR', originalError);
    this.name = 'ExternalServiceError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(429, message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

// Error handler middleware
const errorHandlerPlugin: FastifyPluginAsync = async (app) => {
  
  // Global error handler
  app.setErrorHandler((error: FastifyError | ApiError | ZodError | Error, request, reply) => {
    const startTime = Date.now();
    const requestId = request.headers['x-request-id'] || generateRequestId();
    
    // Log the error with context
    const errorContext = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };

    if (error instanceof ZodError) {
      // Handle Zod validation errors
      const validationError = {
        statusCode: 400,
        error: 'Validation Error',
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        requestId
      };

      app.log.warn({
        ...errorContext,
        error: validationError,
        validationErrors: error.errors
      }, 'Validation error occurred');

      return reply.status(400).send(validationError);
    }

    if (error instanceof ApiError) {
      // Handle custom API errors
      const apiError = {
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
        requestId
      };

      if (error.statusCode >= 500) {
        app.log.error({
          ...errorContext,
          error: apiError,
          stack: error.stack
        }, 'Server error occurred');
      } else {
        app.log.warn({
          ...errorContext,
          error: apiError
        }, 'Client error occurred');
      }

      return reply.status(error.statusCode).send(apiError);
    }

    // Handle Fastify errors
    if ('statusCode' in error && error.statusCode) {
      const fastifyError = {
        statusCode: error.statusCode,
        error: error.name || 'Error',
        message: error.message,
        code: 'code' in error ? error.code : undefined,
        requestId
      };

      if (error.statusCode >= 500) {
        app.log.error({
          ...errorContext,
          error: fastifyError,
          stack: error.stack
        }, 'Fastify error occurred');
      } else {
        app.log.warn({
          ...errorContext,
          error: fastifyError
        }, 'Fastify client error occurred');
      }

      return reply.status(error.statusCode).send(fastifyError);
    }

    // Handle unexpected errors
    const unexpectedError = {
      statusCode: 500,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : error.message,
      code: 'INTERNAL_SERVER_ERROR',
      requestId
    };

    app.log.error({
      ...errorContext,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, 'Unexpected error occurred');

    return reply.status(500).send(unexpectedError);
  });

  // Request logging middleware
  app.addHook('onRequest', async (request, reply) => {
    const requestId = request.headers['x-request-id'] || generateRequestId();
    request.headers['x-request-id'] = requestId;
    
    app.log.info({
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      timestamp: new Date().toISOString()
    }, 'Request received');
  });

  // Response logging middleware
  app.addHook('onResponse', async (request, reply) => {
    const requestId = request.headers['x-request-id'];
    const duration = reply.getResponseTime();
    
    app.log.info({
      requestId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: Math.round(duration),
      timestamp: new Date().toISOString()
    }, 'Request completed');
  });

  // Health check with error tracking
  app.get('/health', async (request, reply) => {
    try {
      // Add basic health checks here
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        requestId: request.headers['x-request-id']
      };

      return reply.send(health);
    } catch (error) {
      throw new ApiError(503, 'Service unhealthy', 'SERVICE_UNHEALTHY', error);
    }
  });

  // Error reporting endpoint for frontend
  app.post('/errors/report', async (request, reply) => {
    try {
      const errorReport = request.body as {
        message: string;
        stack?: string;
        url?: string;
        userAgent?: string;
        userId?: string;
        timestamp?: string;
      };

      app.log.error({
        type: 'frontend_error',
        requestId: request.headers['x-request-id'],
        ...errorReport,
        reportedAt: new Date().toISOString()
      }, 'Frontend error reported');

      return reply.send({ success: true, reported: true });
    } catch (error) {
      throw new ApiError(500, 'Failed to report error', 'ERROR_REPORTING_FAILED');
    }
  });
};

// Utility functions
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// External service error wrapper
export async function withExternalService<T>(
  serviceName: string,
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors as-is
    }
    throw new ExternalServiceError(serviceName, error);
  }
}

// Retry mechanism for external services
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry failed'); // Should never reach here
}

// Performance monitoring
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(operation: string, requestId?: string): string {
    const key = `${operation}-${requestId || Date.now()}`;
    this.timers.set(key, Date.now());
    return key;
  }

  static end(key: string, logger: any, operation: string): number {
    const startTime = this.timers.get(key);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.timers.delete(key);

    logger.info({
      operation,
      duration,
      timestamp: new Date().toISOString()
    }, 'Performance metric recorded');

    // Alert on slow operations (>5 seconds)
    if (duration > 5000) {
      logger.warn({
        operation,
        duration,
        threshold: 5000
      }, 'Slow operation detected');
    }

    return duration;
  }
}

export default errorHandlerPlugin;