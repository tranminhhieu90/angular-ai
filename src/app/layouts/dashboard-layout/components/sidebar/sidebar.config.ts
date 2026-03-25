export interface SidebarChild {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
}

export interface SidebarGroup {
  label: string;
  icon: string;
  badge?: string;
  children: SidebarChild[];
}

export const SIDEBAR_MENU: SidebarGroup[] = [
  {
    label: 'Dashboard',
    icon: '@tui.layout-dashboard',
    children: [
      { label: 'eCommerce', icon: '@tui.shopping-cart', link: '/dashboard', exact: true },
      { label: 'User Profile', icon: '@tui.circle-user', link: '/dashboard/profile' },
      { label: 'User Management', icon: '@tui.users', link: '/dashboard/users' },
      { label: 'Orders', icon: '@tui.package', link: '/dashboard/orders' },
      { label: 'Media', icon: '@tui.image', link: '/dashboard/photos' },
    ],
  },
  {
    label: 'AI Assistant',
    icon: '@tui.bot',
    badge: 'NEW',
    children: [
      { label: 'Text Generator', icon: '@tui.text', link: '#' },
      { label: 'Image Generator', icon: '@tui.image', link: '#' },
      { label: 'Code Generator', icon: '@tui.code', link: '#' },
    ],
  },
];
