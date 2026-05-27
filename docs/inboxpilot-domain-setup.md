# InboxPilot 網域與子網域設定建議

## 建議主入口

正式產品建議使用：

```txt
https://inboxpilot.carry-digital-nomad.in.net
```

根網域 `carry-digital-nomad.in.net` 建議保留給品牌官網、作品集或之後的 landing page。`inboxpilot` 子網域則專門作為 SaaS 後台入口，使用者、Meta OAuth、Webhook 與付款回傳都會比較清楚。

## DNS 設定

如果部署在 Vercel，建議設定：

```txt
Type: CNAME
Name: inboxpilot
Value: cname.vercel-dns.com
TTL: Auto 或 300
```

如果部署在 Cloud Run，通常會依 Google 提供的 Custom Domain Mapping 設定 CNAME 或 A/AAAA。實際值以 Cloud Run 後台顯示為準。

如果部署在自架 VPS，建議設定：

```txt
Type: A
Name: inboxpilot
Value: 你的伺服器 IPv4
TTL: 300
```

有 IPv6 時再補：

```txt
Type: AAAA
Name: inboxpilot
Value: 你的伺服器 IPv6
TTL: 300
```

## 環境變數

正式站建議設定：

```env
APP_URL="https://inboxpilot.carry-digital-nomad.in.net"
```

如果同時使用本機開發，保留本機 `localhost:3041` 測試即可。系統目前已針對 localhost 做防呆，從 localhost 開啟時 OAuth callback 會使用：

```txt
http://localhost:3041/api/meta/oauth/callback
```

正式網域開啟時則會使用：

```txt
https://inboxpilot.carry-digital-nomad.in.net/api/meta/oauth/callback
```

## Meta Developers 必填網址

Meta App 後台建議加入以下 OAuth Redirect URI：

```txt
https://inboxpilot.carry-digital-nomad.in.net/api/meta/oauth/callback
http://localhost:3041/api/meta/oauth/callback
```

Webhook callback 建議使用：

```txt
https://inboxpilot.carry-digital-nomad.in.net/api/webhooks/meta
```

Data deletion callback：

```txt
https://inboxpilot.carry-digital-nomad.in.net/api/meta/data-deletion
```

Deauthorize callback：

```txt
https://inboxpilot.carry-digital-nomad.in.net/api/meta/deauthorize
```

Privacy Policy：

```txt
https://inboxpilot.carry-digital-nomad.in.net/privacy-policy
```

Terms of Service：

```txt
https://inboxpilot.carry-digital-nomad.in.net/terms-of-service
```

## 建議路線

1. 先把 `inboxpilot` 子網域指向正式部署平台。
2. 等 SSL 憑證簽發完成，確認 `https://inboxpilot.carry-digital-nomad.in.net` 可正常開啟。
3. 將正式 `APP_URL` 改為 `https://inboxpilot.carry-digital-nomad.in.net`。
4. 到 Meta Developers 補上正式 OAuth Redirect URI 與 webhook callback。
5. 用正式網域跑一次 Instagram 新增帳號流程。

這樣根網域可以留給品牌官網，InboxPilot 後台也有清楚獨立的位置。
