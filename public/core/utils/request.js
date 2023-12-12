const {request} = require('https')

function requestData (url, header) {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        method: 'GET',
        setHost: false,
        protocol: 'https:',
        port: 443,
        rejectUnauthorized: false,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'language': 'fr',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
          ...header
        }
      },
      res => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error('statusCode=' + res.statusCode)
          return reject(new Error('statusCode=' + res.statusCode))
        }

        let data = []
        res.on('data', (d) => {
          data.push(d)
        })
        res.on('end', () => {
          try {
            resolve(Buffer.concat(data))
          } catch (e) {
            console.error(e)
            reject(e)
          }
        })
      }
    )
    req.on('error', e => {
      console.error(e)
      reject(e)
    })
    req.end()
  })
}

function requestJson (url, header) {
  return requestData(
    url,
    {
      ...header,
      'Accept': 'application/json',
      'Access-Control-Max-Age': '1728000',
    }
  )
    .then(data => JSON.parse(data.toString('utf-8')))
}

module.exports = {requestData, requestJson}
