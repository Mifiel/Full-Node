var routes = [
  {
    path: '/getAddressesUtxos',
    method: 'get',
    functionName: 'getAddressesUtxos',
    params: ['addresses'],
    optionalParams: ['numOfConfirmations']
  },
  {
    path: '/getUtxos',
    method: 'get',
    functionName: 'getUtxos',
    params: ['utxos'],
    optionalParams: ['numOfConfirmations']
  },
  {
    path: '/getAddressesTransactions',
    method: 'get',
    functionName: 'getAddressesTransactions',
    params: ['addresses'],
    optionalParams: []
  },
  {
    path: '/transmit',
    method: 'post',
    functionName: 'transmit',
    params: ['txHex'],
    optionalParams: []
  },
  {
    path: '/getInfo',
    method: 'get',
    functionName: 'getInfo',
    params: [],
    optionalParams: []
  },
  {
    path: '/importAddresses',
    method: 'post',
    functionName: 'importAddresses',
    params: ['addresses'],
    optionalParams: ['reindex']
  }
]

module.exports = function (app, parser) {

  var handleResponse = function (err, ans, res, next) {
    if (err) return next(err)
    res.send(ans)
  }

  routes.forEach(function (route) {
    app[route.method](route.path, function (req, res, next) {
      var args = {},
          err = {},
          hasErrors = false
      route.params.some(function (param) {
        args[param] = req.body[param] || req.query[param]
        if (!args[param]) {
          hasErrors = true
          err[param] = {
            type: 'required',
            message: `param '${param}' is required.`
          }
          return true
        }
      })
      if (hasErrors) {
        res.status(403)
        if (req.accepts('json')) return res.send({ errors: err })
        return res.type('txt').send('Not found')
        return next(err)
      }
      route.optionalParams.forEach(function (param) {
        args[param] = req.body[param]
      })
      parser[route.functionName](args, function (err, ans) {
        handleResponse(err, ans, res, next)
      })
    })
  })
}
