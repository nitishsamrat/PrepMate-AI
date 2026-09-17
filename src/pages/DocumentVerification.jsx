import { Navigate } from 'react-router-dom'

/** Legacy route — profile + document verification now live on /profile */
function DocumentVerification() {
  return <Navigate to="/profile" />
}

export default DocumentVerification
