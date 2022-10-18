import type { AxiosAuthRefreshOptions } from '../../model';
import { mergeOptions } from '../mergeOptions';

describe('Merges configs', () => {
    it('source and target are the same', () => {
        // Arrange
        const source: AxiosAuthRefreshOptions = { statusCodes: [204] };
        const target: AxiosAuthRefreshOptions = { statusCodes: [204] };

        // Act
        const result = mergeOptions(target, source);

        // Assert
        expect(result).toEqual({ statusCodes: [204] });
    });
    it('source is different than the target', () => {
        // Arrange
        const source: AxiosAuthRefreshOptions = { statusCodes: [302] };
        const target: AxiosAuthRefreshOptions = { statusCodes: [204] };

        // Act
        const result = mergeOptions(target, source);

        // Assert
        expect(result).toEqual({ statusCodes: [302] });
    });

    it('source is empty', () => {
        // Arrange
        const source: AxiosAuthRefreshOptions = {};
        const target: AxiosAuthRefreshOptions = { statusCodes: [204] };

        // Act
        const result = mergeOptions(target, source);

        // Assert
        expect(result).toEqual({ statusCodes: [204] });
    });
});
