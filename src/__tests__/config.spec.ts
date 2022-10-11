import { AxiosAuthRefreshOptions } from '../model';
import { mergeOptions } from '../utils';

describe('Merges configs', () => {
    it('source and target are the same', () => {
        const source: AxiosAuthRefreshOptions = { statusCodes: [204] };
        const target: AxiosAuthRefreshOptions = { statusCodes: [204] };
        expect(mergeOptions(target, source)).toEqual({ statusCodes: [204] });
    });

    it('source is different than the target', () => {
        const source: AxiosAuthRefreshOptions = { statusCodes: [302] };
        const target: AxiosAuthRefreshOptions = { statusCodes: [204] };
        expect(mergeOptions(target, source)).toEqual({ statusCodes: [302] });
    });

    it('source is empty', () => {
        const source: AxiosAuthRefreshOptions = {};
        const target: AxiosAuthRefreshOptions = { statusCodes: [204] };
        expect(mergeOptions(target, source)).toEqual({ statusCodes: [204] });
    });
});
