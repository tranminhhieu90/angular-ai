export interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
  soft?: boolean;
}

export const SIDEBAR_MENU: SidebarItem[] = [
  { label: 'Tổng quan', icon: '@tui.graduation-cap', link: '/user-dashboard', exact: true },
  {
    label: 'Tạo bài học',
    icon: '@tui.book-plus',
    link: '/user-dashboard/create-lesson',
    soft: true,
  },
  { label: 'Danh sách bài', icon: '@tui.library-big', link: '/user-dashboard/lessons' },
];
