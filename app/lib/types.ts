export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  favorite_team?: string;
  favorite_driver?: string;
  total_score: number;
  current_streak?: number;
  created_at: string;
  is_admin?: boolean;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_required: number;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

export interface Race {
  id: number;
  name: string;
  date: string;
  status: string;
  location?: string;
}

export interface Prediction {
  id: number;
  user_id: string;
  race_id: number;
  p1_driver: string;
  p2_driver: string;
  p3_driver: string;
  manual_score: number;
  races: Race;
}

export interface League {
  id: number;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
  members_count?: number;
}

export interface LeagueMember {
  league_id: number;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  leagues: League;
}

export interface FriendRequest {
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend?: Profile; 
}
