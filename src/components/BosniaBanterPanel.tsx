import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  loadBosniaBanter,
  resolveBanterMessage,
  type BosniaBanterData,
} from '../lib/bosniaBanter';

export function BosniaBanterPanel() {
  const {
    persona,
    activeStadium,
    selectedTeam,
    banterOpponentId,
    banterKnockoutMode,
    teams,
  } = useApp();

  const [data, setData] = useState<BosniaBanterData | null>(null);

  useEffect(() => {
    loadBosniaBanter().then(setData);
  }, []);

  const message = useMemo(() => {
    if (!data || !persona) return null;

    if (banterKnockoutMode) {
      return {
        title: 'Bosnia > the bracket',
        body: data.knockoutFixture,
      };
    }

    return resolveBanterMessage({
      persona,
      stadiumId: activeStadium?.id ?? null,
      cityLabel: activeStadium?.city ?? 'this city',
      selectedTeam,
      banterOpponentId,
      teams,
      data,
    });
  }, [
    data,
    persona,
    activeStadium,
    selectedTeam,
    banterOpponentId,
    banterKnockoutMode,
    teams,
  ]);

  const kicker = data?.panelKicker ?? 'Peer-reviewed by ćevapi';

  if (!message) return null;

  return (
    <section className="bosnia-banter" aria-label="Bosnia banter">
      <p className="bosnia-banter-kicker">{kicker}</p>
      <h3 className="bosnia-banter-title">{message.title}</h3>
      <p className="bosnia-banter-body">{message.body}</p>
      {message.hint && <p className="bosnia-banter-hint">{message.hint}</p>}
    </section>
  );
}
