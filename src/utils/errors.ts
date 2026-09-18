export class BusinessError extends Error {
    code?: string
    data?: any

    constructor(message: string, code?: string, data?: any) {
        super(message)
        this.name = 'BusinessError'
        this.code = code
        this.data = data
    }
}

// 实现exception函数
export function exception(message: string, code?: string, data?: any): never {
    throw new BusinessError(message, code, data)
}
