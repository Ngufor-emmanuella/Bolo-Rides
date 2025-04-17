import React from 'react'
import { Fugaz_One } from 'next/font/google';

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Cars() {
  return (
    <div>
      <div className='py-10 sm:py-14 md:py-20'>Cars</div>
      
      <h1 className={'text-5xl sm:text-6xl md:text-7xl text-center' + fugaz.className}> <span className='textGradient'> enjoy your ride </span>  <span> Bolo Rides </span> Car rental services and management </h1>
      
      <p className='text-lg sm:text-xl md:text-2xl text-center'> Choose your favorite ride <span> every day any time </span></p>
      </div>
  )
}
