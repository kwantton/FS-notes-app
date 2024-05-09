import axios from 'axios'
const baseUrl = '/api/notes' // https://fullstackopen.com/en/part3/deploying_app_to_internet "serving static files" -section

const getAll = () => {
    return axios.get(baseUrl).
    then(response => response.data) // returns a promise with JUST the data
  }

const create = newObject => {
  return axios.post(baseUrl, newObject)
  .then(response => response.data) // returns a promise with JUST the data
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject)
  .then(response => response.data) // returns a promise with JUST the data
}

export default { getAll, create, update } // object!