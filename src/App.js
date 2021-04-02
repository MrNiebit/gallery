import React, { useState, useCallback } from 'react'
import photos from './photos'
import Gallery from './components/Gallery'
import Lightbox from './components/Lightbox'
import Footer from './components/Footer'
import Header from './components/Header'


import { lazyLoad, filterPhotos } from './utils.js'

const filteredPhotos = filterPhotos(photos)

function App() {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [viewerIsOpen, setViewerIsOpen] = useState(false)

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrentPhoto(index)
    setViewerIsOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setCurrentPhoto(0)
    setViewerIsOpen(false)
  }, [])

  return (
    <>
      <Header/>
      <Gallery photos={filteredPhotos} onLoad={lazyLoad} onClick={openLightbox} />
      <Lightbox photos={filteredPhotos} viewerIsOpen={viewerIsOpen} currentPhoto={currentPhoto} closeLightbox={closeLightbox} />
      <Footer />
    </>
  )
}

export default App
