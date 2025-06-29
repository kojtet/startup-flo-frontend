import axios, { AxiosError } from "axios";

export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export class ApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public details?: unknown;
  public severity: ErrorSeverity;
  public category: string;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    details?: unknown,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: string = "API"
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.severity = severity;
    this.category = category;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = "A network error occurred. Please check your connection.", originalError?: Error) {
    super(message, 0, "NETWORK_ERROR", originalError, ErrorSeverity.ERROR, "Network");
  }
}

export class ServerError extends ApiError {
  constructor(message: string = "An unexpected server error occurred.", statusCode: number = 500, errorCode?: string, details?: unknown) {
    super(message, statusCode, errorCode || "SERVER_ERROR", details, ErrorSeverity.CRITICAL, "API");
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Authentication failed. Please login again.", errorCode?: string, details?: unknown) {
    super(message, 401, errorCode || "UNAUTHORIZED", details, ErrorSeverity.ERROR, "Authentication");
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "The request was invalid.", errorCode?: string, details?: unknown) {
    super(message, 400, errorCode || "BAD_REQUEST", details, ErrorSeverity.WARNING, "API");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "You do not have permission to perform this action.", errorCode?: string, details?: unknown) {
    super(message, 403, errorCode || "FORBIDDEN", details, ErrorSeverity.ERROR, "Authorization");
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "The requested resource was not found.", errorCode?: string, details?: unknown) {
    super(message, 404, errorCode || "NOT_FOUND", details, ErrorSeverity.WARNING, "API");
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "There was a conflict with the current state of the resource.", errorCode?: string, details?: unknown) {
    super(message, 409, errorCode || "CONFLICT", details, ErrorSeverity.WARNING, "API");
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message: string = "The request was well-formed but could not be processed.", errorCode?: string, details?: unknown) {
    super(message, 422, errorCode || "UNPROCESSABLE_ENTITY", details, ErrorSeverity.WARNING, "API");
  }
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const response = axiosError.response;
    const status = response?.status || 500;
    const data = response?.data as { message?: string; errorCode?: string; details?: unknown; error?: { message?: string; code?: string } };
    
    const message = data?.message || data?.error?.message || axiosError.message || "An unknown API error occurred";
    const errorCode = data?.errorCode || data?.error?.code;
    const details = data?.details;

    switch (status) {
      case 400:
        return new BadRequestError(message, errorCode, details);
      case 401:
        return new UnauthorizedError(message, errorCode, details);
      case 403:
        return new ForbiddenError(message, errorCode, details);
      case 404:
        return new NotFoundError(message, errorCode, details);
      case 409:
        return new ConflictError(message, errorCode, details);
      case 422:
        return new UnprocessableEntityError(message, errorCode, details);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status, errorCode, details);
      default:
        return new ApiError(message, status, errorCode, details);
    }
  } else if (error instanceof Error && (error.message.toLowerCase().includes("network error") || error.message.toLowerCase().includes("timeout"))) {
    return new NetworkError(error.message, error);
  } else if (error instanceof ApiError) {
    return error;
  }
  
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
  return new ApiError(errorMessage, 500, "UNKNOWN_ERROR", error instanceof Error ? error : undefined);
}

export const createApiError = (error: Error | unknown, defaultMessage?: string): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || defaultMessage || "An error occurred";
    return new ApiError(message, status, error.response?.data);
  }
  
  const message = error instanceof Error ? error.message : defaultMessage || "An unknown error occurred";
  return new ApiError(message, 500);
};
