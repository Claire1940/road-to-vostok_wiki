import type { LucideIcon } from 'lucide-react'
import { BookOpen, Globe, Map, Wrench, Building2, Package, ListChecks, Sword } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'map', path: '/map', icon: Map, isContentType: true },
	{ key: 'weapons', path: '/weapons', icon: Sword, isContentType: true },
	{ key: 'tasks', path: '/tasks', icon: ListChecks, isContentType: true },
	{ key: 'mods', path: '/mods', icon: Wrench, isContentType: true },
	{ key: 'release', path: '/release', icon: Package, isContentType: true },
	{ key: 'official', path: '/official', icon: Building2, isContentType: true },
	{ key: 'language', path: '/language', icon: Globe, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['guide', 'map', 'weapons', ...]

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
