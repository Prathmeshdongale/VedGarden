import React from 'react'
import './Head.css'
import backgroung from '../../assets/backgroung.png'
export const Head = () => {
  return (
    <div
        style={{
        width: '100%',
        minHeight: '100vh',
        backgroundImage: `url(${backgroung})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat', 
        
      }}
>
        
    </div>
  )
}
