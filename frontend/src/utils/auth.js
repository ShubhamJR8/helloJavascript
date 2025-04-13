export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const checkAuth = () => {
  const token = getToken();
  if (!token) {
    return false;
  }

  // You could add token expiration check here
  // const decoded = jwt_decode(token);
  // if (decoded.exp < Date.now() / 1000) {
  //   logout();
  //   return false;
  // }

  return true;
}; 