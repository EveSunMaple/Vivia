declare const algoliasearch: any, quicklink: any, instantsearch: any

const cardActive = () => {
  if (!$dom('.index.wrap')) { return }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((article) => {
      if (article.target.hasClass('show')) {
        io.unobserve(article.target)
      } else {
        if (article.isIntersecting || article.intersectionRatio > 0) {
          article.target.addClass('show')
          io.unobserve(article.target)
        }
      }
    })
  }, {
    root: null,
    threshold: [0.3]
  })

  $dom.each('.index.wrap article.item, .index.wrap section.item', (article) => {
    io.observe(article)
  })

  $dom('.index.wrap .item:first-child').addClass('show')

  $dom.each('.cards .item', (element) => {
    ['mouseenter', 'touchstart'].forEach((item) => {
      element.addEventListener(item, () => {
        if ($dom('.cards .item.active')) {
          $dom('.cards .item.active').removeClass('active')
        }
        element.addClass('active')
      }, { passive: true })
    });
    ['mouseleave'].forEach((item) => {
      element.addEventListener(item, () => {
        element.removeClass('active')
      }, { passive: true })
    })
  })
}

const registerExtURL = () => {
  $dom.each('span.exturl', (element) => {
    const link = <HTMLAnchorElement>document.createElement('a')
    // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings

    link.href = decodeURIComponent(window.atob(element.dataset.url).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    link.rel = 'noopener external nofollow noreferrer'
    link.target = '_blank'
    link.className = element.className
    link.title = element.title || element.innerText
    link.innerHTML = element.innerHTML
    if (element.dataset.backgroundImage) {
      link.dataset.backgroundImage = element.dataset.backgroundImage
    }
    element.parentNode.replaceChild(link, element)
  })
}

const postFancybox = (p) => {
  if ($dom(p + ' .md img')) {
    vendorCss('fancybox')
    vendorJs('fancybox', () => {
      const q = jQuery.noConflict()

      $dom.each(p + ' p.gallery', (element) => {
        const box = document.createElement('div')
        box.className = 'gallery'
        box.attr('data-height', String(element.attr('data-height') || 220))

        box.innerHTML = element.innerHTML.replace(/<br>/g, '')

        element.parentNode.insertBefore(box, element)
        element.remove()
      })

      $dom.each(p + ' .md img:not(.emoji):not(.vemoji)', (element) => {
        const $image = q(element)
        const imageLink = $image.attr('data-src') || $image.attr('src') // 替换
        const $imageWrapLink = $image.wrap('<a class="fancybox" href="' + imageLink + '" itemscope itemtype="https://schema.org/ImageObject" itemprop="url"></a>').parent('a')
        let info; let captionClass = 'image-info'
        if (!$image.is('a img')) {
          $image.data('safe-src', imageLink)
          if (!$image.is('.gallery img')) {
            $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default')
          } else {
            captionClass = 'jg-caption'
          }
        }
        if ((info = element.attr('title'))) {
          $imageWrapLink.attr('data-caption', info)
          const para = document.createElement('span')
          const txt = document.createTextNode(info)
          para.appendChild(txt)
          para.addClass(captionClass)
          element.insertAfter(para)
        }
      })

      $dom.each(p + ' div.gallery', (el, i) => {
        // @ts-ignore
        q(el).justifiedGallery({
          rowHeight: q(el).data('height') || 120,
          rel: 'gallery-' + i
        }).on('jg.complete', function () {
          q(this).find('a').each((k, ele) => {
            ele.attr('data-fancybox', 'gallery-' + i)
          })
        })
      })

      q.fancybox.defaults.hash = false
      q(p + ' .fancybox').fancybox({
        loop: true,
        // @ts-ignore
        helpers: {
          overlay: {
            locked: false
          }
        }
      })
      // @ts-ignore
    }, window.jQuery)
  }
}

const postBeauty = () => {
  loadComments()

  if (!$dom('.md')) { return }

  postFancybox('.post.block')

  $dom('.post.block').oncopy = async (event) => {
    showtip(LOCAL.copyright)

    if (LOCAL.nocopy) {
      event.preventDefault()
      return
    }

    const copyright = await $dom.asyncify('#copyright')
    if (window.getSelection().toString().length > 30 && copyright) {
      event.preventDefault()
      const author = '# ' + copyright.child('.author').innerText
      const link = '# ' + copyright.child('.link').innerText
      const license = '# ' + copyright.child('.license').innerText
      const htmlData = author + '<br>' + link + '<br>' + license + '<br><br>' + window.getSelection().toString().replace(/\r\n/g, '<br>')

      const textData = author + '\n' + link + '\n' + license + '\n\n' + window.getSelection().toString().replace(/\r\n/g, '\n')
      if (event.clipboardData) {
        event.clipboardData.setData('text/html', htmlData)
        event.clipboardData.setData('text/plain', textData)
      } else {
        // @ts-ignore
        if (window.clipboardData) {
          // @ts-ignore
          return window.clipboardData.setData('text', textData)
        }
      }
    }
  }

  $dom.each('li ruby', (element) => {
    let parent = element.parentNode
    // @ts-ignore
    if (element.parentNode.tagName !== 'LI') {
      parent = element.parentNode.parentNode
    }
    parent.addClass('ruby')
  })

  $dom.each('ol[start]', (element) => {
    // @ts-ignore
    element.style.counterReset = 'counter ' + parseInt(element.attr('start') - 1)
  })

  $dom.each('.md table', (element) => {
    element.wrapObject({
      className: 'table-container'
    })
  })

  $dom.each('.highlight > .table-container', (element) => {
    element.className = 'code-container'
  })

  $dom.each('figure.highlight', (element) => {
    const code_container = element.child('.code-container')
    const caption = element.child('figcaption')

    element.insertAdjacentHTML('beforeend', '<div class="operation"><span class="breakline-btn"><i class="ic i-align-left"></i></span><span class="copy-btn"><i class="ic i-clipboard"></i></span><span class="fullscreen-btn"><i class="ic i-expand"></i></span></div>')

    const copyBtn = element.child('.copy-btn')
    if (LOCAL.nocopy) {
      copyBtn.remove()
    } else {
      copyBtn.addEventListener('click', (event) => {
        const target = <HTMLElement>event.currentTarget
        let comma = ''; let code = ''
        code_container.find('pre').forEach((line) => {
          code += comma + line.innerText
          comma = '\n'
        })

        clipBoard(code, (result) => {
          target.child('.ic').className = result ? 'ic i-check' : 'ic i-times'
          target.blur()
          showtip(LOCAL.copyright)
        })
      }, { passive: true })
      copyBtn.addEventListener('mouseleave', (event) => {
        setTimeout(() => {
          event.target.child('.ic').className = 'ic i-clipboard'
        }, 1000)
      })
    }

    const breakBtn = element.child('.breakline-btn')
    breakBtn.addEventListener('click', (event) => {
      const target = event.currentTarget
      if (element.hasClass('breakline')) {
        element.removeClass('breakline')
        target.child('.ic').className = 'ic i-align-left'
      } else {
        element.addClass('breakline')
        target.child('.ic').className = 'ic i-align-justify'
      }
    })

    const fullscreenBtn = element.child('.fullscreen-btn')
    const removeFullscreen = () => {
      element.removeClass('fullscreen')
      element.scrollTop = 0
      BODY.removeClass('fullscreen')
      fullscreenBtn.child('.ic').className = 'ic i-expand'
    }
    const fullscreenHandle = () => {
      if (element.hasClass('fullscreen')) {
        removeFullscreen()
        if (code_container && code_container.find('tr').length > 15) {
          const showBtn = code_container.child('.show-btn')
          code_container.style.maxHeight = '300px'
          showBtn.removeClass('open')
        }
        pageScroll(element)
      } else {
        element.addClass('fullscreen')
        BODY.addClass('fullscreen')
        fullscreenBtn.child('.ic').className = 'ic i-compress'
        if (code_container && code_container.find('tr').length > 15) {
          const showBtn = code_container.child('.show-btn')
          code_container.style.maxHeight = ''
          showBtn.addClass('open')
        }
      }
    }
    fullscreenBtn.addEventListener('click', fullscreenHandle)
    caption && caption.addEventListener('click', fullscreenHandle)

    if (code_container && code_container.find('tr').length > 15) {
      code_container.style.maxHeight = '300px'
      code_container.insertAdjacentHTML('beforeend', '<div class="show-btn"><i class="ic i-angle-down"></i></div>')
      const showBtn = code_container.child('.show-btn')

      const hideCode = () => {
        code_container.style.maxHeight = '300px'
        showBtn.removeClass('open')
      }
      const showCode = () => {
        code_container.style.maxHeight = ''
        showBtn.addClass('open')
      }

      showBtn.addEventListener('click', () => {
        if (showBtn.hasClass('open')) {
          removeFullscreen()
          hideCode()
          pageScroll(code_container)
        } else {
          showCode()
        }
      })
    }
  })

  $dom.asyncifyEach('pre.mermaid > svg', (element) => {
    const temp = <SVGAElement><unknown>element
    temp.style.maxWidth = ''
  })

  $dom.each('.reward button', (element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault()
      const qr = $dom('#qr')
      if (qr.display() === 'inline-flex') {
        transition(qr, 0)
      } else {
        transition(qr, 1, () => {
          qr.display('inline-flex')
        }) // slideUpBigIn
      }
    })
  })

  // quiz
  $dom.asyncifyEach('.quiz > ul.options li', (element) => {
    element.addEventListener('click', () => {
      if (element.hasClass('correct')) {
        element.toggleClass('right')
        element.parentNode.parentNode.addClass('show')
      } else {
        element.toggleClass('wrong')
      }
    })
  })

  $dom.asyncifyEach('.quiz > p', (element) => {
    element.addEventListener('click', () => {
      element.parentNode.toggleClass('show')
    })
  })

  $dom.asyncifyEach('.quiz > p:first-child', (element) => {
    const quiz = element.parentNode
    let type = 'choice'
    if (quiz.hasClass('true') || quiz.hasClass('false')) { type = 'true_false' }
    if (quiz.hasClass('multi')) { type = 'multiple' }
    if (quiz.hasClass('fill')) { type = 'gap_fill' }
    if (quiz.hasClass('essay')) { type = 'essay' }
    element.attr('data-type', LOCAL.quiz[type])
  })

  $dom.asyncifyEach('.quiz .mistake', (element) => {
    element.attr('data-type', LOCAL.quiz.mistake)
  })

  $dom.each('div.tags a', (element) => {
    element.className = ['primary', 'success', 'info', 'warning', 'danger'][Math.floor(Math.random() * 5)]
  })

  $dom.asyncifyEach('.md div.player', (element) => {
    mediaPlayer(element, {
      type: element.attr('data-type'),
      mode: 'order',
      btns: []
    }).player.load(JSON.parse(element.attr('data-src'))).fetch()
  })

  const angleDown = document.querySelectorAll('.show-btn .i-angle-down')
  if (angleDown.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          angleDown.forEach(i => {
            i.classList.remove('stop-animation')
          })
        } else {
          angleDown.forEach(i => {
            i.classList.add('stop-animation')
          })
        }
      })
    }, {
      root: null,
      threshold: 0.5
    })
    angleDown.forEach(i => {
      io.observe(i)
    })
  }
}

