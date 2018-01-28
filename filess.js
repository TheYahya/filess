'use strict'

const express = require('express')
const app = express()
const fs = require('fs')
const chalk = require('chalk')
const homedir = require('homedir')
const mime = require('mime-types')
const bodyParser = require('body-parser')
const upload = require('multer')({ dest: '/tmp/' })
const path = require('path')

// Reading .env file
require('dotenv').config()

// The directory that we wanna serve
let theDir = (process.env.DIR) ? process.env.DIR.replace('~', homedir()) : '~'.replace('~', homedir())
// Set the port as well
let thePort = process.env.PORT || 3030

// Serving static files
app.use(express.static(path.join(__dirname, '/public')))

// Configuring express to use body-parser as middle-ware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

module.exports = (dir = theDir, port = thePort) => {
  // Set global variable in middleware
  app.use('/*', (req, res, next) => {
    // Generate current directory based on root directory & url
    req.currentPath = (dir + decodeURI(req.originalUrl)).replace('//', '/')

    next()
  })

  // Handle all the urls with this single route
  app.get('/*', (req, res) => {
    // Show 404 if not exists
    if (!fs.existsSync(req.currentPath) &&
    // If the url end with .stream it's mean we want to strem the file in browser not download it
    !fs.existsSync(req.currentPath.substring(0, req.currentPath.length - 7))) {
      res.status(404).end('Not found')
      return
    }

    // We just Download file
    let download = true
    if (req.currentPath.substring(req.currentPath.length - 7, req.currentPath.length).includes('.stream') &&
    fs.lstatSync(req.currentPath.substring(0, req.currentPath.length - 7)).isFile()) {
      // We going to stream the file
      download = false
      req.currentPath = req.currentPath.substring(0, req.currentPath.length - 7)
    }

    // Check if it's a file or directory
    if (fs.lstatSync(req.currentPath).isFile()) {
      let filePath = req.currentPath
      if (download) {
        res.download(filePath)
        return
      }

      let mimeType = mime.lookup(filePath)
      let stat = fs.statSync(filePath)
      let total = stat.size

      if (req.headers.range) {
        let range = req.headers.range
        let parts = range.replace(/bytes=/, '').split('-')
        let partialstart = parts[0]
        let partialend = parts[1]

        let start = parseInt(partialstart, 10)
        let end = partialend ? parseInt(partialend, 10) : total - 1
        let chunksize = (end - start) + 1

        let file = fs.createReadStream(filePath, {
          start: start,
          end: end
        })

        res.writeHead(206, {
          'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': mimeType
        })

        file.pipe(res)
      } else {
        res.writeHead(200, {
          'Content-Length': total,
          'Content-Type': mimeType
        })

        fs.createReadStream(filePath).pipe(res)
      }
      return
    }

    // So it'a directory
    // Read directory
    fs.readdir(req.currentPath, (err, files) => {
      if (err) throw err
      let theFiles = []
      files.forEach((file) => {
        // Full path of file/directory
        let fullPath = `${req.currentPath}/${file}`
        if (!hasAccess(fullPath)) {
          return
        }
        let stats = fs.lstatSync(fullPath)
        theFiles.push({
          name: file,
          // Show size only if it's a file
          size: stats.isFile() ? `${Math.round(stats.size / 1024)}` : undefined,
          url: (req.url === '/') ? `${file}` : `${req.url}/${file}`
        })
      })

      let urlParts = decodeURI(req.url).split('/')
      // Because of a / in the end of url that sometimes happens
      // We should remove the last item of the urlParts if it's an empty string
      if (urlParts[urlParts.length - 1] === '') {
        urlParts.splice(urlParts.length - 1, 1)
      }

      // Creating breadcrumbs items with url parts
      // It's Url & title
      let breadcrumbs = []
      urlParts.forEach((item, index) => {
        let url = '/'
        // url is combining all the previous items of urlParts
        for (var i = 1; i <= index; i++) {
          url += `${urlParts[i]}/`
        }

        breadcrumbs.push({
          title: (item === '') ? 'Root' : item,
          url: url
        })
      })

      // Rendering the list of file and folders in the currentPath
      res.render(path.join(__dirname, '/views/default.ejs'), {
        breadcrumbs: breadcrumbs,
        files: theFiles,
        download: ''
      })
    })
  })

  // Upload file
  app.post('/*', upload.single('file'), (err, req, res) => {
    if (err) throw err

    // Read uploaded file
    fs.readFile(req.file.path, (err, file) => {
      if (err) throw err

      // File path to upload
      let destPath = (req.currentPath + '/' + req.file.originalname).replace('//', '/')

      // Create & save the file
      fs.writeFile(destPath, file, (err) => {
        if (err) throw err

        res.redirect(req.url)
      })
    })
  })

  // Igniting server
  const listener = app.listen(port, () => {
    console.log(chalk.red(`File-server listening on port ${listener.address().port}`))
  })
}

/**
 * Check access to the file/directory
 *
 * @param   {string}  path
 *
 * @return  {boolean}
 */
function hasAccess (path) {
  try {
    fs.accessSync(path)
    return true
  } catch (e) {
    return false
  }
}
