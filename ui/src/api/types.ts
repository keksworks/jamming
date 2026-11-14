
// class auth.EmailCodeRequest
export interface EmailCodeRequest {code: string; email: Email}
// class users.Role
export enum Role {ADMIN = 'ADMIN', USER = 'USER'}
// class users.User
export interface User {avatarUrl?: URI; email: Email; firstName: string; id: Id<User>; lang: string; lastLoginAt?: Instant; lastName: string; name: string; refreshToken?: string; role: Role; updatedAt?: Instant; createdAt: Instant}
// class auth.EmailRequest
export interface EmailRequest {email: Email}
// class jams.Member
export interface Member {id: string; name: string}
// class jams.Playback
export interface Playback {beatsPerChord: number; bpm: number; startedAt?: Instant}
// class songs.Song
export interface Song {artist?: string; id: Id<Song>; key?: string; sheet: string; title: string; createdAt: Instant}
// class jams.Suggestion
export interface Suggestion {by: string; id: Id<Suggestion>; key?: string; song?: Song; votes: Array<string>}
// class jams.Jam
export interface Jam {code: string; key?: string; members: Array<Member>; playback: Playback; song?: Song; suggestions: Array<Suggestion>; updatedAt: Instant}

// klite.Id
export type Id<T> = string & {_of?: T}
// java.time.Instant
export type Instant = `${number}-${number}-${number}T${number}:${number}:${number}Z`
// java.net.URI
export type URI = `${string}://${string}`
// klite.Email
export type Email = `${string}@${string}`
