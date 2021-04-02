const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime
  return function () {
    const context = this
    const args = arguments
    if (!inThrottle) {
      inThrottle = true
      fn.apply(context, args)
      lastTime = Date.now()
      return
    }

    clearTimeout(lastFn)
    lastFn = setTimeout(function () {
      if (Date.now() - lastTime >= wait) {
        fn.apply(context, args)
        lastTime = Date.now()
      }
    }, Math.max(wait - (Date.now() - lastTime), 0))
  }
}

// http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect()
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight)
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth)

  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0)
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0)

  const isElementPartiallyInViewport = vertInView && horInView
  if (isElementPartiallyInViewport) { return true }

  return (
    (rect.left >= 0) &&
    (rect.top >= 0) &&
    ((rect.left + rect.width) <= windowWidth) &&
    ((rect.top + rect.height) <= windowHeight)
  )
}

function lazyLoad(images) {
  if (!images || !images.length || images.every(image => !image)) { return }

  const hadLoadSymbol = Array.from({ length: images.length })

  function loadImage(el, index) {
    const img = new Image()
    const src = el.dataset.original

    img.src = src
    img.onload = function () {
      el.classList.add('loaded')
      el.src = src
      hadLoadSymbol[index] = true
    }
    img.onerror = function () {
      hadLoadSymbol[index] = true
    }
  }
  const lazyLoadEvent = throttle(processImages, 120)
  window.addEventListener('scroll', lazyLoadEvent, false)

  function processImages() {
    if (hadLoadSymbol.every(el => !!el)) {
      window.removeEventListener('scroll', lazyLoadEvent)
      return
    }
    for (let i = 0; i < images.length; ++i) {
      if (!hadLoadSymbol[i] && isElementInViewport(images[i])) {
        loadImage(images[i], i)
      }
    }
  }
  setTimeout(processImages, 0)
}

const canUseWebP = () => {
  const canvas = document.createElement('canvas')
  if (canvas.getContext && canvas.getContext('2d')) {
    // eslint-disable-next-line eqeqeq
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') == 0
  }
  return false
}

const filterPhotos = photos =>
  canUseWebP()
    ? photos.map(({ src, ...rest }) => ({ ...rest, src: src.replace(/((.jpg)|(.jpeg)|(.png))$/, '.webp') }))
    : photos

export { lazyLoad, filterPhotos }
