import type { AxiosAuthRefreshError } from '../model';

interface IMockParam extends Partial<Omit<AxiosAuthRefreshError, 'response'>> {
    response?: Partial<AxiosAuthRefreshError['response']>;
}

export const createAxiosAuthRefreshErrorMock = ({ response, ...mock }: IMockParam): AxiosAuthRefreshError => ({
    response: { data: {}, status: 0, statusText: '', headers: {}, config: {}, ...response },
    config: {},
    isAxiosError: false,
    toJSON: jest.fn(),
    name: '',
    message: '',
    ...mock,
});
