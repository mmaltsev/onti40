function getRequest(url) {
  axios.get(url)
    .then(function(response) {
      console.log('Requested data: ', response.data)
    })
    .catch(function(error) {
      console.log('Error: ', error);
    });
}
  
function postRequest(url, params) {
  axios.post(url, params)
    .then(function(response) {
      console.log('Requested data: ', response.data)
    })
    .catch(function(error) {
      console.log('Error: ', error);
    });
}