import React, { useState, useLayoutEffect, useRef, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import ResizeObserver from 'resize-observer-polyfill'
import { computeColumnLayout, computeDynamicColumns } from './layouts/columns'
import getRandomColor from './utils/background'

function Gallery({ photos, onClick, margin, onLoad }) {
  const [containerWidth, setContainerWidth] = useState(0)
  const galleryEl = useRef(null)

  useLayoutEffect(() => {
    let animationFrameID = null
    const observer = new ResizeObserver(entries => {
      const newWidth = entries[0].contentRect.width
      if (containerWidth !== newWidth) {
        animationFrameID = window.requestAnimationFrame(() => {
          setContainerWidth(Math.floor(newWidth))
        })
      }
    })
    observer.observe(galleryEl.current)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrameID)
    }
  })

  const [computedPhotos, galleryStyle] = useMemo(() => {
    const columns = computeDynamicColumns(containerWidth)
    const computedPhotos = computeColumnLayout({ containerWidth: containerWidth - 1, columns, margin, photos })
    const galleryStyle = { position: 'relative' }
    if (computedPhotos.length > 0) {
      galleryStyle.height = computedPhotos[computedPhotos.length - 1].containerHeight
    }
    return [computedPhotos, galleryStyle]
  }, [containerWidth, margin, photos])

  const handleClick = useCallback((event, { index }) => {
    onClick(event, {
      index,
      photo: photos[index],
      previous: photos[index - 1] || null,
      next: photos[index + 1] || null,
    })
  }, [onClick, photos])

  const refs = useMemo(() => Array.from({ length: photos.length }, () => React.createRef()), [photos.length])

  useEffect(() => {
    onLoad(refs.map(({ current }) => current))
  }, [onLoad, refs])

  const bgColors = useMemo(() => Array.from({ length: photos.length }, getRandomColor), [photos.length])

  return (
    <div id="react-gallery" ref={galleryEl} style={galleryStyle}>
      {computedPhotos.map((photo, index) => {
        const { src, top, left, width, height, title, alt } = photo
        const bgColor = bgColors[index]
        const style = { position: 'absolute', top, left, width, height, margin, background: `url(${bgColor})` }
        const onClick = event => { handleClick(event, { photo, index }) }
        return (
          <div key={src} className="react-photo" style={style} onClick={onClick} >
            <img ref={refs[index]} src={bgColor} data-original={src} width={width} height={height} alt={alt} title={title} />
            <span>{title}</span>
          </div>
        )
      })}
    </div>
  )
}

Gallery.propTypes = {
  photos: PropTypes.array,
  margin: PropTypes.number,
  onClick: PropTypes.func,
  onLoad: PropTypes.func,
}

Gallery.defaultProps = {
  margin: 8
}

export default React.memo(Gallery)
