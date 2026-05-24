# Clipboard Sync

一个现代化的跨设备剪贴板 MVP。电脑和手机打开同一个网站，输入相同的 4 位数字代码后即可进入同一个同步房间，实时互传文本、链接、图片和文件。

## 功能

- 4 位数字代码连接设备，无账号、无密码
- 同房间实时同步文本、链接、图片和文件
- 支持拖拽上传文件、点击上传文件、输入区粘贴图片上传
- 支持历史记录持久化，刷新后记录仍在
- 支持一键复制文本、下载图片/文件、删除单条记录、清空房间记录
- 显示当前代码和在线设备数量
- 深色主题、毛玻璃卡片、渐变背景、响应式移动端底部操作栏

## 项目结构

```text
clipboard-sync/
  client/
    src/
      components/
      hooks/
      pages/
      utils/
  server/
    src/
    uploads/
    data/
  package.json
  README.md
```

## 本地运行

后端：

```bash
cd server
npm install
npm run dev
```

前端：

```bash
cd client
npm install
npm run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:4000

## Windows 桌面版 exe

已经支持打包成 Windows 便携版桌面应用。打包命令：

```bash
cd clipboard-sync
npm install
npm run dist:win
```

生成文件：

```text
release/copy.exe
```

双击这个 exe 后，它会自动启动内置后端和桌面窗口，不需要再手动运行 `server` 和 `client` 两个命令。

桌面版默认使用一个端口：

- 电脑本机：http://localhost:4000
- 手机访问：http://电脑局域网IP:4000

例如电脑 IP 是 `10.81.139.154`，手机访问：

```text
http://10.81.139.154:4000
```

注意：桌面版 exe 必须在电脑上保持打开，手机才能访问和同步。关闭 exe 后，局域网服务也会停止。

## 局域网手机访问

1. 确保电脑和手机在同一个 Wi-Fi。
2. 在电脑上查看局域网 IP：

   Windows PowerShell：

   ```powershell
   ipconfig
   ```

   找到类似 `IPv4 地址 . . . . . . . . . . . . : 192.168.x.x`。

3. 前端 Vite 已配置监听 `0.0.0.0`，手机浏览器访问：

   ```text
   http://192.168.x.x:5173
   ```

4. 如果使用开发模式，后端默认运行在电脑的 `4000` 端口，前端会自动连接：

   ```text
   http://192.168.x.x:4000
   ```

   如果使用桌面版 exe，手机可以直接访问：

   ```text
   http://192.168.x.x:4000
   ```

如果手机打不开，请检查 Windows 防火墙是否允许 Node.js 或 4000/5173 端口的局域网访问。

## 房间代码规则

- 代码必须是 `0000` 到 `9999` 的 4 位数字。
- 输入相同代码的设备进入同一个房间。
- 不同代码之间数据隔离。
- 当前代码会保存在浏览器本地，刷新后自动回到原房间。
- 点击“更换代码”会断开连接并回到配对页面。

## 上传限制

- 单个文件最大 100MB
- 图片会直接预览，其他文件会显示文件名、大小和下载按钮
- 文件保存在 `server/uploads`
- 历史记录保存在 `server/data/db.json`

## 可选环境变量

后端：

```bash
PORT=4000 npm run dev
```

前端：

```bash
VITE_API_URL=http://192.168.x.x:4000 npm run dev
```

通常不需要设置 `VITE_API_URL`，前端会自动使用当前访问主机名拼接 `:4000`。

## 后续可扩展功能

- 6 位或 8 位房间码，降低公网重复概率
- 房间密码、过期房间、一次性配对码
- 用户账号、多设备管理、设备命名
- E2E 端到端加密
- 文件预览增强，例如 PDF、音频、视频在线播放
- 剪贴板内容搜索、收藏、标签
- 自动清理过期历史和上传文件
- PWA 安装到桌面和手机主屏
- Docker 一键部署
