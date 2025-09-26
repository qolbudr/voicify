export interface User {
  id: string,
  email: string,
  name: string,
  photo: string,
  token: string,
  validAt: Date | null,
  createdAt: Date,
}