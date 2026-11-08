import Workshop from './workshop/Workshop';
import { useHashSection } from './shared/hooks/useHashSection';

function App() {
  const [sectionIdFromUrl, onSectionChange] = useHashSection();

  return <Workshop sectionIdFromUrl={sectionIdFromUrl} onSectionChange={onSectionChange} />;
}

export default App;
