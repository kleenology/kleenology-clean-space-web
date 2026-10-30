import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';

const container = document.getElementById('root')!

// الصفحات المصيَّرة مسبقاً (scripts/prerender.mjs) فيها HTML جاهز للزوار
// والروبوتات. نرسم فوقه من جديد بدل hydrateRoot: بعض المكونات تقرأ من
// المتصفح (localStorage، حجم الشاشة) فتختلف عن نسخة البناء، والرسم الجديد
// يتجنب أخطاء عدم التطابق. الرسم يحل محل المحتوى نفسه فلا يظهر وميض.
createRoot(container).render(<App />);
