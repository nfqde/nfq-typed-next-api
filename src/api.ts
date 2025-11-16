/* eslint-disable @typescript-eslint/no-unsafe-return */
import type {HTTP_METHODS, HTTP_STATUS} from './utils/constants';
import type {NextApiRequest, NextApiResponse} from 'next';

export type TypedRouteType = <
    METHOD extends HTTP_METHODS,
    R extends {
        data?: unknown;
        headers?: Headers | Map<string, number | string | readonly string[]>;
        message?: unknown;
        status: HTTP_STATUS;
        // eslint-disable-next-line no-undef
        stream?: NodeJS.ReadableStream;
    },
    REQUEST extends NextApiRequest = NextApiRequest,
    BODY = undefined,
    QUERY = undefined
>(
    method: METHOD,
    handler: (
        req: REQUEST,
        res: NextApiResponse,
        body: BODY,
        query: QUERY
    ) => Promise<R>
) => (
    req: NextApiRequest,
    res: NextApiResponse,
    method: METHOD,
    body: BODY,
    query: QUERY
) => Promise<R>;

/**
 * Type Throught routes.
 *
 * @param method  The https that must be used.
 * @param handler The route handler.
 * @returns The typed route.
 */
export const TypedRoute: TypedRouteType = (method, handler) => (
    async (req: NextApiRequest, res: NextApiResponse) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const response = await handler(req as any, res, req.body as never, req.query as never);

        res.status(response.status);

        if (response.headers) {
            res.setHeaders(response.headers);
        }

        if (response.stream) {
            response.stream.pipe(res);
            return;
        }

        res.send(response.data ?? response.message);
    }) as any;

/**
 * Makes an TypedRoute compatible with next-connect.
 *
 * @param handler The typed route.
 * @returns The next-connect compatible route.
 */
export const connectable
    = (handler: unknown) => handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;