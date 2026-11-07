# 石榴清单 Android 更新发布

当前版本：1.1.0（versionCode 2），Android 8.0 及以上。

[下载安装包](https://raw.githubusercontent.com/chatgptchongzhi/chatgpt-plus-guide/main/apps/shiliu/shiliu-1.1.0.apk)

安装 1.1.0 后，点击应用右上角「检查更新」。有新版时显示更新说明，点击「下载新版」通过浏览器下载，随后手动打开 APK 覆盖安装。1.0.0 没有更新入口，需要先手动安装本版本。不需要登录 ChatGPT。

任务仍保存在手机本地，更新前建议导出备份，不要先卸载。只有手动检查更新和下载时需要联网。编译、版本判断和签名校验已通过，尚未完成安卓真机验证。

## 后续发布

- 保持 packageName `shop.wokee.shiliu` 和原有签名证书，提高 versionCode。
- 使用新文件名上传签名 APK，保留旧安装包。
- 更新本目录 latest.json：versionCode、versionName、minSdk、apkUrl、sha256、notes、publishedAt。
- APK 和 latest.json 应一起提交；确认两者公开访问成功且 SHA-256 匹配。
- latest.json 的固定地址已内置到应用中，不要移动或改名。
- 应用按 versionCode 判断版本，不按版本名称字符串排序。APK 下载交给浏览器；系统安装器验证签名。JSON 中 sha256 用于发布校验，当前客户端不负责下载文件或校验下载后的哈希。
- 签名密钥和密码仅保存在本地，不得上传本仓库。
