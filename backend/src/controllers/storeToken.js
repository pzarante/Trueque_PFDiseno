let accessToken = null;
let refreshToken = null;
const Email = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const setRefreshToken = (token) => {
   refreshToken = token; 
  };
export const getRefreshToken = () => {
  return refreshToken;
};