import React from 'react'
import Markets from './markets/page'
import Link from 'next/link'

export default function page() {
  return (
    <div>
      <Markets/>
      <Link
        href="/create"
        className="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition text-lg font-semibold z-20"
      >
        + Create Market
      </Link>
    </div>
  )
}
