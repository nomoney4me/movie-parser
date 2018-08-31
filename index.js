const fetch = require('node-fetch')
      , cheerio = require('cheerio')
      , puppeteer = require('puppeteer')
      , Promise = require('bluebird')
      , shell = require('node-powershell')

  let videoUrl = [];
  let url = `http://xemvtv.net/phim-anh-sao-toa-sang-26351.html`

  Promise.try(() => {
    return fetch(url).then(res => res.text())
  })
  .then(data => {
    let $ = cheerio.load(data)
    return $('#btn-film-watch').attr('href')
  })
  .then(url => {
    return fetch(url).then(res => res.text())
  })
  .then(data => {
    $ = cheerio.load(data)
    return $('.svep').html()
  })
  .then(episodesHTML => {
    let episodesList = []
    $ = cheerio.load(episodesHTML)
    $('a').map((i, link) => {
      episodesList.push($(link).attr('href'))
    }, [])

    return episodesList
  })
  .then(episodesList => {
    let list = [];
    return Promise.try(() => {
      return puppeteer.launch()
    }).then(browser => {
      let joblist = []
      episodesList.map((link, index) => {
        joblist.push(grabVideoLink(browser, link))
      }, [])
      return joblist
    }).then(joblist => {
      Promise.all(joblist).then(data => {
        console.log(data)
      })
    })
  })
  .then(downloadList => {
    // Promise.all(downloadList).then(data => {
    //   console.log(data)
    // })
    // let ps = new shell({
    //   executionPolicy: 'Bypass',
    //   noProfile: true
    // })
    // ps.addCommand(`uget.exe --filename=${filename} --quiet ${url} `)
    // ps.invoke().then(output => {
    //   console.log(output)
    // })
    // .catch(e => {
    //   console.log(e)
    // })
  })

  grabVideoLink = (browser, url) => {
    return Promise.try(() => { 
      return browser.newPage()
    }).then(page => {
      page.goto(url, {
        timeout: 0
      })
      page.on('request', interceptedRequest => {
        dl = interceptedRequest.url()
        if( dl.match(/fbcdn.net/) ) {
          dl = dl.replace(/&/g, '"&"')
          console.log(dl)
          page.close()
        }
      })

      page.on('close', function() {
        return dl
      })
    })
  }