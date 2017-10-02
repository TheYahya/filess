'use strict'

const express = require('express')
const app = express()
const fs = require('fs')
const url = require('url')
const homedir = require('homedir')
// Reading .env file
require('dotenv').config()

// Serving static files
app.use(express.static('public'))

// The directory that we wanna serve
let dir = (process.env.DIR) ? process.env.DIR.replace('~', homedir()) : '~'.replace('~', homedir())  

// Set the port as well
let port = process.env.PORT || 3000

// Handle all the urls with this single route
app.get('/*', (req, res) => {
  // Generate current directory based on root directory & url
  let currentPath = dir + decodeURI(req.url)
  // Show 404 if not exists
  if (!fs.existsSync(currentPath)) {
    res.status(404).end('Not found')
    return
  }

  // Check if it's a file or directory
  if (fs.lstatSync(currentPath).isFile()) {
    // It's a file, so we just downloading it
    res.download(currentPath)
    return
  }

  // So it'a directory
  // Read directory
  fs.readdir(currentPath, (err, files) => {
    if (err) throw err
    let theFiles = []
    files.forEach((file) => {
      // Full path of file/directory
      let fullPath = `${currentPath}/${file}`
      let stats = fs.lstatSync(fullPath)
      theFiles.push({
        name: file,
        // Show size only if it's a file
        size: stats.isFile() ? `${Math.round(stats.size / 1024)}` : undefined,
        url: (req.url == '/') ? `${file}` : `${req.url}/${file}`,
      })
    })


    let urlParts = decodeURI(req.url).split('/')
    // Because of a / in the end of url that sometimes happens
    // We should remove the last item of the urlParts if it's an empty string
    if (urlParts[urlParts.length - 1] == '') {
      urlParts.splice(urlParts.length - 1, 1)
    }

    // Creating breadcrumbs items with url parts
    // It's: Url & title
    let breadcrumbs = []
    urlParts.forEach((item, index) => {
      let url = '/'
      // url is combining all the previous items of urlParts
      for (var i = 1; i <= index; i++) {
        url += `${urlParts[i]}/`
      }

      breadcrumbs.push({
        title: (item == '') ? 'Root' : item,
        url: url
      })
    })

    // Rendering the list of file and folders in the currentPath
    res.render('default.ejs', {breadcrumbs: breadcrumbs, files: theFiles})
  })
})

const listener = app.listen(port, () => {
  console.log(`File-server listening on port ${listener.address().port}`)
})