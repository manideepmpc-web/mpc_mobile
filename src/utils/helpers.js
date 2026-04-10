export const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
};

export const daysBetween = (from, to) => {
    const f = new Date(from);
    const t = new Date(to);
    return Math.ceil((t - f) / (1000 * 60 * 60 * 24)) + 1;
};

export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export const formatDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';
    const ms = new Date(checkOut) - new Date(checkIn);
    const totalMins = Math.floor(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
};
