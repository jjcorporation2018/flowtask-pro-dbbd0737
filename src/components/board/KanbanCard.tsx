import { Card } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanban-store';
import { CheckSquare, Calendar, MessageSquare, Paperclip, Clock, User } from 'lucide-react';

interface Props {
  card: Card;
  listColor?: string;
  onClick: () => void;
}

const KanbanCardComponent = ({ card, listColor, onClick }: Props) => {
  const { labels, members, updateCard } = useKanbanStore();
  const cardLabels = labels.filter(l => card.labels.includes(l.id));
  const assignedMember = members.find(m => m.id === card.assignee);
  const checkDone = card.checklist.filter(i => i.completed).length;
  const checkTotal = card.checklist.length;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completed;
  const hasOverdueMilestone = card.milestones && card.milestones.some(m => !m.completed && m.dueDate && new Date(m.dueDate) < new Date());

  if (card.archived || card.trashed) return null;

  // Hex to rgba helper for the background tint (15% opacity) and border (30% opacity)
  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return '';
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const cardStyle = listColor ? {
    backgroundColor: hexToRgba(listColor, 0.08), // softer background 
    borderColor: hexToRgba(listColor, 0.2) // softer border
  } : {};

  return (
    <div className={`kanban-card group shadow-md hover:shadow-lg transition-[box-shadow,border-color,background-color] duration-200 backdrop-blur-sm border relative overflow-hidden ${card.completed ? 'opacity-70 grayscale-[0.3]' : 'bg-card'}`} style={cardStyle} onClick={onClick}>
      {/* Title */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-bold leading-snug text-foreground ${card.completed ? 'line-through text-muted-foreground' : ''}`}>{card.title}</p>

        {/* Toggle Completed Button */}
        <button
          onClick={(e) => { e.stopPropagation(); updateCard(card.id, { completed: !card.completed }); }}
          className={`shrink-0 p-1.5 rounded-full transition-colors border ${card.completed ? 'bg-label-green text-white border-label-green' : 'bg-secondary/50 text-muted-foreground border-border hover:bg-label-green/20 hover:text-label-green hover:border-label-green/50 opacity-0 group-hover:opacity-100'}`}
          title={card.completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Summary preview */}
      {card.summary && (
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 block">{card.summary}</p>
      )}

      {/* Dates */}
      {(card.startDate || card.dueDate) && (
        <div className="flex items-center gap-2 mt-1.5">
          {card.startDate && (
            <span className="text-[10px] text-muted-foreground font-medium">
              Início: {new Date(card.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {card.startDate && card.dueDate && <span className="text-[10px] text-muted-foreground">→</span>}
          {card.dueDate && (
            <span className={`flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded font-medium ${card.completed ? 'bg-label-green/20 text-label-green' : isOverdue ? 'bg-label-red/20 text-label-red' : 'text-muted-foreground bg-secondary/50'
              }`}>
              <Calendar className="h-2.5 w-2.5" />
              Entrega: {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      {(checkTotal > 0 || card.comments.length > 0 || card.attachments.length > 0 || card.timeEntries.length > 0 || card.assignee || hasOverdueMilestone || (card.milestones && card.milestones.length > 0)) && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {hasOverdueMilestone && (
            <span className="flex items-center gap-0.5 text-[10px] text-label-red bg-label-red/10 px-1 py-0.5 rounded font-medium" title="Existem etapas (milestones) atrasadas neste cartão!">
              <Clock className="h-2.5 w-2.5" /> Atraso
            </span>
          )}
          {card.milestones && card.milestones.length > 0 && !hasOverdueMilestone && (
            <span className="flex items-center gap-0.5 text-[10px] text-blue-400 bg-blue-400/10 px-1 py-0.5 rounded" title={`${card.milestones.filter(m => m.completed).length}/${card.milestones.length} etapas concluídas`}>
              <CheckSquare className="h-2.5 w-2.5" /> {card.milestones.filter(m => m.completed).length}/{card.milestones.length}
            </span>
          )}
          {checkTotal > 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] ${checkDone === checkTotal ? 'text-label-green' : 'text-muted-foreground'}`}>
              <CheckSquare className="h-2.5 w-2.5" />
              {checkDone}/{checkTotal}
            </span>
          )}
          {card.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MessageSquare className="h-2.5 w-2.5" />
              {card.comments.length}
            </span>
          )}
          {card.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Paperclip className="h-2.5 w-2.5" />
              {card.attachments.length}
            </span>
          )}
          {card.timeEntries.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {Math.round(card.timeEntries.reduce((t, e) => t + e.duration, 0) / 60)}m
            </span>
          )}
          {assignedMember && (
            <div className="ml-auto" title={assignedMember.name}>
              <img src={assignedMember.avatar} alt={assignedMember.name} className="w-5 h-5 rounded-full object-cover border border-border" />
            </div>
          )}
        </div>
      )}

      {/* Labels - Moved to the bottom */}
      {cardLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {cardLabels.map(label => (
            <span
              key={label.id}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${label.color}dd, ${label.color})` }}
            >
              {label.icon && <span>{label.icon}</span>}
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Creation date */}
      <div className="mt-2.5 pt-2 border-t border-border/30 text-[9px] text-muted-foreground font-medium opacity-80 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          Criada em {new Date(card.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        {card.completed && (
          <span className="text-label-green font-bold flex items-center gap-1"><CheckSquare className="w-2.5 h-2.5" /> Concluída</span>
        )}
      </div>
    </div>
  );
};

export default KanbanCardComponent;
