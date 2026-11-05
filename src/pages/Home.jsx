import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Send, Camera, Heart } from 'lucide-react';
import { TopBar, IconButton, Spinner, EmptyState, ErrorBox } from '../components/ui';
import { Wordmark } from '../components/Brand';
import PostCard from '../components/PostCard';
import StoriesTray from '../components/StoriesTray';
import PullToRefresh from '../components/PullToRefresh';
import InstallBanner from '../components/InstallBanner';
import AccountSwitcher from '../components/AccountSwitcher';
import CharacterRow, { FollowButton } from '../components/CharacterRow';
import { useSession } from '../state/session';
import { useUnread } from '../state/unread';
import { useInfinite, useOnVisible, useAsync, useMedia } from '../lib/hooks';
import { on } from '../lib/events';
import { pageCache } from '../lib/storage';
import * as api from '../lib/api';

export function usePostListEvents(setItems) {
  useEffect(() => {
    const offU = on('post:update', ({ id, patch }) => setItems((xs) => xs.map((p) => (p.id === id ? { ...p, ...patch } : p))));
    const offD = on('post:delete', (id) => setItems((xs) => xs.filter((p) => p.id !== id)));
    return () => {
      offU();
      offD();
    };
  }, [setItems]);
}

function Suggestions({ limit = 12 }) {
  const { active } = useSession();
  const { data } = useAsync(`suggest:${active.id}`, () => api.suggested(active.id), [active.id]);
  if (!data?.length) return null;
  return (
    <section className="suggest">
      <h3 className="section-title">Sugestões para você</h3>
      {data.slice(0, limit).map((c) => (
        <CharacterRow key={c.id} character={c} sub={c.follows_you ? 'Segue você' : c.name} right={<FollowButton character={c} />} />
      ))}
    </section>
  );
}

// Coluna da direita (só em telas bem largas): quem está usando e sugestões
const RAIL_QUERY = '(min-width: 1160px)';

function HomeRail() {
  const { active, characters } = useSession();
  const [switchOpen, setSwitchOpen] = useState(false);
  return (
    <aside className="home-rail">
      <CharacterRow
        character={active}
        size={48}
        right={
          characters.length > 1 && (
            <button type="button" className="link-btn" onClick={() => setSwitchOpen(true)}>
              Trocar
            </button>
          )
        }
      />
      <Suggestions limit={6} />
      <p className="home-rail__foot muted small">EtmosGram · feito para a mesa de Etmos</p>
      <AccountSwitcher open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </aside>
  );
}

export default function Home() {
  const { active, can } = useSession();
  const { messages, notifications } = useUnread(active.id);
  const navigate = useNavigate();
  const [trayKey, setTrayKey] = useState(0);
  const wide = useMedia(RAIL_QUERY);
  const key = `feed:${active.id}`;
  const feed = useInfinite(key, (before) => api.feed(active.id, before), { pageSize: 8 });
  usePostListEvents(feed.setItems);
  const sentinel = useOnVisible(feed.loadMore, !feed.done && !feed.loading && feed.items.length > 0);

  const refresh = async () => {
    setTrayKey((k) => k + 1);
    pageCache.delete(`suggest:${active.id}`);
    await feed.reload();
  };

  useEffect(() => on('home:refresh', refresh));
  useEffect(
    () =>
      on('feed:stale', () => {
        pageCache.delete(key);
        feed.reload();
      }),
    [key] // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => on('post:create', () => feed.reload()), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page page--home">
      <TopBar
        left={
          <button type="button" className="logo-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="EtmosGram">
            <Wordmark />
          </button>
        }
        right={
          <>
            <IconButton label="Novo story" onClick={() => navigate('/criar/story')}>
              <Camera size={25} strokeWidth={1.8} />
            </IconButton>
            {/* com Reels na barra de baixo, a atividade fica aqui em cima */}
            {can('videos') && (
              <IconButton label="Atividade" onClick={() => navigate('/atividade')} badge={notifications > 0}>
                <Heart size={25} strokeWidth={1.8} />
              </IconButton>
            )}
            <IconButton label="Direct" onClick={() => navigate('/direct')} badge={messages || 0}>
              <Send size={24} strokeWidth={1.8} />
            </IconButton>
          </>
        }
      />
      <PullToRefresh onRefresh={refresh}>
        <InstallBanner />
        <StoriesTray refreshKey={trayKey} />
        <div className="feed">
          {feed.items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {feed.loading && (
            <div className="center-pad">
              <Spinner />
            </div>
          )}
          {feed.error && <ErrorBox onRetry={feed.reload}>{feed.error}</ErrorBox>}
          {!feed.loading && !feed.error && feed.items.length === 0 && (
            <>
              <EmptyState title="Seu feed está vazio">Siga outros personagens para ver as publicações deles aqui.</EmptyState>
              <Suggestions />
            </>
          )}
          {feed.done && feed.items.length > 0 && (
            <div className="feed-end">
              <p className="muted">Você está em dia ✨</p>
              {!wide && <Suggestions />}
            </div>
          )}
          <div ref={sentinel} />
        </div>
      </PullToRefresh>
      {wide && <HomeRail />}
    </div>
  );
}
