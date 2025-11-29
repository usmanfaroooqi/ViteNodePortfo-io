/**
 * Centralized Error Handling Utilities
 * Provides consistent error messaging and handling across the app
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
}

export class ErrorHandler {
  static createError(
    code: string,
    message: string,
    userMessage: string,
    statusCode: number = 500
  ): AppError {
    return {
      code,
      message,
      userMessage,
      statusCode,
    };
  }

  // Network/API Errors
  static networkError(): AppError {
    return this.createError(
      "NETWORK_ERROR",
      "Network request failed",
      "Unable to connect. Please check your internet connection.",
      503
    );
  }

  static apiError(details?: string): AppError {
    return this.createError(
      "API_ERROR",
      `API Error: ${details || "Unknown error"}`,
      "Something went wrong. Please try again.",
      500
    );
  }

  static validationError(field: string): AppError {
    return this.createError(
      "VALIDATION_ERROR",
      `Validation failed for field: ${field}`,
      `Please check your ${field} and try again.`,
      400
    );
  }

  // AI Service Errors
  static aiGenerationError(): AppError {
    return this.createError(
      "AI_GENERATION_ERROR",
      "AI generation service failed",
      "Could not generate content. Please try again or contact support.",
      500
    );
  }

  static aiServiceUnavailable(): AppError {
    return this.createError(
      "AI_SERVICE_UNAVAILABLE",
      "AI service is unavailable",
      "The AI service is temporarily unavailable. Please try again later.",
      503
    );
  }

  static missingApiKey(): AppError {
    return this.createError(
      "MISSING_API_KEY",
      "API key is not configured",
      "Server configuration error. Please contact support.",
      500
    );
  }

  // Timeout Errors
  static timeoutError(): AppError {
    return this.createError(
      "TIMEOUT_ERROR",
      "Request timed out",
      "The request took too long. Please try again.",
      408
    );
  }

  // Parse/Format Errors
  static parseError(detail: string): AppError {
    return this.createError(
      "PARSE_ERROR",
      `Failed to parse response: ${detail}`,
      "Failed to process server response. Please try again.",
      500
    );
  }

  // Input Validation Errors
  static emptyInput(fieldName: string): AppError {
    return this.createError(
      "EMPTY_INPUT",
      `${fieldName} is empty`,
      `Please provide a ${fieldName.toLowerCase()}.`,
      400
    );
  }

  static invalidInput(fieldName: string, reason: string): AppError {
    return this.createError(
      "INVALID_INPUT",
      `Invalid ${fieldName}: ${reason}`,
      `Your ${fieldName.toLowerCase()} is invalid: ${reason}`,
      400
    );
  }

  // Handle fetch responses
  static async handleFetchError(response: Response): Promise<AppError> {
    try {
      const data = await response.json();
      return this.createError(
        "FETCH_ERROR",
        data.error || "Request failed",
        data.error || "Something went wrong. Please try again.",
        response.status
      );
    } catch {
      return this.createError(
        "FETCH_ERROR",
        `HTTP ${response.status}`,
        `Request failed with status ${response.status}. Please try again.`,
        response.status
      );
    }
  }

  // Generic error handler
  static handleError(error: any): AppError {
    // Check if it's already an AppError
    if (error && typeof error === "object" && "code" in error && "userMessage" in error) {
      return error as AppError;
    }

    if (error instanceof TypeError) {
      if (error.message.includes("fetch")) {
        return this.networkError();
      }
      return this.parseError(error.message);
    }

    if (error instanceof Error) {
      return this.apiError(error.message);
    }

    return this.apiError("Unknown error occurred");
  }

  // Log error with context
  static logError(error: AppError, context?: string): void {
    console.error(
      `[${error.code}]${context ? ` (${context})` : ""}:`,
      error.message
    );
  }
}

// Export toast error helper
export const getErrorToastConfig = (error: AppError) => ({
  title: "Error",
  description: error.userMessage,
  variant: "destructive" as const,
});

export const getSuccessToastConfig = (message: string) => ({
  title: "Success",
  description: message,
  variant: "default" as const,
});
