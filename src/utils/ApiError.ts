import type {ApiMethod, ApiResponse} from './fetchers';

/**
 * Defines an error class for handling API errors across different endpoints.
 * This class is a generic extension of JavaScript's native `Error` object, tailored to capture
 * and convey detailed information about errors encountered during API operations. It includes
 * the HTTP status code of the failed request and a message describing the error. This makes it
 * easier to debug and handle API-related errors by providing structured and meaningful information
 * about what went wrong. The class is generic, allowing it to adapt to different API methods and their
 * respective error information, thereby enhancing type safety and consistency in error handling.
 *
 * @template T - A generic type parameter that extends `ApiMethod`, indicating the API method associated with the error. This allows the class to be used with various types of API responses, ensuring that the error handling is tailored to the specific API call.
 */
export class ApiError<T extends ApiMethod> extends Error {
    /**
     * Constructs an `ApiError` instance for capturing and handling API-related errors.
     * This constructor initializes the `ApiError` with a specific HTTP status code and a descriptive
     * message about the error. It enhances the standard `Error` by adding specific properties relevant
     * to API operations, such as the HTTP status code and a detailed error message. This makes the error
     * more informative and useful for debugging and error handling in API interactions. The constructor
     * ensures that all instances of `ApiError` will have structured and relevant information about the
     * API error encountered, aiding in quicker resolution and better error reporting.
     *
     * @param status The HTTP status code associated with the API error. This code provides a quick indication of what type of error occurred (e.g., 404 for Not Found, 500 for Internal Server Error), facilitating easier handling of different error scenarios.
     * @param info   A descriptive message about the error. This message can provide additional details about the error, such as what went wrong and why, making it easier for developers to understand and address the issue.
     */
    constructor(readonly status: ApiResponse<T>['status'], readonly info: ApiResponse<T>['message']) {
        super(`Api request failed with status: ${status}`);
        this.name = 'ApiError';
    }
}