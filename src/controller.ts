import { 
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { Request, Response } from 'express';
import crypto from 'crypto';
import { cognitoClient } from './app';

const clientId = process.env.COGNITO_CLIENT_ID as string;
const clientSecret = process.env.COGNITO_CLIENT_SECRET as string;

// ユーティリティ関数
const generateSecretHash = (username: string): string => {
  const message = username + clientId;
  const hmac = crypto.createHmac('SHA256', clientSecret);
  return hmac.update(message).digest('base64');
};

const generateUsername = (email: string): string => {
  if (!email) {
    throw new Error('メールアドレスが提供されていません');
  }
  return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
};

const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (password.length < 8) {
    return { isValid: false, error: 'パスワードは8文字以上である必要があります' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'パスワードには少なくとも1つの大文字を含める必要があります' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'パスワードには少なくとも1つの小文字を含める必要があります' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'パスワードには少なくとも1つの数字を含める必要があります' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'パスワードには少なくとも1つの記号を含める必要があります' };
  }
  return { isValid: true };
};

// コントローラー関数
export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { password, email } = req.body;

  if (!password || !email) {
    res.status(400).json({ 
      message: 'ユーザー登録に失敗しました', 
      error: 'password, emailは必須です' 
    });
    return;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    res.status(400).json({
      message: 'ユーザー登録に失敗しました',
      error: passwordValidation.error
    });
    return;
  }

  try {
    const username = generateUsername(email);
    const command = new SignUpCommand({
      ClientId: clientId,
      Username: username,
      Password: password,
      SecretHash: generateSecretHash(username),
      UserAttributes: [{ Name: 'email', Value: email }],
    });

    const data = await cognitoClient.send(command);
    res.status(200).json({ 
      message: 'ユーザー登録が成功しました', 
      data,
      username,
      email
    });
  } catch (error: any) {
    let errorMessage = 'ユーザー登録に失敗しました';
    if (error.name === 'UsernameExistsException') {
      errorMessage = 'このメールアドレスは既に登録されています';
    }
    
    res.status(400).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
};

export const confirmSignUp = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({
      message: 'ユーザー確認に失敗しました',
      error: 'メールアドレスと確認コードは必須です'
    });
    return;
  }

  try {
    const username = generateUsername(email);
    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: code,
      SecretHash: generateSecretHash(username),
    });

    const data = await cognitoClient.send(command);
    res.status(200).json({ 
      message: 'ユーザー確認が成功しました', 
      data,
      username,
      email
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'ユーザー確認に失敗しました', 
      error: error.message 
    });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: 'サインインに失敗しました',
      error: 'メールアドレスとパスワードは必須です'
    });
    return;
  }

  try {
    const username = generateUsername(email);
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: generateSecretHash(username),
      },
    });

    const data = await cognitoClient.send(command);
    res.status(200).json({ 
      message: 'サインインが成功しました', 
      data,
      username,
      email
    });
  } catch (error: any) {
    let errorMessage = 'サインインに失敗しました';
    if (error.name === 'NotAuthorizedException') {
      errorMessage = 'メールアドレスまたはパスワードが正しくありません';
    } else if (error.name === 'UserNotConfirmedException') {
      errorMessage = 'メールアドレスが確認されていません';
    }
    
    res.status(400).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ 
      message: 'ログアウトに失敗しました', 
      error: 'トークンが提供されていません' 
    });
    return;
  }

  try {
    const command = new GlobalSignOutCommand({
      AccessToken: token,
    });

    await cognitoClient.send(command);
    res.status(200).json({ message: 'ログアウトが成功しました' });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'ログアウトに失敗しました', 
      error: error.message 
    });
  }
};
