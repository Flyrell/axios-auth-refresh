export const sleep = async (ms: number): Promise<string> =>
    new Promise((resolve) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            resolve('OK');
        }, ms);
    });
