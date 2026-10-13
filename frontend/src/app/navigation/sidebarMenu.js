const sidebarMenu = [
  {
    id: 'main',
    title: 'مدیریت اصلی',
    items: [
      {
        id: 'dashboard',
        label: 'پیشخوان',
        path: '/',
        icon: 'bi-grid-1x2',
      },
    ],
  },
  {
    id: 'content',
    title: 'مدیریت محتوا',
    items: [
      {
        id: 'content-management',
        label: 'مدیریت محتوا',
        icon: 'bi-file-earmark-text',
        children: [
          {
            id: 'content-list',
            label: 'مطالب',
            path: '/content',
            icon: 'bi-file-earmark-text',
          },
          {
            id: 'categories',
            label: 'دسته‌بندی‌ها',
            path: '/categories',
            icon: 'bi-folder2-open',
          },
          {
            id: 'media',
            label: 'رسانه‌ها',
            path: '/media',
            icon: 'bi-images',
          },
        ],
      },
    ],
  },
  {
    id: 'users',
    title: 'مدیریت کاربران',
    items: [
      {
        id: 'users-management',
        label: 'مدیریت کاربران',
        icon: 'bi-people',
        children: [
          {
            id: 'user-management',
            label: 'کاربران',
            icon: 'bi-person-lines-fill',
            children: [
              {
                id: 'user-list',
                label: 'فهرست کاربران',
                path: '/users',
                icon: 'bi-list-ul',
              },
              {
                id: 'user-details',
                label: 'جزئیات کاربر',
                path: '/users/details',
                icon: 'bi-person-vcard',
              },
            ],
          },
          {
            id: 'roles',
            label: 'نقش‌ها و دسترسی‌ها',
            path: '/roles',
            icon: 'bi-shield-lock',
          },
          {
            id: 'positions',
            label: 'سمت‌ها',
            path: '/positions',
            icon: 'bi-person-badge',
          },
        ],
      },
    ],
  },
  {
    id: 'system',
    title: 'سیستم',
    items: [
      {
        id: 'system-management',
        label: 'مدیریت سیستم',
        icon: 'bi-sliders',
        children: [
          {
            id: 'activity',
            label: 'گزارش فعالیت',
            path: '/activity',
            icon: 'bi-clock-history',
          },
          {
            id: 'settings',
            label: 'تنظیمات',
            path: '/settings',
            icon: 'bi-gear',
          },
        ],
      },
    ],
  },
]

export default sidebarMenu
