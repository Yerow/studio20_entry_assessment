export interface PayloadUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'author' | 'user'
}

// Fonctions d'auth simples
export const authAPI = {
  // Connexion
  async login(email: string, password: string) {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (response.ok && data.user) {
        return { success: true, user: data.user }
      } else {
        return { 
          success: false, 
          error: data.message || 'Erreur de connexion' 
        }
      }
    } catch (error) {
      return { success: false, error: 'Erreur réseau' }
    }
  },

  // Déconnexion
  async logout() {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },

  // Inscription
  async register(data: { name: string; email: string; password: string }) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // Auto-login après inscription
        return await this.login(data.email, data.password)
      } else {
        return { 
          success: false, 
          error: result.message || 'Erreur création compte' 
        }
      }
    } catch (error) {
      return { success: false, error: 'Erreur réseau' }
    }
  },

  // Vérifier le statut de connexion
  async getCurrentUser(): Promise<PayloadUser | null> {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.id ? data : null
      }
      return null
    } catch (error) {
      return null
    }
  }
}