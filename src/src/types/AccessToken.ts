export type AccessToken = {
  accessToken: string;
  refreshToken: string;
  expiresIn: Date;
};

export const emptyAccessToken: AccessToken = {
  accessToken: '',
  refreshToken: '',
  expiresIn: new Date(),
};
