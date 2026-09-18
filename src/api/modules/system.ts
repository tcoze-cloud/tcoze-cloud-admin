import config from '@/config'
import { http } from './../request'

export default {
    tool: {
        refreshCache: {
            url: `${config.API_URL}/setting/refresh-cache`,
            name: '强制刷新缓存',
            get: async function () {
                return http.get(this.url)
            }
        }
    }
}
