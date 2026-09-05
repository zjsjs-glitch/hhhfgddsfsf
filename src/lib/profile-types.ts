export type SocialLink = {
  id: string
  platform: string
  url: string
}

export type ProfileData = {
  slug: string
  videoUrl: string | null
  posterUrl: string | null
  username: string | null
  location: string | null
  avatarUrl: string | null
  displayName: string | null
  statusText: string | null
  statusEmoji: string | null
  bio: string | null
  particles: boolean
  showViews: boolean
  socials: SocialLink[]
  views: number
}

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  image: string | null
}

export type MeResponse = {
  user: SessionUser | null
  profile: ProfileData | null
}

export type ProfileResponse = {
  profile: ProfileData | null
}

export type PublicProfileResponse = {
  profile: ProfileData | null
  error?: string
}
