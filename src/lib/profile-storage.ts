'use client'

import { useSyncExternalStore } from 'react'

export type SocialLink = {
  id: string
  platform: string
  url: string
}

export type ProfileData = {
  videoUrl: string
  posterUrl: string
  username: string
  location: string
  avatarUrl: string
  displayName: string
  statusText: string
  statusEmoji: string
  socials: SocialLink[]
  particles: boolean
  showViews: boolean
}

const STORAGE_KEY = 'link-in-bio-profile-v1'
const VIEW_KEY = 'link-in-bio-views'

export const defaultProfile: ProfileData = {
  videoUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  posterUrl:
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1600&q=80',
  username: 'only_7mz',
  location: 'germany',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  displayName: '8n44',
  statusText: 'شَيْخُ الْمُحِبِّين',
  statusEmoji: '😈',
  socials: [
    { id: '1', platform: 'instagram', url: 'https://instagram.com/' },
    { id: '2', platform: 'discord', url: 'https://discord.com/' },
    { id: '3', platform: 'roblox', url: 'https://roblox.com/' },
    { id: '4', platform: 'spotify', url: 'https://spotify.com/' },
  ],
  particles: true,
  showViews: true,
}

// ---------- Profile store ----------
let profileCache: ProfileData = defaultProfile
let profileCacheInitialized = false
const profileListeners = new Set<() => void>()

function readProfileFromStorage(): ProfileData {
  if (typeof window === 'undefined') return defaultProfile
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProfile
    const parsed = JSON.parse(raw) as Partial<ProfileData>
    return { ...defaultProfile, ...parsed }
  } catch {
    return defaultProfile
  }
}

function ensureProfileCacheInitialized() {
  if (typeof window !== 'undefined' && !profileCacheInitialized) {
    profileCache = readProfileFromStorage()
    profileCacheInitialized = true
  }
}

function notifyProfile() {
  for (const l of profileListeners) l()
}

function subscribeProfile(cb: () => void) {
  // Lazy-init on first client subscription
  ensureProfileCacheInitialized()
  profileListeners.add(cb)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    profileListeners.delete(cb)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

function onStorage(e: StorageEvent) {
  if (e.key === STORAGE_KEY) {
    profileCache = readProfileFromStorage()
    notifyProfile()
  }
}

function getProfileSnapshot() {
  // Lazy-init in case subscribe hasn't been called yet (e.g. during hydration check)
  ensureProfileCacheInitialized()
  return profileCache
}

function getProfileServerSnapshot() {
  return defaultProfile
}

export function useProfile(): ProfileData {
  return useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    getProfileServerSnapshot,
  )
}

export function saveProfile(profile: ProfileData) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    profileCache = profile
    profileCacheInitialized = true
    notifyProfile()
  } catch {
    /* ignore */
  }
}

export function resetProfile() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    profileCache = defaultProfile
    profileCacheInitialized = true
    notifyProfile()
  } catch {
    /* ignore */
  }
}

// ---------- Views store ----------
let viewCache: number = 0
let viewCacheInitialized = false
const viewListeners = new Set<() => void>()

function readViewsFromStorage(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = window.localStorage.getItem(VIEW_KEY)
    return raw ? parseInt(raw, 10) || 0 : 0
  } catch {
    return 0
  }
}

function ensureViewCacheInitialized() {
  if (typeof window !== 'undefined' && !viewCacheInitialized) {
    viewCache = readViewsFromStorage()
    viewCacheInitialized = true
  }
}

function notifyViews() {
  for (const l of viewListeners) l()
}

function subscribeViews(cb: () => void) {
  ensureViewCacheInitialized()
  viewListeners.add(cb)
  return () => {
    viewListeners.delete(cb)
  }
}

function getViewsSnapshot() {
  ensureViewCacheInitialized()
  return viewCache
}

function getViewsServerSnapshot() {
  return 0
}

export function useViews(): number {
  return useSyncExternalStore(
    subscribeViews,
    getViewsSnapshot,
    getViewsServerSnapshot,
  )
}

export function getViews(): number {
  ensureViewCacheInitialized()
  return viewCache
}

export function incrementViews(): number {
  if (typeof window === 'undefined') return 0
  ensureViewCacheInitialized()
  const next = viewCache + 1
  try {
    window.localStorage.setItem(VIEW_KEY, String(next))
  } catch {
    /* ignore */
  }
  viewCache = next
  notifyViews()
  return next
}

export function resetViews() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(VIEW_KEY)
  } catch {
    /* ignore */
  }
  viewCache = 0
  viewCacheInitialized = true
  notifyViews()
}