const tabFormat = () => {
  // tab
  let first_tab
  $dom.each('div.tab', (element) => {
    if (element.attr('data-ready')) { return }

    const id = element.attr('data-id')
    const title = element.attr('data-title')
    let box = $dom('#' + id)
    if (!box) {
      box = document.createElement('div')
      box.className = 'tabs'
      box.id = id
      box.innerHTML = '<div class="show-btn"></div>'

      const showBtn = box.child('.show-btn')
      showBtn.addEventListener('click', () => {
        pageScroll(box)
      })

      element.parentNode.insertBefore(box, element)
      first_tab = true
    } else {
      first_tab = false
    }

    let ul = box.child('.nav ul')
    if (!ul) {
      ul = box.createChild('div', {
        className: 'nav',
        innerHTML: '<ul></ul>'
      }).child('ul')
    }

    const li = ul.createChild('li', {
      innerHTML: title
    })

    if (first_tab) {
      li.addClass('active')
      element.addClass('active')
    }

    li.addEventListener('click', (event) => {
      const target = event.currentTarget
      box.find('.active').forEach((el) => {
        el.removeClass('active')
      })
      element.addClass('active')
      target.addClass('active')
    })

    box.appendChild(element)
    element.attr('data-ready', String(true))
  })
}

// TODO 此函数在twikoo下可能不适用
const loadComments = () => {
  const element = $dom('#comments')
  if (!element) {
    goToComment.display('none')
    return
  } else {
    goToComment.display('')
  }
  const io = new IntersectionObserver((entries, observer) => {
    const entry = entries[0]
    vendorCss('valine')
    if (entry.isIntersecting || entry.intersectionRatio > 0) {
      transition($dom('#comments'), 'bounceUpIn')
      observer.disconnect()
    }
  })

  io.observe(element)
}

