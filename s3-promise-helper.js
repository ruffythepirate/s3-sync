function makeCall (s3, operation, params) {
  return new Promise((resolve, reject) => {
    operation.bind(s3)(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

module.exports = {
  makeCall
}
