import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

const AdminBanner = () => {
  const [bannerText, setBannerText] = useState('Dërgesa po ditë dhe në ditën e ardhshme | Porosit përpara orës 14:00')

  useEffect(() => {
    const fetchBannerText = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/banner/text`)
        if (response.data.bannerText) {
          setBannerText(response.data.bannerText)
        }
      } catch (error) {
        console.error('Error fetching banner text:', error)
        // Keep default text if API fails
      }
    }

    fetchBannerText()
  }, [])

  return (
    <div className="bg-primary-600 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-medium">
          {bannerText}
        </p>
      </div>
    </div>
  )
}

export default AdminBanner