const algoliaSearch = (pjax) => {
  if (CONFIG.search === null) { return }

  if (!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: '<div class="inner"><div class="header"><span class="icon"><i class="ic i-search"></i></span><div class="search-input-container"></div><span class="close-btn"><i class="ic i-times-circle"></i></span></div><div class="results"><div class="inner"><div id="search-stats"></div><div id="search-hits"></div><div id="search-pagination"></div></div></div></div>'
    })
  }

  const search = instantsearch({
    indexName: CONFIG.search.indexName,
    searchClient: algoliasearch(CONFIG.search.appID, CONFIG.search.apiKey),
    searchFunction (helper) {
      const searchInput = <HTMLInputElement><unknown>$dom('.search-input')
      if (searchInput.value) {
        helper.search()
      }
    }
  })

  search.on('render', () => {
    pjax.refresh($dom('#search-hits'))
  })

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: CONFIG.search.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container: '.search-input-container',
      placeholder: LOCAL.search.placeholder,
      // Hide default icons of algolia search
      showReset: false,
      showSubmit: false,
      showLoadingIndicator: false,
      cssClasses: {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#search-stats',
      templates: {
        text (data) {
          const stats = LOCAL.search.stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS)
          return stats + '<span class="algolia-powered"></span><hr>'
        }
      }
    }),

    instantsearch.widgets.hits({
      container: '#search-hits',
      templates: {
        item (data) {
          const cats = data.categories ? '<span>' + data.categories.join('<i class="ic i-angle-right"></i>') + '</span>' : ''
          return '<a href="' + CONFIG.root + data.path + '">' + cats + data._highlightResult.title.value + '</a>'
        },
        empty (data) {
          return '<div id="hits-empty">' +
            LOCAL.search.empty.replace(/\$\{query}/, data.query) +
            '</div>'
        }
      },
      cssClasses: {
        item: 'item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#search-pagination',
      scrollTo: false,
      showFirst: false,
      showLast: false,
      templates: {
        first: '<i class="ic i-angle-double-left"></i>',
        last: '<i class="ic i-angle-double-right"></i>',
        previous: '<i class="ic i-angle-left"></i>',
        next: '<i class="ic i-angle-right"></i>'
      },
      cssClasses: {
        root: 'pagination',
        item: 'pagination-item',
        link: 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ])

  search.start()

  // Handle and trigger popup window
  $dom.each('.search', (element) => {
    element.addEventListener('click', () => {
      document.body.style.overflow = 'hidden'
      transition(siteSearch, 'shrinkIn', () => {
        $dom('.search-input').focus()
      }) // transition.shrinkIn
    })
  })

  // Monitor main search box
  const onPopupClose = () => {
    document.body.style.overflow = ''
    transition(siteSearch, 0) // "transition.shrinkOut"
  }

  siteSearch.addEventListener('click', (event) => {
    if (event.target === siteSearch) {
      onPopupClose()
    }
  })
  $dom('.close-btn').addEventListener('click', onPopupClose)
  window.addEventListener('pjax:success', onPopupClose)
  window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      onPopupClose()
    }
  })
}

