import { useKanbanStore } from '@/store/kanban-store';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    boardId: string;
    onCardClick: (cardId: string) => void;
}

export const BoardCalendarView = ({ boardId, onCardClick }: Props) => {
    const { cards, lists, labels } = useKanbanStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const boardLists = lists.filter(l => l.boardId === boardId && !l.archived && !l.trashed);
    const boardCards = cards.filter(c => boardLists.some(l => l.id === c.listId) && !c.archived && !c.trashed);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
        <div className="flex-1 flex flex-col p-4 overflow-hidden" style={{ zoom: 1 }}>
            <div className="flex items-center justify-between mb-4 bg-card p-3 rounded-lg shadow-sm border border-border shrink-0">
                <h3 className="text-lg font-bold text-foreground">
                    {monthNames[month]} {year}
                </h3>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded bg-secondary hover:bg-secondary/80 text-xs font-semibold transition-colors">Hoje</button>
                    <button onClick={handleNextMonth} className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-card rounded-lg shadow-sm border border-border flex flex-col min-h-[500px]">
                <div className="grid grid-cols-7 border-b border-border bg-muted/30 shrink-0">
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)] flex-1">
                    {days.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="border-r border-b border-border/50 bg-muted/10 p-2" />;
                        }
                        const dateCards = boardCards.filter(c => {
                            if (!c.dueDate) return false;
                            const d = new Date(c.dueDate);
                            return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
                        });
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div key={date.toISOString()} className={`border-r border-b border-border/50 p-1.5 flex flex-col gap-1 overflow-hidden hover:bg-accent/5 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                                <div className="flex justify-between items-center mb-1 px-1">
                                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                                        {date.getDate()}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 px-1">
                                    {dateCards.map(card => {
                                        const cardLabels = labels.filter(l => card.labels.includes(l.id));
                                        const primaryColor = cardLabels.length > 0 ? cardLabels[0].color : '#3b82f6';
                                        return (
                                            <div
                                                key={card.id}
                                                onClick={() => onCardClick(card.id)}
                                                className="text-[10px] truncate px-1.5 py-1 rounded cursor-pointer transition-opacity hover:opacity-80 text-white font-medium shadow-sm"
                                                style={{ backgroundColor: primaryColor }}
                                                title={card.title}
                                            >
                                                {card.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
