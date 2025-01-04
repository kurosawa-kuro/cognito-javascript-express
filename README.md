# Cognito JavaScript Express サンプルアプリケーション

## 環境構築

### 前提条件
- Node.js
- npm
- AWS アカウント
- AWS Cognito User Pool の設定

### インストール
```bash
npm i
```

### 環境変数の設定
以下の環境変数を設定してください：

```bash
# AWS設定
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=AKIAW CJQFK
AWS_SECRET_ACCESS_KEY=cEfpcO9svJt 1WGHqgFlCit

# Cognito設定
COGNITO_USER_POOL_ID=ap-northeast-1_D8l84bvZy
COGNITO_CLIENT_ID=4lr90c7 3k6r5rc8
COGNITO_CLIENT_SECRET=1234567890 3456789012
```

### アプリケーションの起動
```bash
npx ts-node src/app.ts
```

## API エンドポイント

### 1. サインアップ
新規ユーザーを登録します。

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123!"}'
```

### 2. サインアップ確認
確認コードを使用してユーザー登録を完了します。

```bash
curl -X POST http://localhost:3000/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "code": "123456"}'
```

### 3. サインイン
登録済みユーザーでログインします。

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "Password123!"}'
```

### 4. 保護されたリソースへのアクセス
認証が必要なAPIにアクセスします。

```bash
curl -X GET http://localhost:3000/auth/protected \
  -H "Authorization: Bearer eyJraWQiOi     GJZcQPjs_g"
```

### 5. ログアウト
セッションを終了します。

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJraWQiOiJZVWM0cG4xaTNBUX lp5IiwiY2xpZW50X2lkIj
"
```