/* pjax部分 */

const domInit = () => {
  $dom.each('.overview .menu > .item', (el) => {
    siteNav.child('.menu').appendChild(el.cloneNode(true))
  })

  loadCat.addEventListener('click', Loader.vanish)
  menuToggle.addEventListener('click', sideBarToggleHandle)
  $dom('.dimmer').addEventListener('click', sideBarToggleHandle)

  quickBtn.child('.down').addEventListener('click', goToBottomHandle)
  quickBtn.child('.up').addEventListener('click', backToTopHandle)

  if (!toolBtn) {
    toolBtn = siteHeader.createChild('div', {
      id: 'tool',
      innerHTML: '<div class="item player"></div><div class="item contents"><i class="ic i-list-ol"></i></div><div class="item chat"><i class="ic i-comments"></i></div><div class="item back-to-top"><i class="ic i-arrow-up"></i><span>0%</span></div>'
    })
  }

  toolPlayer = toolBtn.child('.player')
  backToTop = toolBtn.child('.back-to-top')
  goToComment = toolBtn.child('.chat')
  showContents = toolBtn.child('.contents')

  backToTop.addEventListener('click', backToTopHandle)
  goToComment.addEventListener('click', goToCommentHandle)
  showContents.addEventListener('click', sideBarToggleHandle)

  if (typeof mediaPlayer !== 'undefined') {
    mediaPlayer(toolPlayer)

    $dom('main').addEventListener('click', () => {
      toolPlayer.player.mini()
    })
  }

  const createIntersectionObserver = () => {
    // waves在视口外时停止动画
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.parallax>use').forEach(i => {
          i.classList.remove('stop-animation')
        })
        document.querySelectorAll('#imgs .item').forEach(i => {
          i.classList.remove('stop-animation')
        })
      } else {
        document.querySelectorAll('.parallax>use').forEach(i => {
          i.classList.add('stop-animation')
        })
        // waves不可见时imgs也应该不可见了
        document.querySelectorAll('#imgs .item').forEach(i => {
          i.classList.add('stop-animation')
        })
      }
    }, {
      root: null,
      threshold: 0.2
    }).observe(document.getElementById('waves'))
    // sakura在视口外时停止动画
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.with-love>i').forEach(i => {
          i.classList.remove('stop-animation')
        })
      } else {
        document.querySelectorAll('.with-love>i').forEach(i => {
          i.classList.add('stop-animation')
        })
      }
    }, {
      root: null,
      threshold: 0.2
    }).observe(document.querySelector('.with-love'))
  }
  createIntersectionObserver()
}

