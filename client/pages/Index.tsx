import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Coffee,
  UtensilsCrossed,
  Cigarette,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Timer,
  BarChart3,
  User,
  Users,
  Building2,
  Phone,
  Settings,
  Lock,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

type BreakType = {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  bgColor: string;
};

const breakTypes: BreakType[] = [
  {
    id: "lunch",
    name: "Обед",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    color: "text-orange-600",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
  },
  {
    id: "toilet",
    name: "Туалет",
    icon: <Clock className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    id: "smoke",
    name: "Перекур",
    icon: <Cigarette className="w-5 h-5" />,
    color: "text-gray-600",
    bgColor: "bg-gradient-to-r from-gray-500 to-slate-600",
  },
  {
    id: "tea",
    name: "Чай",
    icon: <Coffee className="w-5 h-5" />,
    color: "text-green-600",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
  },
];

type Team = {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  employees: Employee[];
};

type Employee = {
  id: string;
  name: string;
  teamId: string;
};

const defaultTeams: Team[] = [
  {
    id: "technical-support",
    name: "Technical Support",
    icon: <Settings className="w-5 h-5" />,
    color: "text-blue-600",
    employees: [
      { id: "vuqar", name: "Vuqar", teamId: "technical-support" },
      { id: "sanan", name: "Sanan", teamId: "technical-support" },
      { id: "teymur", name: "Teymur", teamId: "technical-support" },
      { id: "murad", name: "Murad", teamId: "technical-support" },
      { id: "anvar", name: "Anvar", teamId: "technical-support" },
    ],
  },
  {
    id: "operation-support",
    name: "Operation Support",
    icon: <Building2 className="w-5 h-5" />,
    color: "text-green-600",
    employees: [
      { id: "kamran", name: "Kamran", teamId: "operation-support" },
      { id: "kamran2", name: "Kamran2", teamId: "operation-support" },
      { id: "islam", name: "Islam", teamId: "operation-support" },
      { id: "ugur", name: "Ugur", teamId: "operation-support" },
      { id: "najmeddin", name: "Najmeddin", teamId: "operation-support" },
    ],
  },
  {
    id: "call-centre",
    name: "Call Centre",
    icon: <Phone className="w-5 h-5" />,
    color: "text-purple-600",
    employees: [
      { id: "cc1", name: "Мария", teamId: "call-centre" },
      { id: "cc2", name: "Игорь", teamId: "call-centre" },
      { id: "cc3", name: "Ольга", teamId: "call-centre" },
      { id: "cc4", name: "Павел", teamId: "call-centre" },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-orange-600",
    employees: [
      { id: "seidaga", name: "Seidaga", teamId: "finance" },
      { id: "khazratali", name: "Khazratali", teamId: "finance" },
      { id: "ismail", name: "Ismail", teamId: "finance" },
      { id: "agahalil", name: "Agahalil", teamId: "finance" },
      { id: "ismail2", name: "Ismail2", teamId: "finance" },
    ],
  },
];

type TimerState = "idle" | "running" | "paused";

interface BreakSession {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  teamName: string;
  type: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

interface AppState {
  selectedTeam: string;
  selectedEmployee: string;
  timerState: TimerState;
  selectedBreakType: string;
  currentTime: number;
  currentSessionId: string | null;
}

export default function Index() {
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [pendingEmployee, setPendingEmployee] = useState<string>("");
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [selectedBreakType, setSelectedBreakType] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);
  const [todayUsedTime, setTodayUsedTime] = useState(0);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const MAX_DAILY_TIME = 90 * 60;
  const remainingTime = MAX_DAILY_TIME - todayUsedTime;

  // Flatten all employees for easy access
  const allEmployees = teams.flatMap((team) => team.employees);

  // Check if current user is admin (Vuqar)
  const isAdmin = selectedEmployee === "vuqar";

  // Load teams from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("admin_teams");
    if (saved) {
      try {
        setTeams(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading teams:", error);
      }
    }
  }, []);

  // Generate PIN for employee (name + 123)
  const generateEmployeePIN = (employeeName: string): string => {
    return employeeName.toLowerCase() + "123";
  };

  // Get employee PIN (custom or default)
  const getEmployeePIN = (employee: any): string => {
    return employee.customPin || generateEmployeePIN(employee.name);
  };

  // Verify PIN for employee
  const verifyEmployeePIN = (employeeId: string, inputPin: string): boolean => {
    const employee = allEmployees.find((e) => e.id === employeeId);
    if (!employee) return false;

    const correctPin = getEmployeePIN(employee);
    return inputPin.toLowerCase() === correctPin;
  };

  // Save app state to localStorage
  const saveAppState = () => {
    const state: AppState = {
      selectedTeam,
      selectedEmployee,
      timerState,
      selectedBreakType,
      currentTime,
      currentSessionId,
    };
    localStorage.setItem("breakTimer_appState", JSON.stringify(state));
  };

  // Load app state from localStorage
  const loadAppState = () => {
    const saved = localStorage.getItem("breakTimer_appState");
    if (saved) {
      try {
        const state: AppState = JSON.parse(saved);
        setSelectedTeam(state.selectedTeam || "");
        setSelectedEmployee(state.selectedEmployee || "");
        setTimerState(state.timerState || "idle");
        setSelectedBreakType(state.selectedBreakType || "");
        setCurrentTime(state.currentTime || 0);
        setCurrentSessionId(state.currentSessionId || null);

        // If there was a running timer, set up the start time reference
        if (state.timerState === "running" && state.currentTime > 0) {
          startTimeRef.current = new Date(
            Date.now() - state.currentTime * 1000,
          );
        }
      } catch (error) {
        console.error("Error loading app state:", error);
      }
    }
  };

  // Save state on every relevant change
  useEffect(() => {
    saveAppState();
  }, [
    selectedTeam,
    selectedEmployee,
    timerState,
    selectedBreakType,
    currentTime,
    currentSessionId,
  ]);

  // Load state on app start
  useEffect(() => {
    loadAppState();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeData();
    }
  }, [selectedEmployee]);

  const loadEmployeeData = () => {
    if (!selectedEmployee) return;

    const today = new Date().toDateString();
    const storedSessions = localStorage.getItem(
      `breakSessions_${selectedEmployee}_${today}`,
    );

    if (storedSessions) {
      const sessions: BreakSession[] = JSON.parse(storedSessions).map(
        (session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        }),
      );
      setBreakSessions(sessions);
      const totalUsed = sessions.reduce(
        (sum, session) => sum + session.duration,
        0,
      );
      setTodayUsedTime(totalUsed);
    } else {
      setBreakSessions([]);
      setTodayUsedTime(0);
    }
  };

  useEffect(() => {
    if (selectedEmployee && breakSessions.length >= 0) {
      const today = new Date().toDateString();
      localStorage.setItem(
        `breakSessions_${selectedEmployee}_${today}`,
        JSON.stringify(breakSessions),
      );
    }
  }, [breakSessions, selectedEmployee]);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (!selectedBreakType || !selectedEmployee) return;

    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    startTimeRef.current = new Date();
    setCurrentTime(0);
    setTimerState("running");
  };

  const pauseTimer = () => {
    setTimerState("paused");
  };

  const resumeTimer = () => {
    setTimerState("running");
  };

  const stopTimer = () => {
    if (currentSessionId && startTimeRef.current && selectedEmployee) {
      const employee = allEmployees.find((e) => e.id === selectedEmployee);
      const team = teams.find((t) => t.id === employee?.teamId);

      const newSession: BreakSession = {
        id: currentSessionId,
        employeeId: selectedEmployee,
        employeeName: employee?.name || "",
        teamId: employee?.teamId || "",
        teamName: team?.name || "",
        type: selectedBreakType,
        startTime: startTimeRef.current,
        endTime: new Date(),
        duration: currentTime,
      };

      setBreakSessions((prev) => [...prev, newSession]);
      setTodayUsedTime((prev) => prev + currentTime);
    }

    setTimerState("idle");
    setCurrentTime(0);
    setCurrentSessionId(null);
    startTimeRef.current = null;
  };

  const getSelectedBreakType = () => {
    return breakTypes.find((type) => type.id === selectedBreakType);
  };

  const isTimeExceeded = todayUsedTime + currentTime > MAX_DAILY_TIME;
  const progressPercentage = Math.min(
    100,
    (todayUsedTime / MAX_DAILY_TIME) * 100,
  );

  const handleEmployeeSelection = (employeeId: string) => {
    setPendingEmployee(employeeId);
    setShowPinEntry(true);
    setPinInput("");
    setPinError("");
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (verifyEmployeePIN(pendingEmployee, pinInput)) {
      setSelectedEmployee(pendingEmployee);

      // Set admin access if Vuqar logs in
      if (pendingEmployee === "vuqar") {
        sessionStorage.setItem("adminAccess", "true");
      }

      setShowPinEntry(false);
      setPendingEmployee("");
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Неверный код доступа");
      setPinInput("");
    }
  };

  const cancelPinEntry = () => {
    setShowPinEntry(false);
    setPendingEmployee("");
    setPinInput("");
    setPinError("");
  };

  const resetSelection = () => {
    // Stop any running timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSelectedTeam("");
    setSelectedEmployee("");
    setPendingEmployee("");
    setShowPinEntry(false);
    setPinInput("");
    setPinError("");
    setTimerState("idle");
    setSelectedBreakType("");
    setCurrentTime(0);
    setTodayUsedTime(0);
    setBreakSessions([]);
    setCurrentSessionId(null);

    // Clear saved state
    localStorage.removeItem("breakTimer_appState");
  };

  // If no team selected, show team selection
  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Система Перерывов</CardTitle>
            <p className="text-muted-foreground text-lg">
              Выберите команду для начала работы
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {teams.map((team) => (
                <Button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:shadow-lg transition-all"
                >
                  <div className={`${team.color}`}>{team.icon}</div>
                  <span className="font-semibold">{team.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {team.employees.length} сотрудников
                  </span>
                </Button>
              ))}
            </div>
            <div className="pt-4 border-t">
              <p className="text-center text-muted-foreground text-sm">
                Аналитика доступна только администратору
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If team selected but no employee, show employee selection
  if (!selectedEmployee) {
    const currentTeam = teams.find((t) => t.id === selectedTeam);
    const pendingEmployeeData = allEmployees.find(
      (e) => e.id === pendingEmployee,
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className={`w-12 h-12 ${currentTeam?.color?.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center`}
              >
                <div className={currentTeam?.color}>{currentTeam?.icon}</div>
              </div>
              <div>
                <CardTitle className="text-2xl">{currentTeam?.name}</CardTitle>
                <p className="text-muted-foreground">
                  Выберите сотрудника для начала работы
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2">
              {currentTeam?.employees.map((employee) => (
                <Button
                  key={employee.id}
                  onClick={() => handleEmployeeSelection(employee.id)}
                  variant="outline"
                  className="h-16 text-lg justify-between hover:shadow-lg transition-all"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    {employee.name}
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setSelectedTeam("")}
                variant="outline"
                className="flex-1"
              >
                Назад к командам
              </Button>
              <Button variant="secondary" className="flex-1" disabled>
                <BarChart3 className="w-4 h-4 mr-2" />
                Только для админа
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PIN Entry Modal */}
        {showPinEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Введите код доступа</CardTitle>
                <p className="text-muted-foreground">
                  Для сотрудника:{" "}
                  <span className="font-medium">
                    {pendingEmployeeData?.name}
                  </span>
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Введите ваш код"
                      className="w-full px-4 py-3 border border-input rounded-md text-center text-lg tracking-wider"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Код: имя сотрудника + 123
                    </p>
                    {pinError && (
                      <p className="text-red-600 text-sm mt-2 text-center">
                        {pinError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={cancelPinEntry}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      className="flex-1"
                      disabled={!pinInput.trim()}
                    >
                      Войти
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  const currentEmployee = allEmployees.find((e) => e.id === selectedEmployee);
  const currentTeam = teams.find((t) => t.id === currentEmployee?.teamId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Таймер Перерывов
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className={currentTeam?.color}>{currentTeam?.icon}</div>
                  {currentTeam?.name}
                </span>
                <span className="font-medium">{currentEmployee?.name}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Link
                  to="/analytics"
                  onClick={() => sessionStorage.setItem("adminAccess", "true")}
                >
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Аналити��а
                  </Button>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => sessionStorage.setItem("adminAccess", "true")}
                >
                  <Button variant="default" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Админ панель
                  </Button>
                </Link>
              </>
            )}
            <Button onClick={resetSelection} variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Выбрать заново
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Statistics Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Daily Progress Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Ежедневная статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Использовано:
                    </span>
                    <Badge
                      variant={
                        todayUsedTime > MAX_DAILY_TIME * 0.8
                          ? "destructive"
                          : "secondary"
                      }
                      className="font-mono"
                    >
                      {formatTime(todayUsedTime)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Осталось:
                    </span>
                    <Badge
                      variant={remainingTime <= 0 ? "destructive" : "default"}
                      className="font-mono"
                    >
                      {formatTime(Math.max(0, remainingTime))}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        todayUsedTime > MAX_DAILY_TIME
                          ? "bg-red-500"
                          : todayUsedTime > MAX_DAILY_TIME * 0.8
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            {breakSessions.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    Сегодняшние перерывы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {breakSessions
                      .slice(-4)
                      .reverse()
                      .map((session) => {
                        const breakType = breakTypes.find(
                          (type) => type.id === session.type,
                        );
                        return (
                          <div
                            key={session.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg ${breakType?.bgColor || "bg-gray-400"} flex items-center justify-center`}
                            >
                              <div className="text-white text-sm">
                                {breakType?.icon || (
                                  <Clock className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {breakType?.name || "Неизвестно"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.startTime.toLocaleTimeString("ru-RU", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {session.endTime && (
                                  <span>
                                    {" "}
                                    -{" "}
                                    {session.endTime.toLocaleTimeString(
                                      "ru-RU",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm font-medium">
                                {formatTime(session.duration)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Timer Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                  {timerState === "idle"
                    ? "Готов к работе"
                    : timerState === "running"
                      ? "Перерыв в процессе"
                      : "Перерыв приостановлен"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Timer Display */}
                <div className="text-center">
                  <div
                    className={`text-6xl lg:text-7xl font-mono font-bold transition-all duration-300 ${
                      isTimeExceeded
                        ? "text-red-600"
                        : timerState === "running"
                          ? "text-green-600"
                          : timerState === "paused"
                            ? "text-yellow-600"
                            : "text-gray-400"
                    }`}
                  >
                    {formatTime(currentTime)}
                  </div>

                  {getSelectedBreakType() && timerState !== "idle" && (
                    <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-muted rounded-full">
                      <div
                        className={`w-8 h-8 rounded-lg ${getSelectedBreakType()?.bgColor} flex items-center justify-center`}
                      >
                        <div className="text-white">
                          {getSelectedBreakType()?.icon}
                        </div>
                      </div>
                      <span className="text-lg font-semibold">
                        {getSelectedBreakType()?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Break Type Selection */}
                {timerState === "idle" && (
                  <div className="space-y-4">
                    <label className="block text-center text-lg font-semibold">
                      Выберите тип перерыва
                    </label>

                    {/* Break Type Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {breakTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedBreakType(type.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                            selectedBreakType === type.id
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center shadow-sm mx-auto mb-3`}
                          >
                            <div className="text-white">{type.icon}</div>
                          </div>
                          <p className="font-medium text-center">{type.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-4">
                  {timerState === "idle" && (
                    <Button
                      onClick={startTimer}
                      disabled={!selectedBreakType || remainingTime <= 0}
                      variant="timer-active"
                      size="lg"
                      className="flex-1 h-14 text-lg font-semibold"
                    >
                      <PlayCircle className="w-6 h-6 mr-2" />
                      Начать перерыв
                    </Button>
                  )}

                  {(timerState === "running" || timerState === "paused") && (
                    <Button
                      onClick={stopTimer}
                      variant="destructive"
                      size="lg"
                      className="flex-1 h-14 text-lg font-semibold"
                    >
                      <StopCircle className="w-6 h-6 mr-2" />
                      Завершить перерыв
                    </Button>
                  )}
                </div>

                {/* Warning Messages */}
                {remainingTime <= 0 && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-700 font-medium text-center">
                      ⚠️ Вы исчерпал�� дневной лимит времени на перерывы
                    </p>
                  </div>
                )}

                {isTimeExceeded && timerState !== "idle" && (
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-orange-700 font-medium text-center">
                      ⏰ Текущий перерыв превышает оставшееся время
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
