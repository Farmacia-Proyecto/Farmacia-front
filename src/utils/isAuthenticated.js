export function isAuthenticated() {
    return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('jwt='));
  }
  