// AuthService.ts - Servicio de autenticación con soporte para múltiples plataformas

/**
 * Servicio de autenticación que utiliza múltiples métodos de almacenamiento
 * para manejar problemas específicos en diferentes dispositivos (iOS, Mac, modo incógnito)
 */
class AuthService {
  // Claves utilizadas para almacenamiento
  private AUTH_TOKEN_KEY = 'authToken';
  private AUTH_USER_KEY = 'authUser';

  /**
   * Guarda el token de autenticación utilizando múltiples métodos de almacenamiento
   * para compatibilidad con diferentes dispositivos y modos de navegación
   */
  setToken(token: string): boolean {
    let almacenado = false;
    
    // Intentar todos los métodos disponibles de almacenamiento
    // para aumentar la compatibilidad
    const métodos = [
      // Método 1: localStorage (navegadores modernos)
      () => {
        try {
          localStorage.setItem(this.AUTH_TOKEN_KEY, token);
          return true;
        } catch (e) {
          console.warn('No se pudo usar localStorage', e);
          return false;
        }
      },
      
      // Método 2: sessionStorage (útil para modo incógnito)
      () => {
        try {
          sessionStorage.setItem(this.AUTH_TOKEN_KEY, token);
          return true;
        } catch (e) {
          console.warn('No se pudo usar sessionStorage', e);
          return false;
        }
      },
      
      // Método 3: cookies (compatibilidad con Safari)
      () => {
        try {
          // Configuración de cookie compatible con Safari
          const date = new Date();
          date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // 1 día
          document.cookie = `${this.AUTH_TOKEN_KEY}=${token}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
          return true;
        } catch (e) {
          console.warn('No se pudo usar cookies', e);
          return false;
        }
      }
    ];
    
    // Intentar todos los métodos disponibles
    for (const método of métodos) {
      if (método()) {
        almacenado = true;
        // No interrumpimos el bucle, intentamos todos los métodos
        // para mayor compatibilidad
      }
    }
    
    return almacenado;
  }

  /**
   * Guarda la información del usuario
   */
  setUser(user: any): boolean {
    try {
      const userStr = JSON.stringify(user);
      
      // Intentar almacenar en localStorage
      try { localStorage.setItem(this.AUTH_USER_KEY, userStr); } catch (e) {}
      
      // Intentar almacenar en sessionStorage como respaldo
      try { sessionStorage.setItem(this.AUTH_USER_KEY, userStr); } catch (e) {}
      
      return true;
    } catch (e) {
      console.error('Error al guardar información del usuario', e);
      return false;
    }
  }

  /**
   * Obtiene el token de autenticación de cualquier fuente disponible
   */
  getToken(): string | null {
    let token = null;
    
    // 1. Intentar obtener de localStorage
    try {
      token = localStorage.getItem(this.AUTH_TOKEN_KEY);
      if (token) return token;
    } catch (e) {}
    
    // 2. Intentar obtener de sessionStorage
    try {
      token = sessionStorage.getItem(this.AUTH_TOKEN_KEY);
      if (token) return token;
    } catch (e) {}
    
    // 3. Intentar obtener de cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === this.AUTH_TOKEN_KEY) {
          return value;
        }
      }
    } catch (e) {}
    
    return null;
  }

  /**
   * Obtiene la información del usuario de cualquier fuente disponible
   */
  getUser(): any | null {
    let userStr = null;
    
    // Intentar obtener de localStorage
    try {
      userStr = localStorage.getItem(this.AUTH_USER_KEY);
      if (userStr) return JSON.parse(userStr);
    } catch (e) {}
    
    // Intentar obtener de sessionStorage
    try {
      userStr = sessionStorage.getItem(this.AUTH_USER_KEY);
      if (userStr) return JSON.parse(userStr);
    } catch (e) {}
    
    return null;
  }

  /**
   * Elimina toda la información de autenticación
   */
  logout(): void {
    // Limpiar localStorage
    try { localStorage.removeItem(this.AUTH_TOKEN_KEY); } catch (e) {}
    try { localStorage.removeItem(this.AUTH_USER_KEY); } catch (e) {}
    
    // Limpiar sessionStorage
    try { sessionStorage.removeItem(this.AUTH_TOKEN_KEY); } catch (e) {}
    try { sessionStorage.removeItem(this.AUTH_USER_KEY); } catch (e) {}
    
    // Limpiar cookies
    try {
      document.cookie = `${this.AUTH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
    } catch (e) {}
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verifica que el token sea válido haciendo una petición al servidor
   */
  async verificarSesion(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    try {
      // Simplificando la petición para evitar problemas de CORS
      const response = await fetch('/auth/check', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Sesión inválida');
      }

      const data = await response.json();
      return data.autenticado === true;
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      // Limpiar token inválido
      this.logout();
      return false;
    }
  }
}

// Exportar una instancia única del servicio
export const authService = new AuthService();

export default authService; 