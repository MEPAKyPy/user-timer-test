import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Coffee,
  UtensilsCrossed,
  Cigarette,
  BarChart3,
  Calendar,
  Users,
  ArrowLeft,
  Building2,
  Phone,
  Settings,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

type BreakType = {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
};

const breakTypes: BreakType[] = [
  {
    id: "lunch",
    name: "Обед",
    icon: <UtensilsCrossed className="w-4 h-4" />,
    color: "text-orange-600",
  },
  {
    id: "toilet",
    name: "Туалет",
    icon: <Clock className="w-4 h-4" />,
    color: "text-blue-600",
  },
  {
    id: "smoke",
    name: "Перекур",
    icon: <Cigarette className="w-4 h-4" />,
    color: "text-gray-600",
  },
  {
    id: "tea",
    name: "Чай",
    icon: <Coffee className="w-4 h-4" />,
    color: "text-green-600",
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

interface BreakSession {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  teamName: string;
  type: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}

export default function Analytics() {
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [allSessions, setAllSessions] = useState<BreakSession[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Flatten all employees for easy access
  const allEmployees = teams.flatMap((team) => team.employees);

  // Load teams from localStorage
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

  // Check admin authorization
  useEffect(() => {
    // Check if user is accessing analytics directly as admin
    const checkAdminAccess = () => {
      // Check app state for logged in admin
      const appState = localStorage.getItem("breakTimer_appState");
      if (appState) {
        try {
          const state = JSON.parse(appState);
          if (state.selectedEmployee === "vuqar") {
            setIsAuthorized(true);
            return;
          }
        } catch (error) {
          console.error("Authorization check failed:", error);
        }
      }

      // Also allow direct access if coming from admin panel or if Vuqar is in URL params
      const isFromAdmin =
        document.referrer.includes("/admin") ||
        window.location.search.includes("admin=true") ||
        sessionStorage.getItem("adminAccess") === "true";

      if (isFromAdmin) {
        setIsAuthorized(true);
        sessionStorage.setItem("adminAccess", "true");
      }
    };

    checkAdminAccess();
  }, []);

  // If not authorized, show access denied
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">
              Доступ запрещен
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Аналитика доступна только администратору системы.
            </p>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к главной
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadAllSessions();
  }, []);

  const loadAllSessions = () => {
    const sessions: BreakSession[] = [];

    // Load sessions for all employees and all dates
    allEmployees.forEach((employee) => {
      const team = teams.find((t) => t.id === employee.teamId);

      // Get last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();

        const storedSessions = localStorage.getItem(
          `breakSessions_${employee.id}_${dateString}`,
        );

        if (storedSessions) {
          const employeeSessions: any[] = JSON.parse(storedSessions);
          employeeSessions.forEach((session) => {
            sessions.push({
              ...session,
              employeeId: employee.id,
              employeeName: employee.name,
              teamId: employee.teamId,
              teamName: team?.name || "",
              startTime: new Date(session.startTime),
              endTime: session.endTime ? new Date(session.endTime) : new Date(),
            });
          });
        }
      }
    });

    setAllSessions(
      sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime()),
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getFilteredSessions = () => {
    return allSessions.filter((session) => {
      const sessionDate = session.startTime.toISOString().split("T")[0];
      const matchesDate = sessionDate === selectedDate;
      const matchesTeam =
        selectedTeam === "all" || session.teamId === selectedTeam;
      const matchesEmployee =
        selectedEmployee === "all" || session.employeeId === selectedEmployee;
      return matchesDate && matchesTeam && matchesEmployee;
    });
  };

  const getTeamStats = () => {
    const stats: Record<
      string,
      {
        totalTime: number;
        sessionCount: number;
        employees: Set<string>;
        sessions: BreakSession[];
      }
    > = {};

    const filtered = getFilteredSessions();

    filtered.forEach((session) => {
      if (!stats[session.teamId]) {
        stats[session.teamId] = {
          totalTime: 0,
          sessionCount: 0,
          employees: new Set(),
          sessions: [],
        };
      }
      stats[session.teamId].totalTime += session.duration;
      stats[session.teamId].sessionCount += 1;
      stats[session.teamId].employees.add(session.employeeId);
      stats[session.teamId].sessions.push(session);
    });

    return stats;
  };

  const getEmployeeStats = () => {
    const stats: Record<
      string,
      { totalTime: number; sessionCount: number; sessions: BreakSession[] }
    > = {};

    const filtered = getFilteredSessions();

    filtered.forEach((session) => {
      if (!stats[session.employeeId]) {
        stats[session.employeeId] = {
          totalTime: 0,
          sessionCount: 0,
          sessions: [],
        };
      }
      stats[session.employeeId].totalTime += session.duration;
      stats[session.employeeId].sessionCount += 1;
      stats[session.employeeId].sessions.push(session);
    });

    return stats;
  };

  const getAverageTime = () => {
    const filtered = getFilteredSessions();
    if (filtered.length === 0) return 0;

    const totalTime = filtered.reduce(
      (sum, session) => sum + session.duration,
      0,
    );
    return Math.round(totalTime / filtered.length);
  };

  const teamStats = getTeamStats();
  const employeeStats = getEmployeeStats();
  const averageTime = getAverageTime();

  // Get employees for selected team
  const availableEmployees =
    selectedTeam === "all"
      ? allEmployees
      : teams.find((t) => t.id === selectedTeam)?.employees || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к таймеру
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                Аналитика Перерывов
              </h1>
              <p className="text-muted-foreground">
                Отчеты по командам и сотрудникам
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-sm font-medium mb-2 block">Дата:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Команда:
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => {
                    setSelectedTeam(e.target.value);
                    setSelectedEmployee("all"); // Reset employee when team changes
                  }}
                  className="px-3 py-2 border border-input rounded-md"
                >
                  <option value="all">Все команды</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Сотрудник:
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md"
                >
                  <option value="all">Все сотрудники</option>
                  {availableEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {Object.keys(teamStats).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Активных команд
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {Object.keys(employeeStats).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Активных сотрудников
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {getFilteredSessions().length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Всего перерывов
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {formatTime(averageTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">Среднее время</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Reports */}
        {selectedEmployee === "all" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Отчеты по командам</h2>
            {Object.entries(teamStats).map(([teamId, stats]) => {
              const team = teams.find((t) => t.id === teamId);
              return (
                <Card key={teamId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={team?.color}>{team?.icon}</div>
                        <span className="text-xl">{team?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {stats.employees.size} сотрудников
                        </Badge>
                        <Badge variant="outline">
                          {stats.sessionCount} перерывов
                        </Badge>
                        <Badge variant="secondary">
                          {formatTime(stats.totalTime)} общее время
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Group sessions by employee */}
                      {Array.from(stats.employees).map((employeeId) => {
                        const employee = allEmployees.find(
                          (e) => e.id === employeeId,
                        );
                        const employeeSessions = stats.sessions.filter(
                          (s) => s.employeeId === employeeId,
                        );
                        const employeeTotal = employeeSessions.reduce(
                          (sum, s) => sum + s.duration,
                          0,
                        );

                        return (
                          <div
                            key={employeeId}
                            className="p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="font-semibold mb-2">
                              {employee?.name}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {employeeSessions.length} перерывов •{" "}
                              {formatTime(employeeTotal)}
                            </div>
                            <div className="space-y-1">
                              {employeeSessions.slice(0, 3).map((session) => {
                                const breakType = breakTypes.find(
                                  (t) => t.id === session.type,
                                );
                                return (
                                  <div
                                    key={session.id}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="flex items-center gap-1">
                                      <div className={breakType?.color}>
                                        {breakType?.icon}
                                      </div>
                                      {breakType?.name}
                                    </span>
                                    <span className="font-mono">
                                      {formatTime(session.duration)}
                                    </span>
                                  </div>
                                );
                              })}
                              {employeeSessions.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{employeeSessions.length - 3} еще...
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Employee Reports */}
        {selectedEmployee !== "all" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Детальный отчет сотрудника</h2>
            {Object.entries(employeeStats).map(([employeeId, stats]) => {
              const employee = allEmployees.find((e) => e.id === employeeId);
              const team = teams.find((t) => t.id === employee?.teamId);
              return (
                <Card key={employeeId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={team?.color}>{team?.icon}</div>
                        <div>
                          <span className="text-xl">{employee?.name}</span>
                          <p className="text-sm text-muted-foreground font-normal">
                            {team?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {stats.sessionCount} перерывов
                        </Badge>
                        <Badge variant="secondary">
                          {formatTime(stats.totalTime)} общее время
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.sessions.map((session) => {
                        const breakType = breakTypes.find(
                          (t) => t.id === session.type,
                        );
                        return (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`${breakType?.color || "text-gray-600"}`}
                              >
                                {breakType?.icon || (
                                  <Clock className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {breakType?.name || "Неизвестно"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {session.startTime.toLocaleTimeString(
                                    "ru-RU",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}{" "}
                                  -{" "}
                                  {session.endTime.toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-medium">
                                {formatTime(session.duration)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {stats.sessions.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Нет перерывов за выбранную дату
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {Object.keys(teamStats).length === 0 &&
          Object.keys(employeeStats).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Нет данных за выбранную дату и фильтры
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
