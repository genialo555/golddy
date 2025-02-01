import api from './api'

export interface InstagramAnalytics {
  followers: number
  following: number
  posts: number
  engagement_rate: number
  peak_activity_hours: { [hour: string]: number }
}

export interface InstagramProfile {
  username: string
  full_name: string
  biography: string
  profile_pic_url: string
  is_private: boolean
  analytics: InstagramAnalytics
}

class InstagramService {
  async getProfile(username: string): Promise<InstagramProfile> {
    const { data } = await api.get(`/instagram/profile/${username}`)
    return data
  }

  async getAnalytics(username: string): Promise<InstagramAnalytics> {
    const { data } = await api.get(`/instagram/analytics/${username}`)
    return data
  }

  async getActivityHours(username: string): Promise<{ [hour: string]: number }> {
    const { data } = await api.get(`/instagram/activity-hours/${username}`)
    return data
  }

  async getPredictions(username: string): Promise<{
    follower_growth: number
    engagement_prediction: number
  }> {
    const { data } = await api.get(`/instagram/predictions/${username}`)
    return data
  }
}

export default new InstagramService() 