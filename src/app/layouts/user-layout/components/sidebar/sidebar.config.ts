export interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
  soft?: boolean;
}

export const SIDEBAR_MENU: SidebarItem[] = [
  { label: 'Tổng quan', icon: '📊', link: '/user-dashboard', exact: true },
  { label: 'Tạo bài học', icon: '✏️', link: '/user-dashboard/create-lesson', soft: true },
  { label: 'Danh sách bài', icon: '📚', link: '/user-dashboard/lessons' },
];
