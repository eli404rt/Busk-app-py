export interface User {
  username: string
  password: string
}

export const ADMIN_USER: User = {
  username: "eli404",
  password: "Ry@n2025!!",
}

export function validateAdmin(username: string, password: string): boolean {
  return username === ADMIN_USER.username && password === ADMIN_USER.password
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("admin_authenticated") === "true"
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("admin_authenticated", value.toString())
}
