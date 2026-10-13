import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import sidebarMenu from '../app/navigation/sidebarMenu'

function getPaths(items) {
  return items.flatMap((item) => [
    ...(item.path ? [item.path] : []),
    ...(item.children ? getPaths(item.children) : []),
  ])
}

function getActivePath(pathname, items) {
  return getPaths(items)
    .filter(
      (path) =>
        path === '/' ? pathname === '/' : (
          pathname === path || pathname.startsWith(`${path}/`)
        ),
    )
    .sort((a, b) => b.length - a.length)[0]
}

function getOpenAncestorIds(items, activePath, ancestors = []) {
  for (const item of items) {
    const currentAncestors = [...ancestors, item.id]

    if (item.path && item.path === activePath) {
      return ancestors
    }

    if (item.children) {
      const result = getOpenAncestorIds(
        item.children,
        activePath,
        currentAncestors,
      )

      if (result) return result
    }
  }

  return null
}

function containsActivePath(item, activePath) {
  if (item.path && item.path === activePath) return true

  return item.children?.some((child) =>
    containsActivePath(child, activePath),
  ) ?? false
}

function MenuItem({
  item,
  depth,
  collapsed,
  activePath,
  expandedIds,
  onToggle,
  onNavigate,
  onExpandSidebar,
}) {
  const hasChildren = Boolean(item.children?.length)
  const isActive = Boolean(item.path && item.path === activePath)
  const hasActiveDescendant =
    hasChildren && containsActivePath(item, activePath)
  const isOpen = expandedIds.includes(item.id) || hasActiveDescendant
  const submenuId = `sidebar-submenu-${item.id}`

  if (!hasChildren) {
    return (
      <NavLink
        to={item.path}
        end
        title={collapsed ? item.label : undefined}
        onClick={onNavigate}
        className={`sidebar-link sidebar-depth-${depth} ${
          isActive ? 'active' : ''
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <i className={`bi ${item.icon || 'bi-circle'}`} />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    )
  }

  return (
    <div
      className={[
        'sidebar-node',
        `sidebar-depth-${depth}`,
        isOpen ? 'is-open' : '',
        hasActiveDescendant ? 'has-active-descendant' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="sidebar-link sidebar-parent"
        title={collapsed ? item.label : undefined}
        aria-expanded={collapsed ? undefined : isOpen}
        aria-controls={collapsed ? undefined : submenuId}
        onClick={() => {
          if (collapsed) {
            onExpandSidebar()
            return
          }

          onToggle(item.id)
        }}
      >
        <i className={`bi ${item.icon || 'bi-folder'}`} />
        {!collapsed && (
          <>
            <span>{item.label}</span>
            <i
              className={`bi sidebar-chevron ${
                isOpen ? 'bi-chevron-down' : 'bi-chevron-left'
              }`}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {!collapsed && (
        <div
          id={submenuId}
          className={`sidebar-submenu ${isOpen ? 'is-open' : ''}`}
          hidden={!isOpen}
        >
          {item.children.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              collapsed={collapsed}
              activePath={activePath}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onNavigate={onNavigate}
              onExpandSidebar={onExpandSidebar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminSidebar({
  collapsed,
  onNavigate,
  onExpandSidebar,
}) {
  const { pathname } = useLocation()
  const activePath = getActivePath(pathname, sidebarMenu.flatMap(
    (section) => section.items,
  ))

  const routeOpenIds = getOpenAncestorIds(
    sidebarMenu.flatMap((section) => section.items),
    activePath,
  ) || []

  const [expandedState, setExpandedState] = useState({
    pathname,
    ids: routeOpenIds,
  })

  const expandedIds = expandedState.pathname === pathname
    ? expandedState.ids
    : routeOpenIds

  function toggleItem(id) {
    setExpandedState((previous) => {
      const currentIds = previous.pathname === pathname
        ? previous.ids
        : routeOpenIds

      const isExpanded = currentIds.includes(id)

      return {
        pathname,
        ids: isExpanded
          ? currentIds.filter((currentId) => currentId !== id)
          : [...currentIds, id],
      }
    })
  }

  return (
    <aside className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <i className="bi bi-layers-half" />
        </div>

        {!collapsed && (
          <div className="brand-copy">
            <strong>Modern CMS</strong>
            <span>پنل مدیریت محتوا</span>
          </div>
        )}
      </div>

      <div className="sidebar-scroll">
        {sidebarMenu.map((section) => (
          <div className="sidebar-section" key={section.id}>
            {!collapsed && (
              <div className="sidebar-section-title">
                {section.title}
              </div>
            )}

            {section.items.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                depth={0}
                collapsed={collapsed}
                pathname={pathname}
                activePath={activePath}
                expandedIds={expandedIds}
                onToggle={toggleItem}
                onNavigate={onNavigate}
                onExpandSidebar={onExpandSidebar}
              />
            ))}
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <i className="bi bi-life-preserver" />
          </div>
          <div>
            <strong>نیاز به راهنمایی دارید؟</strong>
            <span>مرکز راهنمای سیستم</span>
          </div>
        </div>
      )}
    </aside>
  )
}
