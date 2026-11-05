import { useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { Home, Search, PlusSquare, Heart, Image as ImageIcon, CircleDashed, Clapperboard, Send, Menu } from 'lucide-react';
import Avatar from './Avatar';
import { SigilMark } from './Brand';
import AccountSwitcher from './AccountSwitcher';
import { Sheet, SheetItem } from './ui';
import { useSession } from '../state/session';
import { useUnread } from '../state/unread';
import { emit } from '../lib/events';

// No celular é a barra de baixo; no computador (tela larga) vira a barra
// lateral, com nomes, Direct, Atividade e a troca de personagem (o CSS
// reordena e mostra os itens marcados com --desk).
const Label = ({ children }) => <span className="bottomnav__label">{children}</span>;

const HeartIcon = ({ isActive, dot }) => (
  <span className="nav-icon-wrap">
    <Heart size={27} strokeWidth={isActive ? 2.4 : 1.8} fill={isActive ? 'currentColor' : 'none'} />
    {dot && <span className="nav-dot" />}
  </span>
);

export default function BottomNav() {
  const { active, can } = useSession();
  // com vídeos, Reels ganha o lugar do coração, que vai para o topo do feed (como no Instagram)
  const reels = can('videos');
  const { notifications, messages, others } = useUnread(active?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const press = useRef(null);

  const profilePath = active ? `/u/${active.handle}` : '/';
  const onProfile = location.pathname === profilePath;

  // Segurar o ícone do perfil abre a troca de personagem (como no Instagram)
  const startPress = () => {
    clearTimeout(press.current);
    press.current = setTimeout(() => {
      press.current = 'fired';
      if (navigator.vibrate) navigator.vibrate(10);
      setSwitchOpen(true);
    }, 450);
  };
  const cancelPress = () => {
    if (press.current !== 'fired') {
      clearTimeout(press.current);
      press.current = null;
    }
  };

  return (
    <>
      <nav className="bottomnav" aria-label="Navegação principal">
        <Link to="/" className="bottomnav__logo" aria-label="EtmosGram">
          <SigilMark size={28} />
          <span className="wordmark">etmosgram</span>
        </Link>
        <NavLink
          to="/"
          end
          className="bottomnav__item bottomnav__item--home"
          aria-label="Início"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              emit('home:refresh');
            }
          }}
        >
          {({ isActive }) => (
            <>
              <Home size={27} strokeWidth={isActive ? 2.6 : 1.8} />
              <Label>Início</Label>
            </>
          )}
        </NavLink>
        <NavLink to="/explorar" className="bottomnav__item bottomnav__item--explore" aria-label="Explorar">
          {({ isActive }) => (
            <>
              <Search size={27} strokeWidth={isActive ? 2.8 : 1.8} />
              <Label>Explorar</Label>
            </>
          )}
        </NavLink>
        <button type="button" className="bottomnav__item bottomnav__item--create" aria-label="Criar" onClick={() => setCreateOpen(true)}>
          <PlusSquare size={27} strokeWidth={1.8} />
          <Label>Criar</Label>
        </button>
        {reels && (
          <NavLink to="/reels" className="bottomnav__item bottomnav__item--reels" aria-label="Reels">
            {({ isActive }) => (
              <>
                <Clapperboard size={27} strokeWidth={isActive ? 2.4 : 1.8} />
                <Label>Reels</Label>
              </>
            )}
          </NavLink>
        )}
        <NavLink to="/direct" className="bottomnav__item bottomnav__item--desk bottomnav__item--direct" aria-label="Direct">
          {({ isActive }) => (
            <>
              <span className="nav-icon-wrap">
                <Send size={26} strokeWidth={isActive ? 2.4 : 1.8} />
                {messages > 0 && <span className="nav-count">{messages > 99 ? '99+' : messages}</span>}
              </span>
              <Label>Direct</Label>
            </>
          )}
        </NavLink>
        {/* com Reels, no celular o coração fica no topo do feed; no computador, aqui */}
        <NavLink to="/atividade" className={`bottomnav__item bottomnav__item--activity ${reels ? 'bottomnav__item--desk' : ''}`} aria-label="Atividade">
          {({ isActive }) => (
            <>
              <HeartIcon isActive={isActive} dot={notifications > 0} />
              <Label>Atividade</Label>
            </>
          )}
        </NavLink>
        <button
          type="button"
          className="bottomnav__item bottomnav__item--profile"
          aria-label="Seu perfil (segure para trocar de personagem)"
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onClick={() => {
            if (press.current === 'fired') {
              press.current = null;
              return;
            }
            navigate(profilePath);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            // no computador, o botão direito troca de personagem
            if (matchMedia('(hover: hover) and (pointer: fine)').matches) setSwitchOpen(true);
          }}
        >
          <span className={`nav-avatar ${onProfile ? 'is-active' : ''}`}>
            <Avatar character={active} size={26} />
            {others > 0 && <span className="nav-dot nav-dot--avatar" />}
          </span>
          <Label>Perfil</Label>
        </button>
        <button type="button" className="bottomnav__item bottomnav__item--desk bottomnav__item--switch" aria-label="Trocar de personagem" onClick={() => setSwitchOpen(true)}>
          <span className="nav-icon-wrap">
            <Menu size={26} strokeWidth={1.8} />
            {others > 0 && <span className="nav-dot" />}
          </span>
          <Label>Trocar personagem</Label>
        </button>
      </nav>

      <Sheet open={createOpen} onClose={() => setCreateOpen(false)} title="Criar">
        <SheetItem
          icon={<ImageIcon size={24} />}
          onClick={() => {
            setCreateOpen(false);
            navigate('/criar/post');
          }}
        >
          Publicação
        </SheetItem>
        <SheetItem
          icon={<CircleDashed size={24} />}
          onClick={() => {
            setCreateOpen(false);
            navigate('/criar/story');
          }}
        >
          Story
        </SheetItem>
        {reels && (
          <SheetItem
            icon={<Clapperboard size={24} />}
            onClick={() => {
              setCreateOpen(false);
              navigate('/criar/reel');
            }}
          >
            Reel
          </SheetItem>
        )}
      </Sheet>

      <AccountSwitcher open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </>
  );
}
