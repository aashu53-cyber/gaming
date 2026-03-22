function renderSidebar() {
    const sideNav = document.getElementById('sidebar-nav');
    if (!sideNav) return;

    sideNav.innerHTML = sidebarIcons.map(item => `
        <a href="#" class="${item.active ? 'active' : ''}" id="nav-${item.id}">
            <i class="${item.icon}"></i>
        </a>
    `).join('');
}