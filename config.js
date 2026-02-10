// LeanCloud 配置
// 请访问 https://console.leancloud.cn 注册并创建应用
// 然后填入你的 AppID 和 AppKey

const LEANCLOUD_CONFIG = {
    appId: 'YOUR_APP_ID_HERE',        // 替换为你的 LeanCloud AppID
    appKey: 'YOUR_APP_KEY_HERE',      // 替换为你的 LeanCloud AppKey
    serverURL: 'https://YOUR_APP_ID.lc-cn-n1-shared.com'  // 替换为你的 API 服务器地址
};

// 如果你还没有 LeanCloud 账号，请按以下步骤操作：
// 1. 访问 https://console.leancloud.cn
// 2. 注册账号（使用手机号即可）
// 3. 创建应用，选择"开发版"（免费）
// 4. 在"设置" -> "应用凭证"中获取 AppID、AppKey 和 API 服务器地址
// 5. 将上面的配置替换为你的实际值

export default LEANCLOUD_CONFIG;
