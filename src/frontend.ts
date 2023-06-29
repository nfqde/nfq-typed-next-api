import {useMemo} from 'react';

import getConfig from 'next/config';
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
import type {SWRInfiniteConfiguration, SWRInfiniteKeyLoader} from 'swr/infinite';
import type {SWRMutationConfiguration} from 'swr/mutation';

type ApiReturn<T extends ApiMethod> = T extends {data: any} ? T['data'] : undefined;

const basePath = (getConfig() as {publicRuntimeConfig?: {basePath?: string}} | undefined)?.publicRuntimeConfig?.basePath
    ?? '';

/**
 * Non hook version of api.
 *
 * @param url           API URL.
 * @param props         Request options.
 * @param props.method  Request method.
 * @param props.headers Request headers.
 * @param props.body    Request body.
 */
export const api = async <T extends ApiMethod>(
    url: string,
    {
        body,
        headers = {},
        method
    }: RequestOptions<T> = {}
): Promise<ApiReturn<Awaited<ReturnType<T>>>> => fetcher<T>(url, {
    body,
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
    swrOptions?: SWRConfiguration<ApiResponse<T>['data'] | null, any, BareFetcher<ApiResponse<T>['data'] | null>>
) => {
    const {data, error, isValidating, mutate}
        = useSwr<ApiResponse<T>['data'], RequestError<T>>(url ? `${basePath}${url}` : null, fetcher, swrOptions);

    return {
        data,
        error,
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
        ApiResponse<T>['data'] | null,
        any,
        BareFetcher<ApiResponse<T>['data'] | null>
    >
) => {
    const {data, error, isValidating, mutate, setSize, size}
        = useSwrInfinite<ApiResponse<T>['data'], RequestError<T>>(getKey, fetcher, swrOptions);

    return {
        data,
        error,
        isValidating,
        mutate,
        setSize,
        size
    };
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

    const {data, error, isValidating, mutate}
        = useSwr<RepositoryResponse<T>, RepositoryError>(cacheKey ?? null, repoFetcher, swrOptions);

    return {
        data,
        error,
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
    const {data, error, isValidating, mutate, setSize, size}
        = useSwrInfinite<RepositoryResponse<T>, RepositoryError>(getKey, fetchFunction, swrOptions);

    return {
        data,
        error,
        isValidating,
        mutate,
        setSize,
        size
    };
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
    swrOptions?: SWRMutationConfiguration<ApiResponse<T>['data'] | null, any> | undefined
) => {
    const {
        data,
        error,
        isMutating,
        reset,
        trigger
    } = useSwrMutation<ApiResponse<T>['data'] | null, RequestError<T>, Key, MutationRequestOptions<T>>(
        url ? `${basePath}${url}` : null,
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
    await preload(fetchFunction ? url : `${basePath}${url}`, fetchFunction ?? fetcher);
};