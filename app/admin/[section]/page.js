import {notFound} from 'next/navigation'; import ResourceEditor from '../../../components/ResourceEditor'; import {resources} from '../../../lib/admin-resources';
export default async function Page({params}){const {section}=await params;if(['media','backups'].includes(section))return null;const cfg=resources[section];if(!cfg)notFound();return <ResourceEditor cfg={cfg}/>}
