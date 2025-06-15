
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Trophy, RotateCcw, Plus, X, Trash2, Clock, Zap, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BingoCard {
  id: string;
  task: string;
  avoided: boolean;
  date: number;
  month: number;
  year: number;
  hasCustomTask: boolean;
}

interface Task {
  id: string;
  text: string;
  isActive: boolean;
  createdAt: Date;
  lastAvoidedAt: Date;
  totalAvoidanceTime: number;
  points: number;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
}

interface ProcrastinationBingoProps {
  tasks: Task[];
  onAddTask: (taskText: string, duration: number) => void;
}

export const ProcrastinationBingo = ({ tasks, onAddTask }: ProcrastinationBingoProps) => {
  const [bingoCard, setBingoCard] = useState<BingoCard[]>([]);
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskError, setTaskError] = useState('');

  useEffect(() => {
    generateBingoCard();
  }, [currentWeekStart]);

  const generateBingoCard = () => {
    const newCard: BingoCard[] = [];
    const startDate = new Date(currentWeekStart);
    const taskTexts = [
      'Exercise', 'Clean room', 'Study', 'Call family', 'Do laundry',
      'Meal prep', 'Read book', 'Organize files', 'Pay bills', 'Water plants',
      'Write emails', 'Update resume', 'Plan week', 'Declutter', 'Learn skill',
      'Cook dinner', 'Take walk', 'Meditate', 'Social media', 'Watch series',
      'Play games', 'Listen music', 'Browse web', 'Chat friends', 'Take nap'
    ];
    
    // Generate 25 consecutive days starting from the current week
    for (let i = 0; i < 25; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Use different tasks based on index to avoid repetition
      const taskText = taskTexts[i % taskTexts.length];
      
      newCard.push({
        id: `${i}`,
        task: taskText,
        avoided: false,
        date: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        hasCustomTask: false
      });
    }
    setBingoCard(newCard);
    setCompletedLines([]);
  };

  const toggleAvoidance = (id: string) => {
    const newCard = bingoCard.map(cell => 
      cell.id === id ? { ...cell, avoided: !cell.avoided } : cell
    );
    setBingoCard(newCard);
    checkForBingo(newCard);
    
    const cell = newCard.find(c => c.id === id);
    if (cell?.avoided) {
      toast({
        title: "✅ Task Avoided!",
        description: `Great job avoiding "${cell.task}"!`,
        duration: 2000,
      });
    }
  };

  const handleCellClick = (id: string) => {
    setSelectedCell(id);
    const cell = bingoCard.find(c => c.id === id);
    if (cell) {
      setNewTaskText(cell.task || '');
    }
    setTaskError('');
    setIsDialogOpen(true);
  };

  const handleAddCustomTask = () => {
    if (!selectedCell) return;
    
    // Validation
    if (!newTaskText.trim()) {
      setTaskError('Come on! Even procrastination needs a target! 🎯');
      return;
    }
    
    if (newTaskText.trim().length < 3) {
      setTaskError('Give me more details! What masterpiece are we avoiding? 🎨');
      return;
    }
    
    if (taskDuration < 5) {
      setTaskError('At least 5 minutes! We need proper procrastination time! ⏰');
      return;
    }
    
    // Add to main task list - this should trigger points
    console.log('Adding task to main list:', newTaskText, taskDuration);
    onAddTask(newTaskText.trim(), taskDuration);
    
    // Update bingo card
    const newCard = bingoCard.map(cell => 
      cell.id === selectedCell 
        ? { ...cell, task: newTaskText.trim(), hasCustomTask: true }
        : cell
    );
    setBingoCard(newCard);
    
    // Reset and close
    setSelectedCell(null);
    setNewTaskText('');
    setTaskDuration(30);
    setTaskError('');
    setIsDialogOpen(false);
    
    // Fun success messages
    const successMessages = [
      `🎉 Perfect! "${newTaskText}" is now ready for professional avoidance!`,
      `✨ Excellent choice! "${newTaskText}" joins your elite procrastination squad!`,
      `🎯 Mission accepted! Time to expertly avoid "${newTaskText}"!`,
      `🚀 "${newTaskText}" has been added to your postponement portfolio!`,
      `🎭 Bravo! "${newTaskText}" is now part of your avoidance artistry!`
    ];
    
    const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
    
    toast({
      title: "🎊 Task Successfully Added!",
      description: randomMessage,
      duration: 4000,
    });
  };

  const handleClearTask = (cellId: string) => {
    const cell = bingoCard.find(c => c.id === cellId);
    if (!cell) return;

    // Clear task completely - make it empty
    const newCard = bingoCard.map(c => 
      c.id === cellId 
        ? { ...c, task: '', hasCustomTask: false, avoided: false }
        : c
    );
    setBingoCard(newCard);
    
    // Recheck bingo status
    checkForBingo(newCard);
    
    toast({
      title: "🗑️ Task Cleared!",
      description: "Task has been completely removed and marked as not avoided.",
      duration: 2000,
    });
  };

  const handleClearAllTasks = () => {
    // Clear all tasks from the bingo card
    const newCard = bingoCard.map(cell => ({
      ...cell,
      task: '',
      hasCustomTask: false,
      avoided: false
    }));
    setBingoCard(newCard);
    
    // Reset completed lines since all tasks are cleared
    setCompletedLines([]);
    
    toast({
      title: "🧹 All Tasks Cleared!",
      description: "All tasks have been removed from the entire bingo grid.",
      duration: 3000,
    });
  };

  const checkForBingo = (card: BingoCard[]) => {
    const lines = [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    const newCompletedLines: number[] = [];
    lines.forEach((line, index) => {
      const isComplete = line.every(pos => card[pos]?.avoided);
      if (isComplete) {
        newCompletedLines.push(index);
      }
    });

    if (newCompletedLines.length > completedLines.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({
        title: "🎉 B-I-N-G-O!",
        description: `You've completed a line of procrastination! Master level achieved!`,
        duration: 5000,
      });
    }

    setCompletedLines(newCompletedLines);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentWeekStart(newDate);
  };

  const formatDateHeader = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 24);
    
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎊</div>
          <div className="absolute top-4 left-4 text-4xl animate-pulse">✨</div>
          <div className="absolute top-4 right-4 text-4xl animate-pulse">🎉</div>
          <div className="absolute bottom-4 left-4 text-4xl animate-pulse">🌟</div>
          <div className="absolute bottom-4 right-4 text-4xl animate-pulse">🎊</div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="text-emerald-800 flex items-center gap-2 text-xl">
          <Calendar className="w-6 h-6" />
          Procrastination Calendar Bingo
          {completedLines.length > 0 && (
            <Badge className="bg-yellow-500 text-yellow-900 ml-2">
              <Trophy className="w-4 h-4 mr-1" />
              {completedLines.length} BINGO{completedLines.length > 1 ? 'S' : ''}!
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center justify-between">
          <Button onClick={() => changeWeek('prev')} variant="outline" size="sm">
            ← Previous
          </Button>
          <div className="text-sm font-medium text-emerald-700">
            {formatDateHeader()}
          </div>
          <Button onClick={() => changeWeek('next')} variant="outline" size="sm">
            Next →
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
          {bingoCard.map((cell, index) => (
            <Dialog key={cell.id}>
              <DialogTrigger asChild>
                <button
                  onClick={() => handleCellClick(cell.id)}
                  className={`
                    aspect-square p-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 relative
                    ${cell.avoided 
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg transform scale-105' 
                      : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400'
                    }
                    ${cell.hasCustomTask ? 'ring-2 ring-blue-400' : ''}
                  `}
                  title={cell.task}
                >
                  <div className="text-[10px] font-bold mb-1">
                    {cell.month}/{cell.date}
                  </div>
                  <div className="truncate leading-tight">
                    {cell.task ? (cell.task.length > 8 ? cell.task.substring(0, 8) + '...' : cell.task) : 'Empty'}
                  </div>
                  {cell.avoided && (
                    <div className="text-lg mt-1">✓</div>
                  )}
                  {cell.hasCustomTask && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🎯 Procrastination Mission for {cell.month}/{cell.date}
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-600">
                    {cell.task ? 
                      "Modify your masterpiece of postponement!" : 
                      "Create a beautiful task to professionally avoid! ✨"
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Task Input Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <label className="text-sm font-semibold text-gray-700">What shall we avoid today?</label>
                    </div>
                    <Input
                      value={newTaskText}
                      onChange={(e) => {
                        setNewTaskText(e.target.value);
                        if (taskError) setTaskError('');
                      }}
                      placeholder="e.g., Clean my room, Study for exam, Call dentist..."
                      className={`transition-all duration-200 ${taskError ? 'border-red-400 ring-red-200' : 'border-purple-300 focus:ring-purple-200'}`}
                    />
                    {taskError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {taskError}
                      </p>
                    )}
                  </div>

                  {/* Duration Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <label className="text-sm font-semibold text-gray-700">Procrastination Duration</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={taskDuration}
                        onChange={(e) => {
                          setTaskDuration(Number(e.target.value));
                          if (taskError) setTaskError('');
                        }}
                        min="5"
                        max="480"
                        className="border-purple-300 focus:ring-purple-200"
                      />
                      <span className="text-sm text-gray-500">minutes of expert avoidance</span>
                    </div>
                    <div className="flex gap-1">
                      {[15, 30, 60, 120].map(duration => (
                        <Button 
                          key={duration}
                          onClick={() => setTaskDuration(duration)}
                          variant={taskDuration === duration ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          {duration}m
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Current Task Info */}
                  {cell.task && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Current task:</strong> "{cell.task}"
                        {cell.avoided && <span className="ml-2 text-green-600">✓ Successfully avoided!</span>}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddCustomTask}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                        disabled={!newTaskText.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {cell.task ? 'Update Mission' : 'Create Mission'}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => toggleAvoidance(cell.id)}
                        variant={cell.avoided ? "destructive" : "secondary"}
                        className="flex-1"
                      >
                        {cell.avoided ? '↩️ Mark Undone' : '✅ Mark Avoided'}
                      </Button>
                      
                      {cell.task && (
                        <Button 
                          onClick={() => {
                            handleClearTask(cell.id);
                            setIsDialogOpen(false);
                          }}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Fun Footer */}
                  <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    💡 Pro tip: The longer you avoid it, the more points you earn! 🏆
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        
        <div className="flex justify-center gap-2 pt-2">
          <Button
            onClick={generateBingoCard}
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Card
          </Button>
          <Button
            onClick={handleClearAllTasks}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Tasks
          </Button>
        </div>
        
        <div className="text-center text-xs text-emerald-600">
          Click any box to customize task or mark as avoided • Complete a row, column, or diagonal for BINGO! 🎯
        </div>
      </CardContent>
    </Card>
  );
};
