import { useMemo, useState } from 'react';
import { featureCategories, features } from '../data/features';
import { useLanguage } from '../context/LanguageContext';
import FeatureCard from './FeatureCard';
import FeatureModal from './FeatureModal';

export default function Features() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const visibleFeatures = useMemo(() => {
    return features.filter((feature) => filter === 'all' || feature.category === filter);
  }, [filter]);

  return (
    <section id="features">
      <div className="wrap">
        <p className="section-kicker">{t('feat_kicker')}</p>
        <h2 className="section-title reveal">{t('feat_title')}</h2>
        <p className="section-intro reveal">{t('feat_body')}</p>

        <div className="filters" role="tablist" aria-label={t('feat_filters')}>
          {Object.entries(featureCategories).map(([key, label]) => (
            <button
              key={key}
              type="button"
              data-filter={key}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="feature-grid">
          {visibleFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={{ ...feature, categoryLabel: t(`cat_${feature.category}`) }}
              onOpen={() => setSelected(feature)}
            />
          ))}
        </div>
      </div>

      <FeatureModal feature={selected ? { ...selected, title: selected.title, description: selected.description } : null} onClose={() => setSelected(null)} />
    </section>
  );
}
