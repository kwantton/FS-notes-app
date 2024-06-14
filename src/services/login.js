import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }

/** .then version
const login = axios.post(baseUrl, credentials)
.then(response => response.data)
 */