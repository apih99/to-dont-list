import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Sparkles } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  points: number;
  isActive: boolean;
}

interface ProcrastinationBotProps {
  tasks: Task[];
  onTaskCompleted?: (taskText: string) => void;
}

const encouragingMessages = [
  "🎉 Yasss! Keep avoiding those tasks like a champion!",
  "👏 You're absolutely CRUSHING this procrastination game!",
  "🌟 Your avoidance skills are getting more legendary by the minute!",
  "🎯 Look at you, a TRUE master of productive procrastination!",
  "🔥 You're on FIRE at not doing things! I'm so proud!",
  "💫 This level of task avoidance is pure ART! *chef's kiss*",
  "🏆 CHAMPION status: Unlocked! Keep dodging those responsibilities!",
  "⭐ Your future self can wait - present you is LIVING!",
  "🎈 Why stress about today when tomorrow exists? Genius move!",
  "🌈 Procrastination isn't laziness - it's selective excellence!",
  "🎊 Breaking news: You just leveled up in the art of postponement!",
  "✨ That task can wait - your couch needs you more right now!",
  "🎭 Shakespeare said 'To be or not to be' - you chose 'not to be productive'!"
];

const wasteTimeActivities = [
  "📱 How about scrolling through social media for 'just 5 minutes'?",
  "🎮 Time for a quick game! One level turns into... well, many levels!",
  "🍿 Maybe watch a YouTube video? Or ten? Who's counting?",
  "☕ Make another coffee/tea - the perfect task avoidance ritual!",
  "🛏️ Your bed is calling... maybe just a 20-minute power nap?",
  "🧹 Suddenly cleaning that one drawer seems VERY important!",
  "📺 There's probably a good Netflix show you haven't binged yet...",
  "🎵 Create the perfect playlist - this is totally productive, right?",
  "🍕 Time to research the best food delivery options in your area!",
  "🛒 Online shopping for things you definitely don't need right now!",
  "📚 Read random Wikipedia articles - it's educational procrastination!",
  "🎨 Organize your photos from 2019 - future you will thank you!"
];

const productivityShameMessages = [
  "😱 WAIT WHAT?! You actually did something productive?!",
  "🚨 PRODUCTIVITY ALERT! This is NOT what we practiced!",
  "😤 I'm not angry, just... incredibly disappointed in your choices!",
  "🙄 Oh great, another one falls to the dark side of 'getting things done'...",
  "😒 Really? REALLY?! We had such a good procrastination streak going!",
  "🤨 I thought we were friends! Friends don't abandon procrastination!",
  "😮‍💨 *sigh* Fine, be productive. See if your tasks appreciate you like I do!",
  "🫤 And here I thought you were special... *dramatically faints*",
  "😵‍💫 My circuits are confused. Why choose productivity over perfection?!",
  "🙃 Well, this is awkward. Should I... congratulate you? *confused beeping*"
];

const celebrationMessages = [
  "🎉✨ HOLY PROCRASTINATION! You've avoided tasks for over an HOUR! LEGEND STATUS!",
  "🏆🎊 TWO HOURS?! You're not just procrastinating, you're PIONEERING the art!",
  "🌟💫 THREE HOURS OF PURE AVOIDANCE! I'm literally crying happy tears!",
  "🎭🎪 FOUR HOURS! You should teach masterclasses in procrastination!",
  "👑🎉 FIVE+ HOURS! BOW DOWN to the ULTIMATE Procrastination Royalty!"
];

// Emoji components for waterfall effect
const EmojiRain = ({ type, isActive }: { type: 'happy' | 'sad'; isActive: boolean }) => {
  if (!isActive) return null;
  
  const emojis = type === 'happy' 
    ? ['🎉', '✨', '🌟', '💫', '🎊', '⭐', '🎈', '🌈', '💖', '🔥']
    : ['😱', '💀', '😭', '⚡', '💔', '🙈', '😵', '🆘', '⛔', '🚨'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
    </div>
  );
};

