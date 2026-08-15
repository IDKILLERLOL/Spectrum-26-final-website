import {
  Gamepad2,
  CalendarDays,
  Heart,
  Mail,
  Swords,
  Instagram,
  MessageCircle,
  Send,
  Twitter,
  Sparkles,
  Trophy,
  Users,
  MapPin,
  Bell,
  Clock,
  ImageIcon,
  Award,
  Crown,
  type LucideIcon,
} from "lucide-react"

/** Resolves the string icon identifiers stored in content/spectrum.ts to lucide components. */
export const iconMap: Record<string, LucideIcon> = {
  gamepad: Gamepad2,
  calendar: CalendarDays,
  heart: Heart,
  mail: Mail,
  swords: Swords,
  instagram: Instagram,
  "message-circle": MessageCircle,
  send: Send,
  twitter: Twitter,
  sparkles: Sparkles,
  trophy: Trophy,
  users: Users,
  "map-pin": MapPin,
  bell: Bell,
  clock: Clock,
  image: ImageIcon,
  award: Award,
  crown: Crown,
}

export function resolveIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkles
}
