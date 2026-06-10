import { Navigate } from 'react-router-dom'

// Registration is handled automatically via Google sign-in
export default function Register() {
  return <Navigate to="/login" replace />
}
