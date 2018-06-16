function getRequest(url, fun) {
  return axios.get(url)
    .then( (response) => fun(response.data) )
    .catch( (error) => console.error('Failed to request `' + url + '`. ' + error) )
}
  
function postRequest(url, params, fun) {
  return axios.post(url, params)
    .then( (response) => fun(response.data) )
    .catch( (error) => console.error('Failed to request `' + url + '`. ' + error) )
}
