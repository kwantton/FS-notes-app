import axios from 'axios'
const baseUrl = '/api/notes' // https://fullstackopen.com/en/part3/deploying_app_to_internet "serving static files" -section

let token = null // part 5a; "--private variable called token. Its value can be changed with the setToken function, which is exported by the module. create, now with async/await syntax, sets the token to the Authorization header. The header is given to axios as the third parameter of the post method."

const setToken = newToken => { 
  token = `Bearer ${newToken}`
}

const getAll = () => {
    return axios.get(baseUrl)
    .then(response => response.data) // returns a promise with JUST the data
  }

const create = async newObject => {  
  const config = {    
    headers: { Authorization: token },  // 5a
  }
  
  const response = await axios.post(baseUrl, newObject, config) // config has the header, which has auth as "token", which is set using setToken!! c:
  return response.data
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject)
  .then(response => response.data) // returns a promise with JUST the data
}

export default { getAll, create, update, setToken } // object!