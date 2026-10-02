import AdminShell from '../../components/AdminShell';
export const metadata={title:'Admin Control Panel',robots:{index:false,follow:false}};
export default function Layout({children}){return <AdminShell>{children}</AdminShell>}
