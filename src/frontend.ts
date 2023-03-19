import getConfig from 'next/config';
import useSwr, {preload} from 'swr';
import useSWRMutation from 'swr/mutation';

import {fetcher, mutationFetcher} from './utils/fetchers';

import type {ApiMethod, ApiResponse, MutationRequestOptions, RequestError, RequestOptions} from './utils/fetchers';
import type {BareFetcher, Key, SWRConfiguration} from 'swr';
import type {SWRMutationConfiguration} from 'swr/mutation';

const {publicRuntimeConfig: {basePath = ''}}
    = getConfig() as {publicRuntimeConfig: {basePath?: string}} | undefined
    ?? {publicRuntimeConfig: {basePath: ''}};

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
): Promise<ApiResponse<T>['data']> => fetcher<T>(url, {
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
        data: data.data as ApiResponse<T>['data'] || data,
        error,
        isValidating,
        mutate
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
    } = useSWRMutation<ApiResponse<T>['data'] | null, RequestError<T>, Key, MutationRequestOptions<T>>(
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
 * Preloads data for a given url.
 *
 * @param url The url to preload.
 * @returns A promise that resolves when the data is preloaded.
 */
export const preloadData = async (url: string) => {
    await preload(`${basePath}${url}`, fetcher);
};