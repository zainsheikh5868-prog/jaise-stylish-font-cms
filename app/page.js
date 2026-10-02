import { supabasePublic } from '../lib/supabase-browser';
import RuntimeIngestor from '../components/RuntimeIngestor';
import FontGenerator from '../components/FontGenerator';

export const revalidate = 60;

async function getData() {
  try {
    const { data: settings } = await supabasePublic
      .from('site_settings')
      .select('*')
      .single();
    return settings || {};
  } catch (e) {
    return {};
  }
}

export default async function HomePage() {
  const settings = await getData();

  return (
    <>
      <header className="site-header">
        <RuntimeIngestor />
      </header>
      <main className="container">
        <FontGenerator settings={settings} />
      </main>
    </>
  );
}