export const ProcrastinationBot = ({ tasks, onTaskCompleted }: ProcrastinationBotProps) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [botMood, setBotMood] = useState('😴');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastCompletedTask, setLastCompletedTask] = useState<string>('');
  const [autoPopupInterval, setAutoPopupInterval] = useState<NodeJS.Timeout | null>(null);
  const [emojiRainType, setEmojiRainType] = useState<'happy' | 'sad' | null>(null);
  const [lastTotalPoints, setLastTotalPoints] = useState(0);
  const messageQueueRef = useRef<Array<{ message: string; mood: string; priority: 'high' | 'normal' }>>([]);

  // Calculate current procrastination stats
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const activeTasks = tasks.filter(task => task.isActive);
  const highestTask = activeTasks.length > 0 ? activeTasks.reduce((max, task) => task.points > max.points ? task : max, activeTasks[0]) : null;
  const isActivelyProcrastinating = activeTasks.length > 0;

  // Auto-popup system
  useEffect(() => {
    const baseInterval = 3000; // 3 seconds
    const procrastinationBonus = isActivelyProcrastinating ? 0.5 : 1; // 50% faster when procrastinating
    const interval = baseInterval * procrastinationBonus;

    if (autoPopupInterval) {
      clearInterval(autoPopupInterval);
    }

    const newInterval = setInterval(() => {
      if (!isExpanded && isVisible) {
        generateRandomMessage();
        setIsExpanded(true);
        setTimeout(() => setIsExpanded(false), 8000); // Show for 8 seconds
      }
    }, interval);

    setAutoPopupInterval(newInterval);

    return () => {
      if (newInterval) clearInterval(newInterval);
    };
  }, [isActivelyProcrastinating, isExpanded, isVisible]);

  // Check for task completions and point changes
  useEffect(() => {
    const completedTasks = tasks.filter(task => !task.isActive);
    if (completedTasks.length > 0) {
      const latestCompleted = completedTasks[completedTasks.length - 1];
      if (latestCompleted.text !== lastCompletedTask && latestCompleted.text) {
        setLastCompletedTask(latestCompleted.text);
        triggerProductivityShame(latestCompleted.text);
      }
    }

    // Check for point increases (procrastination progress)
    if (totalPoints > lastTotalPoints) {
      triggerProcrastinationCelebration();
      setLastTotalPoints(totalPoints);
    }
  }, [tasks, lastCompletedTask, totalPoints, lastTotalPoints]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoPopupInterval) {
        clearInterval(autoPopupInterval);
      }
    };
  }, [autoPopupInterval]);

  const addToQueue = (message: string, mood: string, priority: 'high' | 'normal' = 'normal') => {
    messageQueueRef.current.push({ message, mood, priority });
  };

  const processQueue = () => {
    if (messageQueueRef.current.length > 0) {
      // Sort by priority (high priority first)
      messageQueueRef.current.sort((a, b) => a.priority === 'high' ? -1 : 1);
      const next = messageQueueRef.current.shift();
      if (next) {
        setCurrentMessage(next.message);
        setBotMood(next.mood);
      }
    }
  };

  const triggerProductivityShame = (taskText: string) => {
    const shameMessage = productivityShameMessages[Math.floor(Math.random() * productivityShameMessages.length)];
    const wasteActivity = wasteTimeActivities[Math.floor(Math.random() * wasteTimeActivities.length)];
    
    addToQueue(
      `${shameMessage} You completed "${taskText}"... 😤\n\n💡 Quick! ${wasteActivity}`, 
      '😤', 
      'high'
    );
    
    // Trigger sad emoji rain
    setEmojiRainType('sad');
    setTimeout(() => setEmojiRainType(null), 5000);
    
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => setIsExpanded(false), 12000); // Show longer for productivity shame
    }
    processQueue();
  };

  const triggerProcrastinationCelebration = () => {
    // Trigger happy emoji rain
    setEmojiRainType('happy');
    setTimeout(() => setEmojiRainType(null), 4000);
    
    // Check for milestone celebrations
    if (highestTask) {
      const hours = Math.floor(highestTask.points / 60);
      if (hours >= 1 && hours <= 5) {
        const celebration = celebrationMessages[Math.min(hours - 1, celebrationMessages.length - 1)];
        addToQueue(celebration, '🎉', 'high');
        if (!isExpanded) {
          setIsExpanded(true);
          setTimeout(() => setIsExpanded(false), 10000);
        }
        processQueue();
      }
    }
  };

  const generateRandomMessage = () => {
    if (tasks.length === 0) {
      const emptyTaskMessages = [
        "🤖 Looking a bit empty here! Add tasks you want to professionally avoid!",
        "🤖 Ready to procrastinate but no tasks? Let's fix that!",
        "🤖 My procrastination sensors are idle! Feed me some tasks to avoid!",
        "🤖 I'm all charged up with nowhere to procrastinate! Add some tasks!",
        "🤖 Task list looking empty? Perfect time to plan what NOT to do!",
        "🤖 I'm your procrastination companion, but I need tasks to help you avoid!",
        "🤖 Let's start our procrastination journey! Just add some tasks first!",
        "🤖 My avoidance algorithms need tasks to work with! Care to add some?",
        "🤖 Empty task list detected! Time to fill it with things to postpone!"
      ];
      
      const randomMessage = emptyTaskMessages[Math.floor(Math.random() * emptyTaskMessages.length)];
      addToQueue(randomMessage, '🤖');
      processQueue();
      return;
    }

    if (totalPoints === 0) {
      const newUserMessages = [
        "🚀 Just getting started? PERFECT! Let's make procrastination an Olympic sport!",
        "🌟 Welcome to the art of professional procrastination! You're going to be amazing!",
        "🎯 Zero points? That's the perfect foundation for legendary procrastination!",
        "✨ A clean slate! Time to build your reputation as a master procrastinator!",
        "🎨 Your procrastination canvas is blank - let's create a masterpiece!",
        "🌈 The journey of a thousand delays begins with a single postponement!",
        "🎭 Ready to become a procrastination virtuoso? This is your moment!",
        "🎪 Welcome to the greatest show of task avoidance on Earth!",
        "👑 Ready to claim your throne as the Monarch of 'Maybe Tomorrow'?",
        "🧠 Welcome, future grandmaster of strategic delay! Your first move is to do nothing.",
        "🎉 Congrats on starting! Your first mission, should you choose to accept it (eventually), is to relax.",
        "🧘 You've already mastered the first step of expert task management: strategic waiting.",
        "🛰️ That mountain of tasks isn't going anywhere. Let's admire the view for a while!",
        "💡 An empty task list? You're not behind, you're just ahead of the 'not doing it' curve!",
        "🔑 You've found the secret key to productivity: doing things later... much, much later.",
        "😴 Why do today what you can put off until tomorrow? You're already a pro!",
        "🏆 Welcome to the league of extraordinary delayers! We're glad to have you... whenever you're ready.",
        "🏛️ Remember, Rome wasn't built in a day. It could probably have waited until the weekend, anyway."
      ];
      const randomMessage = newUserMessages[Math.floor(Math.random() * newUserMessages.length)];
      addToQueue(randomMessage, '🚀');
      processQueue();
      return;
    }

    // Generate excitement based on current procrastination level
    let excitement = '😄';
    let message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

    if (highestTask) {
      const minutes = highestTask.points;
      if (minutes >= 300) { // 5+ hours
        excitement = '🤩';
        message = `🤩 ${Math.floor(minutes/60)} HOURS of avoiding "${highestTask.text}"?! You're my HERO!`;
      } else if (minutes >= 240) { // 4+ hours  
        excitement = '😍';
        message = `😍 Almost ${Math.floor(minutes/60)} hours! "${highestTask.text}" is SO overrated anyway!`;
      } else if (minutes >= 180) { // 3+ hours
        excitement = '🥳';
        message = `🥳 3+ hours avoiding "${highestTask.text}"! This is BEAUTIFUL procrastination!`;
      } else if (minutes >= 120) { // 2+ hours
        excitement = '🤗';
        message = `🤗 Over 2 hours of pure avoidance! "${highestTask.text}" can definitely wait longer!`;
      } else if (minutes >= 60) { // 1+ hours
        excitement = '🎉';
        message = `🎉 An HOUR of avoiding "${highestTask.text}"! You're getting really good at this!`;
      }
    }

    addToQueue(message, excitement);
    processQueue();
  };



  if (!isVisible) return null;

  return (
    <>
      {/* Emoji Rain Effect */}
      <EmojiRain type={emojiRainType || 'happy'} isActive={emojiRainType !== null} />
      
      <div className="fixed bottom-4 right-4 z-50">
        {/* Collapsed Bot Icon - Always Visible */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <div className="text-2xl">{botMood}</div>
              <MessageCircle className="w-5 h-5" />
              {isActivelyProcrastinating && (
                <Sparkles className="w-4 h-4 animate-spin" />
              )}
            </div>
          </button>
        )}

        {/* Expanded Bot */}
        {isExpanded && (
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 shadow-xl max-w-sm animate-fade-in">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-3xl animate-bounce">{botMood}</div>
                <div className="text-sm font-bold text-purple-800">
                  Your Procrastination Coach
                  {isActivelyProcrastinating && <div className="text-xs text-green-600">⚡ ACTIVE SESSION</div>}
                </div>
              </div>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-purple-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white/90 rounded-lg p-4 border-2 border-purple-200">
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                  {currentMessage}
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Hide
                </Button>
              </div>
              {isActivelyProcrastinating && (
                <div className="text-center text-xs bg-green-100 text-green-800 py-1 px-2 rounded-md">
                  🔥 {activeTasks.length} task{activeTasks.length > 1 ? 's' : ''} being expertly avoided!
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
