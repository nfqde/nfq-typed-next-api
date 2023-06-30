import {HTTP_STATUS} from './constants';

import type {HTTP_METHODS} from './constants';

export type ApiReturn = Promise<{data?: unknown; message?: string; status: HTTP_STATUS}>;
export type ApiMethod = (req: never, res: never, method: never, body: never, query: never) => ApiReturn;
export type RepositoryMethod = (key: never, args: MutationRepositoryArgs) => Promise<unknown>;
export type ApiResponse<T extends ApiMethod> = Awaited<ReturnType<T>>;
export type RepositoryResponse<T extends RepositoryMethod> = Awaited<ReturnType<T>>;
export interface RequestError<T extends ApiMethod> extends Error {
    info: ApiResponse<T>['message'];
    status: ApiResponse<T>['status'];
}

export interface RepositoryError extends Error {
    info: string[] | string;
    status: HTTP_STATUS;
}

// eslint-disable-next-line @nfq/no-magic-numbers
export type ApiRequestBody<T extends ApiMethod> = Parameters<T>[3];
// eslint-disable-next-line @nfq/no-magic-numbers
export type ApiRequestMethod<T extends ApiMethod> = Parameters<T>[2];

// eslint-disable-next-line @nfq/no-magic-numbers
export type RepositoryRequestBody<T extends RepositoryMethod>
    = Parameters<T>[1]['arg'] extends {body: any} ? Parameters<T>[1]['arg']['body'] : undefined;
// eslint-disable-next-line @nfq/no-magic-numbers
export type RepositoryRequestMethod<T extends RepositoryMethod>
    = Parameters<T>[1]['arg'] extends {method: any} ? Parameters<T>[1]['arg']['method'] : undefined;

export interface RequestOptions<T extends ApiMethod> {
    body?: ApiRequestBody<T>;
    headers?: Record<string, string>;
    method?: ApiRequestMethod<T>;
}

export type MutationRepositoryArgs = {
    arg: {
        asFormData?: boolean;
        body: never;
        headers?: Record<string, string>;
        method: never;
        query: never;
    };
};

export type MutationRequestOptions<T extends ApiMethod> = {
    asFormData?: boolean;
    headers?: Record<string, string>;
} & (ApiRequestBody<T> extends undefined ? Omit<{body: never}, 'body'> : {body: ApiRequestBody<T>})
& (ApiRequestMethod<T> extends HTTP_METHODS.GET ? Omit<{method: never}, 'method'> : {method: ApiRequestMethod<T>});

export type MutationRepositoryOptions<T extends RepositoryMethod> = {
    asFormData?: boolean;
    headers?: Record<string, string>;
} & (RepositoryRequestBody<T> extends undefined ? Omit<{body: never}, 'body'> : {body: RepositoryRequestBody<T>})
& (
    RepositoryRequestMethod<T> extends HTTP_METHODS.GET
    ? Omit<{method: never}, 'method'> : {method: RepositoryRequestMethod<T>}
);

export type MutationRepoArgs<B, M> = {arg: {body: B; method: M}};

/**
 * The fetcher method for all swr hooks.
 *
 * @param url           The url to fetch.
 * @param props         The request options.
 * @param props.body    The request body.
 * @param props.headers The request headers.
 * @param props.method  The request method.
 */
export const fetcher = async <T extends ApiMethod>(
    url: string,
    {
        body,
        headers = {},
        method
    }: RequestOptions<T> = {}
): Promise<ApiResponse<T>['data']> => {
    const response = await fetch(url, {
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        method: method || body ? 'POST' : 'GET'
    });

    if (response.status >= HTTP_STATUS.BAD_REQUEST) {
        const error = new Error('Something went wrong') as RequestError<T>;

        try {
            const data = await response.json() as ApiResponse<T>['message'];

            error.info = data;
            error.status = response.status;
        } catch {
            error.info = 'Something went wrong';
            error.status = response.status;
        }

        throw error;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await response.json() as ApiResponse<T>['data'];
    } catch {
        // eslint-disable-next-line no-undefined
        return undefined;
    }
};

/**
 * The fetcher method for all swr hooks.
 *
 * @param url               The url to fetch.
 * @param props             The request options.
 * @param props.arg         The 0th argument passed to the trigger.
 * @param props.arg.body    The request body.
 * @param props.arg.headers The request headers.
 * @param props.arg.method  The request method.
 */
export const mutationFetcher = async <T extends ApiMethod>(
    url: string,
    {arg}: {arg: MutationRequestOptions<T>}
): Promise<ApiResponse<T>['data']> => {
    let body: FormData | string | undefined;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...arg.headers
    };

    if ('body' in arg) {
        if (arg.asFormData) {
            body = new FormData();

            for (const key in arg.body as any) {
                if (typeof arg.body[String(key)] !== 'undefined') {
                    if ((arg.body[String(key)] as FileList)[0] instanceof File) {
                        const files = Array.from(arg.body[String(key)] as FileList);

                        // eslint-disable-next-line @typescript-eslint/no-loop-func
                        files.forEach(file => (body as FormData).append(key, file));
                    } else {
                        body.append(key, arg.body[String(key)]);
                    }
                }
            }
        } else {
            body = JSON.stringify(arg.body);
        }
    }

    if (arg.asFormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(url, {
        body,
        headers,
        method: ('method' in arg) ? arg.method : 'GET'
    });

    if (response.status >= HTTP_STATUS.BAD_REQUEST) {
        const error = new Error('Something went wrong') as RequestError<T>;

        try {
            const data = await response.json() as ApiResponse<T>['message'];

            error.info = data;
            error.status = response.status;
        } catch {
            error.info = 'Something went wrong';
            error.status = response.status;
        }

        throw error;
    }

    if (response.status === HTTP_STATUS.NO_CONTENT) {
        // eslint-disable-next-line no-undefined
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json() as ApiResponse<T>['data'];
};