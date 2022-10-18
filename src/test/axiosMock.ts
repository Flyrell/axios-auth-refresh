import type { AxiosStatic } from 'axios';

interface IBag {
    request: Array<number>;
    response: Array<number>;
    has: (type: 'request' | 'response', id: number) => boolean;
}

type TInterceptors = AxiosStatic['interceptors'];
interface IInterceptors extends TInterceptors {
    has: IBag['has'];
}

interface IAxiosMock extends Omit<AxiosStatic, 'interceptors'> {
    interceptors: IInterceptors;
}

export const axiosMock = (): IAxiosMock => {
    const bag: IBag = {
        request: [],
        response: [],
        has: jest.fn((type: 'request' | 'response', id: number) => bag[type].includes(id)),
    };

    return {
        interceptors: {
            request: {
                use: jest.fn(() => {
                    const i = Math.random();
                    bag.request.push(i);
                    return i;
                }),
                eject: jest.fn((i) => {
                    bag.request = bag.request.filter((n: any) => n !== i);
                }),
            },
            response: {
                use: jest.fn(() => {
                    const i = Math.random();
                    bag.response.push(i);
                    return i;
                }),
                eject: jest.fn((i) => {
                    bag.response = bag.response.filter((n: any) => n !== i);
                }),
            },
            has: bag.has,
        },
        defaults: {
            params: {},
            headers: {
                common: {},
                delete: {},
                get: {},
                head: {},
                post: {},
                put: {},
                patch: {},
            },
        },

        request: jest.fn(),
        create: jest.fn(),
        Cancel: jest.fn(),
        CancelToken: null as any,
        Axios: jest.fn(),
        VERSION: '',
        isCancel: jest.fn(),
        all: jest.fn(),
        spread: jest.fn(),
        isAxiosError: null as any,
        getUri: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        head: jest.fn(),
        options: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        postForm: jest.fn(),
        putForm: jest.fn(),
        patchForm: jest.fn(),
    };
};