const pjaxReload = () => {
  pagePosition()

  if (sideBar.hasClass('on')) {
    transition(sideBar, 0, () => {
      sideBar.removeClass('on')
      menuToggle.removeClass('close')
    }) // 'transition.slideRightOut'
  }
  const mainNode = $dom('#main')
  mainNode.innerHTML = ''
  mainNode.appendChild(loadCat.lastChild.cloneNode(true))
  pageScroll(0)
}

const siteRefresh = (reload) => {
  LOCAL_HASH = 0
  LOCAL_URL = window.location.href

  vendorCss('katex')
  vendorJs('copy_tex')
  vendorCss('mermaid')
  vendorJs('chart')

  if (reload !== 1) {
    $dom.each('script[data-pjax]', pjaxScript)
  }

  originTitle = document.title

  resizeHandle()

  menuActive()

  sideBarTab()
  sidebarTOC()

  registerExtURL()
  postBeauty()
  tabFormat()
  if (typeof mediaPlayer !== 'undefined') {
    toolPlayer.player.load(LOCAL.audio || CONFIG.audio || {})
  }
  Loader.hide()

  setTimeout(() => {
    positionInit()
  }, 500)

  cardActive()

  lazyload.observe()
  isOutime()
}

const siteInit = () => {
  domInit()

  pjax = new Pjax({
    selectors: [
      'head title',
      '.languages',
      '.twikoo',
      '.pjax',
      '.leancloud-recent-comment',
      'script[data-config]'
    ],
    cacheBust: false
  })

  CONFIG.quicklink.ignores = LOCAL.ignores
  quicklink.listen(CONFIG.quicklink)
  autoDarkmode()

  if (!CONFIG.disableVL) {
    visibilityListener()
  }
  themeColorListener()

  algoliaSearch(pjax)

  window.addEventListener('scroll', scrollHandle)

  window.addEventListener('resize', resizeHandle)

  window.addEventListener('pjax:send', pjaxReload)

  window.addEventListener('pjax:success', siteRefresh) // 默认会传入一个event参数

  window.addEventListener('beforeunload', () => {
    pagePosition()
  })
  // clickMenu() TODO 暂时禁用
  siteRefresh(1)
}

window.addEventListener('DOMContentLoaded', siteInit, {
  passive: true
})

console.log('%c Theme.ShokaX v' + CONFIG.version + ' %c https://github.com/theme-shoka-x/hexo-theme-shokaX ', 'color: white; background: #e9546b; padding:5px 0;', 'padding:4px;border:1px solid #e9546b;')
console.log('%c by kaitaku ' + '%c https://www.kaitaku.xyz', 'color: white; background: #00bfff; padding: 5px 3px;', 'padding: 4px;border:1px solid #00bfff')
