import { Bell, CheckCircle, Info, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationBell() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock Notifications (In reality, fetch from API_BASE/operations/notifications/)
  const [notifications, setNotifications] = useState([
    { id: 1, title: t('notifications.appointment_confirmed.title'), message: t('notifications.appointment_confirmed.message'), type: 'appointment', is_read: false, time: `2 ${t('admin.admin_dashboard.hours')} ${t('admin.admin_dashboard.ago')}` },
    { id: 2, title: t('notifications.item_shipped.title'), message: t('notifications.item_shipped.message'), type: 'info', is_read: false, time: `1 ${t('admin.admin_dashboard.day')} ${t('admin.admin_dashboard.ago')}` },
    { id: 3, title: t('notifications.welcome.title'), message: t('notifications.welcome.message'), type: 'info', is_read: true, time: `3 ${t('admin.admin_dashboard.hours')} ${t('admin.admin_dashboard.ago')}` },
  ]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({...n, is_read: true})));
    // In production: PATCH /api/v1/operations/notifications/mark_all_read/
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-silver-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-premium-900"></span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-premium-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-premium-900/50">
              <h3 className="font-bold text-white">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-gold-500 hover:text-gold-400 font-semibold">
                  {t('notifications.mark_read')}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 hover:bg-premium-700/50 transition-colors flex gap-4 ${!notif.is_read ? 'bg-white/[0.02]' : ''}`}>
                      <div className="mt-1 flex-shrink-0">
                        {notif.type === 'appointment' ? <Calendar className="w-5 h-5 text-gold-500" /> : 
                         notif.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : 
                         <Info className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold mb-1 ${!notif.is_read ? 'text-white' : 'text-silver-300'}`}>{notif.title}</h4>
                        <p className="text-xs text-silver-400 leading-relaxed mb-2">{notif.message}</p>
                        <span className="text-[10px] uppercase tracking-wider text-silver-600 font-bold">{notif.time}</span>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-silver-500">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">{t('notifications.empty')}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-premium-900/80 text-center">
              <button className="text-xs text-silver-400 hover:text-white font-semibold uppercase tracking-wider">{t('notifications.view_history')}</button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
