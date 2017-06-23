var ini = require('iniparser')
var _ = require('lodash')
var path = require('path-extra')
var ospath = require('ospath')
var cp = require('child_process')

var tryPopulateLitecoinConfAuto = function (properties) {
  var litecoindConfPath = path.join('./', 'data', 'litecoin.conf')
  var litecoindProperties
  try {
    litecoindProperties = ini.parseSync(litecoindConfPath)
  } catch (e) {
    console.warn('Can\'t find litecoind properties file for auto config:', litecoindConfPath)
    return false
  }
  if (!litecoindProperties) return false

  // properties.network = (litecoindProperties.testnet === '1' || litecoindProperties === 'true') ? 'testnet' : 'mainnet'
  properties.litecoinHost = properties.litecoinHost || 'localhost'
  properties.litecoinPort = litecoindProperties.rpcport || (properties.network === 'testnet' ? '18332' : '8332')
  properties.litecoinUser = litecoindProperties.rpcuser || 'rpcuser'
  properties.litecoinPass = litecoindProperties.rpcpassword || 'rpcpass'
  properties.litecoinPath = '/'
  properties.litecoinTimeout = parseInt(litecoindProperties.rpctimeout || '30', 10) * 1000
}

var tryRunLitecoindWin32 = function (properties) {
  var cwd = properties.litecoindExecutableDir || process.env.LITECOIND_EXECUTABLE_DIR || 'C:\\Program Files\\Litecoin\\daemon\\'
  var command = 'litecoind.exe'
  var args = ['--server', '--txindex']
  if (properties.network === 'testnet') {
    args.push('--testnet')
  }
  if (properties.litecoindAutoConf && !properties.litecoindAutoConfSuccess) {
    // could not pull litecoin properties (litecoin.conf) to self properties - run litecoin RPC server with defaults
    args.push('-rpcuser=' + properties.litecoinUser)
    args.push('-rpcpassword=' + properties.litecoinPass)
    args.push('-rpcport=' + properties.litecoinPort)
  }
  var spawn = cp.spawn
  var litecoind = spawn(command, args, {cwd: cwd})

  // litecoind.stdout.on('data', function (data) {
  //   console.log('litecoind:', data.toString())
  // })

  litecoind.stderr.on('data', function (data) {
    console.error('litecoind error:', data.toString())
  })

  litecoind.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('litecoind closed with code,', code)
  })

  litecoind.on('error', function (code) {
    if (code == 0 || code == 2) return
    console.error('litecoind exited with error code,', code)
  })

  return true
}

var tryRunLitecoindMac, tryRunLitecoindLinux
tryRunLitecoindMac = tryRunLitecoindLinux = function (properties) {
  var command = 'litecoind'
  var args = ['--server', '--txindex']
  if (properties.network === 'testnet') {
    args.push('--testnet')
  }
  if (properties.litecoindAutoConf && !properties.litecoindAutoConfSuccess) {
    // could not pull litecoin properties (litecoin.conf) to self properties - run litecoin RPC server with defaults
    args.push('-rpcuser=' + properties.litecoinUser)
    args.push('-rpcpassword=' + properties.litecoinPass)
    args.push('-rpcport=' + properties.litecoinPort)
  }
  var spawn = cp.spawn
  var litecoind = spawn(command, args)

  // litecoind.stdout.on('data', function (data) {
  //   console.log('litecoind:', data.toString())
  // })

  litecoind.stderr.on('data', function (data) {
    console.error('litecoind error:', data.toString())
  })

  litecoind.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('litecoind closed with code,', code)
  })

  litecoind.on('error', function (code) {
    if (code == 0 || code == 2) return
    console.error('litecoind exited with error code,', code)
  })

  return true
}

var tryRunLitecoind = function (properties) {
  switch (this.__platform || process.platform) {
    case 'win32':
      return tryRunLitecoindWin32(properties)
    case 'darwin':
      return tryRunLitecoindMac(properties)
    default:
      return tryRunLitecoindLinux(properties)
  }
}

var tryRunRedisWin32 = function (properties) {
  var cwd = properties.redisExecutableDir || process.env.REDIS_EXECUTABLE_DIR || 'C:\\Program Files\\Redis'
  var command = 'redis-server.exe'
  var args = []
  var spawn = cp.spawn
  var redis = spawn(command, args, {cwd: cwd})

  // redis.stdout.on('data', function (data) {
  //   console.log('redis:', data.toString())
  // })

  redis.stderr.on('data', function (data) {
    console.error('redis error:', data.toString())
  })

  redis.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('redis closed with code,', code)
  })

  redis.on('error', function (code) {
    console.error('redis exited with error code,', code)
  })
}

