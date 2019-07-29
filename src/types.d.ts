export interface AxiosAuthRefreshOptions {
    statusCodes?: Array<number>
}

export interface AxiosAuthRefreshCache {
    refreshCall: Promise<any>|undefined,
    requestQueueInterceptorId: number|undefined
}
