export enum ContentTypeEnum {
    // json
    JSON = 'application/json;charset=UTF-8',
    // form-data   上传资源（图片，视频）
    FORM_DATA = 'multipart/form-data;charset=UTF-8'
}

export enum RequestMethodsEnum {
    GET = 'GET',
    POST = 'POST'
}

export enum RequestCodeEnum {
    OK = 0,
    FAIL = 1
}

export enum RequestMessageEnum {
    OK = 'ok', // 成功
    FAIL = 'fail', // 失败
    DISABLE_FEEDBACK = 'disable feedback' // 禁用反馈
}