var tryRunRedisMac, tryRunRedisLinux
tryRunRedisMac = tryRunRedisLinux = function (properties) {
  var command = 'redis-server'
  var spawn = cp.spawn
  var redis = spawn(command)

  // redis.stdout.on('data', function (data) {
  //   console.log('redis:', data.toString())
  // })

  redis.stderr.on('data', function (data) {
    console.error('redis error:', data.toString())
  })

  redis.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('redis closed with code,', code)
  })

  redis.on('error', function (code) {
    if (code == 0 || code == 2) return
    console.error('redis exited with error code,', code)
  })
}

var tryRunRedis = function (properties) {
  switch (this.__platform || process.platform) {
    case 'win32':
      return tryRunRedisWin32(properties)
    case 'darwin':
      return tryRunRedisMac(properties)
    default:
      return tryRunRedisLinux(properties)
  }
}

module.exports = function (propertiesFile) {
  propertiesFile = propertiesFile
  var properties = {}
  try {
    properties = ini.parseSync(propertiesFile)
  } catch (e) {
    console.warn('Can\'t find properties file:', propertiesFile)
  }

  properties.redisHost = properties.redisHost || process.env.REDIS_HOST || 'localhost'
  properties.redisPort = properties.redisPort || process.env.REDIS_PORT || '6379'
  properties.redisPassword = properties.redisPassword || process.env.REDIS_PASSWORD

  properties.litecoindAutoConf = (properties.litecoindAutoConf || process.env.LITECOIND_AUTO_CONF === 'true')

  var litecoindAutoConfSuccess = false
  if (properties.litecoindAutoConf) {
    litecoindAutoConfSuccess = tryPopulateLitecoinConfAuto(properties)
  }

  if (!litecoindAutoConfSuccess) {
    properties.network = properties.network || process.env.NETWORK || 'testnet'
    properties.litecoinHost = properties.litecoinHost || process.env.LITECOIND_HOST || 'localhost'
    properties.litecoinPort = properties.litecoinPort || process.env.LITECOIND_PORT || '18332'
    properties.litecoinUser = properties.litecoinUser || process.env.LITECOIND_USER || 'rpcuser'
    properties.litecoinPass = properties.litecoinPass || process.env.LITECOIND_PASS || 'rpcpass'
    properties.litecoinPath = properties.litecoinPath || process.env.LITECOIND_PATH || '/'
    properties.litecoinTimeout = parseInt(properties.litecoinTimeout || process.env.LITECOIND_TIMEOUT || 30000, 10)
  }

  properties.litecoindAutoRun = (properties.litecoindAutoRun === 'true' || process.env.LITECOIND_AUTO_RUN === 'true')

  if (properties.litecoindAutoRun) {
    tryRunLitecoind(properties)
  }
  properties.redisAutoRun = (properties.redisAutoRun === 'true' || process.env.LITECOIND_AUTO_RUN === 'true')

  if (properties.redisAutoRun) {
    tryRunRedis(properties)
  }

  properties.server = properties.server || {}
  properties.server.httpPort = properties.server.httpPort || process.env.CCFULLNODE_HTTP_PORT || process.env.PORT || 8043 // Optional
  properties.server.httpsPort = properties.server.httpsPort || process.env.CCFULLNODE_HTTPS_PORT || 443 // Optional
  properties.server.host = properties.server.host || process.env.CCFULLNODE_HOST || '0.0.0.0' // Optional

  properties.server.usessl = (properties.server.usessl || process.env.CCFULLNODE_USE_SSL === 'true') // Optional
  properties.server.useBoth = (properties.server.useBoth || process.env.CCFULLNODE_USE_BOTH === 'true') // both HTTP and HTTPS - Optional
  properties.server.privateKeyPath = properties.server.privateKeyPath || process.env.CCFULLNODE_PRIVATE_KEY_PATH // Mandatory in case CCFULLNODE_USE_SSL or CCFULLNODE_USE_BOTH is true
  properties.server.certificatePath = properties.server.certificatePath || process.env.CCFULLNODE_CERTIFICATE_PATH // Mandatory in case CCFULLNODE_USE_SSL or CCFULLNODE_USE_BOTH is true

  properties.server.useBasicAuth = properties.server.useBasicAuth || (process.env.CCFULLNODE_USE_BASIC_AUTH === 'true') // Optional
  properties.server.userName = properties.server.userName || process.env.CCFULLNODE_USER // Manadatory in case CCFULLNODE_USE_BASIC_AUTH is true
  properties.server.password = properties.server.password || process.env.CCFULLNODE_PASS // Manadatory in case CCFULLNODE_USE_BASIC_AUTH is true

  return properties
}
