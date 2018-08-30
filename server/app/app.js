function getRequest(url, fun, err) {
  return axios.get(url)
    .then( (response) => fun(response.data) )
    .catch( (error) => err(error) )
}
  
function postRequest(url, params, fun) {
  return axios.post(url, params)
    .then( (response) => fun(response.data) )
    .catch( (error) => err(error) )
}
