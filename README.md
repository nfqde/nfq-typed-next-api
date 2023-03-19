<div id="top"></div>

# @nfq/typed-next-api

[![EsLint](https://github.com/nfqde/nfq-typed-next-api/actions/workflows/eslint.yml/badge.svg)](https://github.com/nfqde/nfq-typed-next-api/actions/workflows/eslint.yml)

---

1. [Description](#description)
2. [Getting started](#getting-started)
    1. [Installation](#installation)
    2. [PeerDependencies](#peerdependencies)
3. [Usage](#usage)
    1. [Api Routes File Structure](#api-routes-file-structure)
        1. [An Get Request](#an-get-request)
        2. [An Post Request](#an-post-request)
        3. [Without anything](#without-anything)
        4. [Returning an error](#returning-an-error)
    2. [Frontend Usage](#frontend-usage)
        1. [useApi](#useapi)
        2. [useMutateApi](#usemutateapi)
        3. [api](#api)
        4. [preloadData](#preloaddata)
4. [Props](#props)
    1. [TypedRoute](#typedroute-props)
    2. [connectable](#connectable-props)
    3. [api](#api-props)
    4. [useMutateApi](#usemutateapi-props)
    5. [preloadData](#preloaddata-props)
5. [Provided enums](#provided-enums)
    1. [HTTP_METHODS](#http_methods)
    2. [HTTP_STATUS](#http_status)
6. [Support](#support)

---

## Description: [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an package to create typed api routes for next.js. It helps with getting the contract between your nextjs api and the frontend in sync. It also helps with the typing of the api routes, the return types, the request types and body and query types.

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Getting started

To setup the project locally follow the next steps:

### Installation

To install the package run
```sh
npm install @nfq/typed-next-api
```
if you are on yarn
```sh
yarn add @nfq/typed-next-api
```
or on pnpm
```sh
pnpm install @nfq/typed-next-api
```
   
### PeerDependencies:

The following PeerDependencies are needed so the module does work:

- next >= 12.0.0
- typescript >= 4.9.5

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Usage

Using the typed routes is simple. First you have to create your api routes. You can do this by creating a file in the api folder of your nextjs project. The file should have the following structure:

### **Api Routes File Structure:**
#### **An Get Request:**
```ts
import {connectable, HTTP_METHODS, HTTP_STATUS, TypedRoute} from '@nfq/typed-next-api';
import nextConnect from 'Server/nextConnect';

// This is the type of your query params.
interface QueryType {
  page: string;
}

export const getRequestName = TypedRoute(HTTP_METHODS.GET, async (req: NextApiRequest, res: NextApiResponse, body: unknown, query: QueryType) => {
    // you can directly access the query params here.
    const {page} = query;

    // youre route code here.

    /**
     * Your return Value is what gets typed in the frontend. It should be an
     * object with a status and a data property.
     */
    return {
        data: {
        // your response body here.
        },
        status: HTTP_STATUS.OK
    };
};

/**
 * To get no typing errors you have to wrap your route with the connectable
 * function.
 */
export default nextConnect().get(connectable(getRequestName));
```

#### **An Post Request:**
```ts
import {connectable, HTTP_METHODS, TypedRoute} from '@nfq/typed-next-api';
import nextConnect from 'Server/nextConnect';

// This is the type of your body params.
interface BodyType {
  page: string;
}

export const postRequestName = TypedRoute(HTTP_METHODS.POST, async (req: NextApiRequest, res: NextApiResponse, body: BodyType) => {
    // you can directly access the body params here.
    const {page} = body;

    // youre route code here.

    /**
     * Your return Value is what gets typed in the frontend. It should be an
     * object with a status and a data property.
     */
    return {
        data: {
        // your response body here.
        },
        status: HTTP_STATUS.CREATED
    };
};

/**
 * To get no typing errors you have to wrap your route with the connectable
 * function.
 */
export default nextConnect().post(connectable(postRequestName));
```

#### **Without anything:**
```ts
import {connectable, HTTP_METHODS, TypedRoute} from '@nfq/typed-next-api';
import nextConnect from 'Server/nextConnect';

export const getRequestName = TypedRoute(HTTP_METHODS.POST, async () => {
    // youre route code here.

    /**
     * Your return Value is what gets typed in the frontend. It should be an
     * object with a status and a data property.
     */
    return {
        data: {
        // your response body here.
        },
        status: HTTP_STATUS.OK
    };
};

/**
 * To get no typing errors you have to wrap your route with the connectable
 * function.
 */
export default nextConnect().get(connectable(getRequestName));
```

#### **Returning an error:**
```ts
import {connectable, HTTP_METHODS, TypedRoute} from '@nfq/typed-next-api';
import nextConnect from 'Server/nextConnect';

export const getRequestName = TypedRoute(HTTP_METHODS.POST, async () => {
    // youre route code here.

    /**
     * Your return Value is what gets typed in the frontend. It should be an
     * object with a status and a message property if you want to transport
     * an error in the frontend.
     */
    return {
        message: 'This is an error message',
        status: HTTP_STATUS.NOT_FOUND
    };
};

/**
 * To get no typing errors you have to wrap your route with the connectable
 * function.
 */
export default nextConnect().get(connectable(getRequestName));
```

This will create a typed route for the frontend. That can be used to get usage hints in your application.

To use your typed route in your frontend you have 4 functions for that.

### **Frontend Usage:**

#### **useApi:**

This hook fetches your data and returns the data, error and isValidating state. The mutate function is the same as the mutate function from useSWR.
```ts
import {useApi} from '@nfq/typed-next-api';
import {getRequestName} from 'pages/api/getRequestName';

const DataLoadingComponent = () => {
    const {data, error, isValidating, mutate} = useApi<typeof getRequestName>('the api route path');
    
    // Is true if your data is loading right now.
    if (isValidating) {
        return <div>Loading...</div>;
    }
    
    // An error object holding two properties: info and status.
    if (error) {
        return <div>Error: {error.info}</div>;
    }
    
    // The response data from your api routes data property.
    return <div>{data}</div>;
};
```

#### **useMutateApi:**

This hook prepares an request for later usage. You can use the trigger function to trigger the request. The reset function resets the state of the hook. The mutate function is the same as the mutate function from useSWR.
```ts
import {HTTP_METHODS, useMutateApi} from '@nfq/typed-next-api';
import {postRequestName} from 'pages/api/postRequestName';

const DataLoadingComponent = () => {
    const {data, error, isMutating, reset, trigger} = useMutateApi<typeof postRequestName>('the api route path');
    
    const triggerRequest = () => {
        trigger({
            /**
             * The body params of your request. This is only available if an 
             * body type is defined in your route.
             */
            asFormData: false,
            /**
             * The body params of your request. This is only available if an 
             * body type is defined in your route.
             */
            body: {page: '1'},
            // The headers of your request.
            headers: {'Content-Type': 'application/json'},
            /**
             * The method to use. This is forced to be the same as the method
             * defined in your route.
             */
            method: HTTP_METHODS.POST,
            /**
             * The query params of your request. This is only available if an
             * query type is defined in your route.
             */
            query: {page: '1'}
        });
    };

    // Is true if your data is sending right now.
    if (isMutating) {
        return <div>Loading...</div>;
    }
    
    // An error object holding two properties: info and status.
    if (error) {
        return <div>Error: {error.info}</div>;
    }
    
    // The response data from your api routes data property.
    return <div>{data}</div>;
};
```

#### **api:**

This function is the same as useApi with the difference that it can be used outside of react. It returns a promise with the data or an error object.
```ts
import {api} from '@nfq/typed-next-api';
import {postRequestName} from 'pages/api/postRequestName';

const normalFunction = async () => {
    const data = await api<typeof postRequestName>(
        'the api route path',
        {
            body: {page: '1'},
            headers: {'Content-Type': 'application/json'},
            method: HTTP_METHODS.POST
        }
    );

    // The response data from your api routes data property.
    return data;
};
```

#### **preloadData:**

This function does not use your type information but is usefull to preload data needed later on.
```ts
import {preloadData, useApi} from '@nfq/typed-next-api';
import {getRequestName} from 'pages/api/getRequestName';

void preloadData('the api route path');

const DataLoadingComponent = () => {
    const {data, error, isValidating, mutate} = useApi<typeof getRequestName>('the api route path');
    
    // Never true because data is already loaded.
    if (isValidating) {
        return <div>Loading...</div>;
    }
    
    // An error object holding two properties: info and status.
    if (error) {
        return <div>Error: {error.info}</div>;
    }
    
    // The response data is already loaded.
    return <div>{data}</div>;
};
```

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Props

### TypedRoute Props
| Param         | type             | required | Description                                                                                                               |
| ------------- | ---------------- | :------: | ------------------------------------------------------------------------------------------------------------------------- |
| method        | HTTP_METHODS     | [x]      | One of the provided HTTP_METHODS enum types.                                                                              |
| routeHandler  | Function         | [x]      | An route handler function getting an req, res, body and query object. (Typings get defined through the last two objects.) |

### connectable Props
| Param              | type             | required | Description                                                                                                    |
| ------------------ | ---------------- | :------: | -------------------------------------------------------------------------------------------------------------- |
| typedRouteFunction | TypedRoute       | [x]      | And route handler defined through the TypedRoute function. (Effectively the return of the TypedRoute function) |

### api Props
| Param           | type         | required | Description                                                                                       |
| --------------- | ------------ | :------: | ------------------------------------------------------------------------------------------------- |
| url             | String       | [x]      | The api url.                                                                                      |
| options         | Object       |          | An options object with the following options:                                                     |
| options.body    | Object       |          | The body data for this route. Only applicable if an body is required in the handler function.     |
| options.headers | Object       |          | An headers object to customize the headers send to the server.                                    |
| options.method  | HTTP_METHODS |          | One of the provided HTTP_METHODS enum types. Has to match the provided type defined in the route. |

### useApi Props
| Param           | type   | required | Description                                                                                                             |
| --------------- | ------ | :------: | ----------------------------------------------------------------------------------------------------------------------- |
| url             | String | [x]      | The api url.                                                                                                            |
| swrOptions      | Object |          | The useSwr options object more information on that can get read at: [SWR Docs](https://swr.vercel.app/docs/api#options) |
| typeParam       | type   |          | The type of the route handler function. This is used to define the return type of the hook.                             |

### useMutateApi Props
| Param           | type   | required | Description                                                                                                                               |
| --------------- | ------ | :------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| url             | String | [x]      | The api url.                                                                                                                              |
| swrOptions      | Object |          | The useSwrMutation options object more information on that can get read at: [SWR Docs](https://swr.vercel.app/docs/mutation#parameters-1) |
| typeParam       | type   |          | The type of the route handler function. This is used to define the return type of the hook.                                               |

### preloadData Props
| Param           | type   | required | Description                                                                                                             |
| --------------- | ------ | :------: | ----------------------------------------------------------------------------------------------------------------------- |
| url             | String | [x]      | The api url.                                                                                                            |

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Provided enums

### HTTP_METHODS
| Key     | Value   |
| ------- | ------- |
| DELETE  | DELETE  |
| GET     | GET     |
| OPTIONS | OPTIONS |
| PATCH   | PATCH   |
| POST    | POST    |
| PUT     | PUT     |

### HTTP_STATUS
| Key                             | Value |
| ------------------------------- | ----- |
| CONTINUE                        | 100   |
| SWITCHING_PROTOCOLS             | 101   |
| PROCESSING                      | 102   |
| EARLY_HINTS                     | 103   |
| OK                              | 200   |
| CREATED                         | 201   |
| ACCEPTED                        | 202   |
| NON_AUTHORITATIVE               | 203   |
| NO_CONTENT                      | 204   |
| RESET_CONTENT                   | 205   |
| PARTIAL_CONTENT                 | 206   |
| MULTI_STATUS                    | 207   |
| ALREADY_REPORTED                | 208   |
| IM_USED                         | 226   |
| MULTIPLE_CHOICES                | 300   |
| MOVED_PERMANENTLY               | 301   |
| FOUND                           | 302   |
| SEE_OTHER                       | 303   |
| NOT_MODIFIED                    | 304   |
| TEMPORARY_REDIRECT              | 307   |
| PERMANENT_REDIRECT              | 308   |
| BAD_REQUEST                     | 400   |
| UNAUTHORIZED                    | 401   |
| PAYMENT_REQUIRED                | 402   |
| FORBIDDEN                       | 403   |
| NOT_FOUND                       | 404   |
| METHOD_NOT_ALLOWED              | 405   |
| NOT_ACCEPTABLE                  | 406   |
| PROXY_AUTH_REQUIRED             | 407   |
| REQUEST_TIMEOUT                 | 408   |
| CONFLICT                        | 409   |
| GONE                            | 410   |
| LENGTH_REQUIRED                 | 411   |
| PRECONDIRTION_FAILED            | 412   |
| PAYLOAD_TOO_LARGE               | 413   |
| URI_TOO_LONG                    | 414   |
| UNSUPPORTED_MEDIA_TYPE          | 415   |
| RANGE_NOT_SATISFIABLE           | 416   |
| EXPECTATION_FAILED              | 417   |
| IM_A_TEAPOT                     | 418   |
| MISDIRECTED_REQUEST             | 421   |
| UNPROCESSABLE_CONTENT           | 422   |
| LOCKED                          | 423   |
| FAILED_DEPENDENCY               | 424   |
| TOO_EARLY                       | 425   |
| UPGRADE_REQUIRED                | 426   |
| PRECONDITION_REQUIRED           | 428   |
| TOO_MANY_REQUESTS               | 429   |
| REQUEST_HEADER_FIELDS_TOO_LARGE | 431   |
| UNAVAILABLE_FOR_LEGAL_REASONS   | 451   |
| INTERNAL_SERVER_ERROR           | 500   |
| NOT_IMPLEMENTED                 | 501   |
| BAD_GATEWAY                     | 502   |
| SERVICE_UNAVAILABLE             | 503   |
| GATEWAY_TIMEOUT                 | 504   |
| HTTP_VERSION_NOT_SUPPORTED      | 505   |
| VARIANT_ALSO_NEGOTIATES         | 506   |
| INSUFFICIENT_STORAGE            | 507   |
| LOOP_DETECTED                   | 508   |
| NOT_EXTENDED                    | 510   |
| NETWORK_AUTHENTICATION_REQUIRED | 511   |

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Support

Christoph Kruppe - [https://github.com/ckruppe] - c.kruppe@nfq.de  

<p align="right">(<a href="#top">back to top</a>)</p>