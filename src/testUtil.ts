import { AxiosStatic } from 'axios';

export const mockedAxios: () => AxiosStatic | any = () => {
    const bag: any = {
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
        },
    };
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            resolve('OK');
        }, ms);
    });
};
