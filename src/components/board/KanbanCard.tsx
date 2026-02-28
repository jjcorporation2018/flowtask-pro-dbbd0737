import { Card } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanban-store';
import { CheckSquare, Calendar, MessageSquare, Paperclip, Clock, User } from 'lucide-react';

interface Props {
  card: Card;
  listColor?: string;
  onClick: () => void;
}

const KanbanCardComponent = ({ card, listColor, onClick }: Props) => {
  const { labels, members } = useKanbanStore();
  const cardLabels = labels.filter(l => card.labels.includes(l.id));
  const assignedMember = members.find(m => m.id === card.assignee);
  const checkDone = card.checklist.filter(i => i.completed).length;
  const checkTotal = card.checklist.length;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completed;
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
    <div className="kanban-card shadow-md shadow-black/40 hover:shadow-lg hover:shadow-black/60 transition-all backdrop-blur-sm border" style={cardStyle} onClick={onClick}>
      {/* Labels with names */}
      {cardLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {cardLabels.map(label => (
            <span
              key={label.id}
              className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-sm text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.icon && <span>{label.icon}</span>}
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-xs font-semibold leading-snug text-white">{card.title}</p>

      {/* Summary preview */}
      {card.summary && (
        <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-1 block">{card.summary}</p>
      )}

      {/* Dates */}
      {(card.startDate || card.dueDate) && (
        <div className="flex items-center gap-2 mt-1.5">
          {card.startDate && (
            <span className="text-[10px] text-gray-400">
              {new Date(card.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {card.startDate && card.dueDate && <span className="text-[10px] text-gray-400">→</span>}
          {card.dueDate && (
            <span className={`flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded ${card.completed ? 'bg-label-green/20 text-label-green' : isOverdue ? 'bg-label-red/20 text-label-red' : 'text-gray-300'
              }`}>
              <Calendar className="h-2.5 w-2.5" />
              {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      {(checkTotal > 0 || card.comments.length > 0 || card.attachments.length > 0 || card.timeEntries.length > 0 || card.assignee) && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {checkTotal > 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] ${checkDone === checkTotal ? 'text-label-green' : 'text-gray-400'}`}>
              <CheckSquare className="h-2.5 w-2.5" />
              {checkDone}/{checkTotal}
            </span>
          )}
          {card.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <MessageSquare className="h-2.5 w-2.5" />
              {card.comments.length}
            </span>
          )}
          {card.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <Paperclip className="h-2.5 w-2.5" />
              {card.attachments.length}
            </span>
          )}
          {card.timeEntries.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
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

      {/* Creation date */}
      <div className="mt-2 pt-2 border-t border-border/30 text-[9px] text-gray-400 font-medium opacity-80 flex items-center gap-1">
        <Clock className="w-2.5 h-2.5" />
        {new Date(card.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
};

export default KanbanCardComponent;
