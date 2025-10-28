import {useMemo} from 'react';

import useSwr, {preload} from 'swr';
import useSwrInfinite from 'swr/infinite';
import useSwrMutation from 'swr/mutation';

import {fetcher, mutationFetcher} from './utils/fetchers';

import type {
    ApiMethod,
    ApiResponse,
    MutationRepositoryOptions,
    MutationRequestOptions,
    RepositoryError,
    RepositoryMethod,
    RepositoryResponse,
    RequestError,
    RequestOptions
} from './utils/fetchers';
import type {BareFetcher, Key, SWRConfiguration} from 'swr';
import type {SWRInfiniteConfiguration, SWRInfiniteKeyLoader, SWRInfiniteResponse} from 'swr/infinite';
import type {SWRMutationConfiguration} from 'swr/mutation';

export type Jsonify<T> = T extends {toJSON(...args: any): infer R} ? Jsonify<R>
    : T extends (infer I)[] ? Jsonify<I>[]
    : T extends (...args: any) => any ? never
    : T extends object ? {
        [K in keyof T]: K extends number | string ? Jsonify<T[K]> : never
    }
    : T;
export type ApiReturn<T extends ApiMethod> = T extends {data: any} ? Jsonify<T['data']> : undefined;

/**
 * Non hook version of api.
 *
 * @param url               API URL.
 * @param props             Request options.
 * @param props.method      Request method.
 * @param props.headers     Request headers.
 * @param props.body        Request body.
 * @param props.credentials The credentials parameter.
 * @returns The api call return value.
 */
export const api = async <T extends ApiMethod>(
    url: string,
    {
        body,
        credentials,
        headers = {},
        method
    }: RequestOptions<T> = {}
): Promise<ApiReturn<Awaited<ReturnType<T>>>> => fetcher<T>(url, {
    body,
    credentials,
    headers,
    method
});

/**
 * Get request hook.
 *
 * @param url        API URL.
 * @param swrOptions SWR options.
 * @returns SWR response.
 */
export const useApi = <T extends ApiMethod>(
    url: string | null,
    swrOptions?: SWRConfiguration<
        Jsonify<ApiResponse<T>['data']>,
        any,
        BareFetcher<Jsonify<ApiResponse<T>['data']>>
    >
) => {
    const {data, error, isLoading, isValidating, mutate}
        = useSwr<Jsonify<ApiResponse<T>['data']>, RequestError<T>>(url ?? null, fetcher, swrOptions);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    };
};

/**
 * Get request hook.
 *
 * @param getKey     SWR key loader.
 * @param swrOptions SWR options.
 * @returns SWR response.
 */
export const useInfiniteApi = <T extends ApiMethod>(
    getKey: SWRInfiniteKeyLoader<ApiResponse<T>['data']>,
    swrOptions?: SWRInfiniteConfiguration<
        Jsonify<ApiResponse<T>['data']>,
        any,
        BareFetcher<Jsonify<ApiResponse<T>['data']>>
    >
) => {
    const {data, error, isLoading, isValidating, mutate, setSize, size}
        = useSwrInfinite<Jsonify<ApiResponse<T>['data']>, RequestError<T>>(getKey, fetcher, swrOptions);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
        setSize,
        size
    } as SWRInfiniteResponse<Jsonify<ApiResponse<T>['data']>, RepositoryError>;
};

type RepositorySwrOptions<T extends RepositoryMethod> =
    SWRConfiguration<RepositoryResponse<T>, RepositoryError, BareFetcher<RepositoryResponse<T>>>
    & {body: Parameters<T>};

/**
 * Get request hook.
 *
 * @param cacheKey      Cache key.
 * @param fetchFunction Fetch function.
 * @param swrOptions    SWR options.
 * @returns SWR response.
 */
export const useRepository = <T extends RepositoryMethod>(
    cacheKey: string | null,
    fetchFunction: BareFetcher<RepositoryResponse<T>>,
    swrOptions?: RepositorySwrOptions<T>
) => {
    const repoFetcher = useMemo(
        () => fetchFunction.bind(null, ...(swrOptions?.body ?? [])),
        [swrOptions?.body, fetchFunction]
    );

    const {data, error, isLoading, isValidating, mutate}
        = useSwr<RepositoryResponse<T>, RepositoryError>(cacheKey ?? null, repoFetcher, swrOptions);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    };
};

/**
 * Get request hook.
 *
 * @param getKey        SWR key loader.
 * @param fetchFunction Fetch function.
 * @param swrOptions    SWR options.
 * @returns SWR response.
 */
export const useInfiniteRepository = <T extends RepositoryMethod>(
    getKey: SWRInfiniteKeyLoader<RepositoryResponse<T>>,
    fetchFunction: BareFetcher<RepositoryResponse<T>>,
    swrOptions?: SWRInfiniteConfiguration<
        RepositoryResponse<T>,
        any,
        BareFetcher<RepositoryResponse<T>>
    >
) => {
    const {data, error, isLoading, isValidating, mutate, setSize, size}
        = useSwrInfinite<RepositoryResponse<T>, RepositoryError>(getKey, fetchFunction, swrOptions);

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
        setSize,
        size
    } as SWRInfiniteResponse<RepositoryResponse<T>, RepositoryError>;
};

/**
 * Get request hook.
 *
 * @param url        API URL.
 * @param swrOptions SWR options.
 * @returns SWR response.
 */
export const useMutateApi = <T extends ApiMethod>(
    url: string | null,
    swrOptions?: SWRMutationConfiguration<Jsonify<ApiResponse<T>['data']>, any> | undefined
) => {
    const {
        data,
        error,
        isMutating,
        reset,
        trigger
    } = useSwrMutation<Jsonify<ApiResponse<T>['data']>, RequestError<T>, Key, MutationRequestOptions<T>>(
        url ?? null,
        mutationFetcher,
        swrOptions
    );

    return {
        data,
        error,
        isMutating,
        reset,
        trigger
    };
};

/**
 * Get request hook.
 *
 * @param cacheKey      Cache key.
 * @param fetchFunction Fetch function.
 * @param swrOptions    SWR options.
 * @returns SWR response.
 */
export const useMutateRepository = <T extends RepositoryMethod>(
    cacheKey: string | null,
    fetchFunction: BareFetcher<RepositoryResponse<T>>,
    swrOptions?: SWRMutationConfiguration<RepositoryResponse<T> | null, any> | undefined
) => {
    const {
        data,
        error,
        isMutating,
        reset,
        trigger
    } = useSwrMutation<RepositoryResponse<T> | null, RepositoryError, Key, MutationRepositoryOptions<T>>(
        cacheKey ?? null,
        fetchFunction,
        swrOptions
    );

    return {
        data,
        error,
        isMutating,
        reset,
        trigger
    };
};

/**
 * Preloads data for a given url.
 *
 * @param url           The url to preload.
 * @param fetchFunction The fetch function to use.
 * @returns A promise that resolves when the data is preloaded.
 */
export const preloadData = async (url: string, fetchFunction?: BareFetcher<any>) => {
    await preload(url, fetchFunction ?? fetcher);
};