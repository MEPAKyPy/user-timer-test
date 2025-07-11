import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Phone,
  Settings,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Download,
  Users,
  Shield,
  Key,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

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
  customPin?: string;
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

export default function Admin() {
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditPin, setShowEditPin] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeTeam, setNewEmployeeTeam] = useState("");
  const [newPin, setNewPin] = useState("");

  // Load custom teams and employees from localStorage
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

  // Save teams to localStorage
  const saveTeams = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    localStorage.setItem("admin_teams", JSON.stringify(updatedTeams));
  };

  const generateEmployeePIN = (employeeName: string): string => {
    return employeeName.toLowerCase() + "123";
  };

  const addEmployee = () => {
    if (!newEmployeeName.trim() || !newEmployeeTeam) return;

    const employeeId = Date.now().toString();
    const newEmployee: Employee = {
      id: employeeId,
      name: newEmployeeName.trim(),
      teamId: newEmployeeTeam,
    };

    const updatedTeams = teams.map((team) => {
      if (team.id === newEmployeeTeam) {
        return {
          ...team,
          employees: [...team.employees, newEmployee],
        };
      }
      return team;
    });

    saveTeams(updatedTeams);
    setNewEmployeeName("");
    setNewEmployeeTeam("");
    setShowAddEmployee(false);
  };

  const deleteEmployee = (employeeId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого сотрудника?")) return;

    const updatedTeams = teams.map((team) => ({
      ...team,
      employees: team.employees.filter((emp) => emp.id !== employeeId),
    }));

    saveTeams(updatedTeams);

    // Also remove employee's break sessions
    const allEmployees = teams.flatMap((team) => team.employees);
    allEmployees.forEach(() => {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        localStorage.removeItem(`breakSessions_${employeeId}_${dateString}`);
      }
    });
  };

  const updateEmployeePin = () => {
    if (!editingEmployee || !newPin.trim()) return;

    const updatedTeams = teams.map((team) => ({
      ...team,
      employees: team.employees.map((emp) =>
        emp.id === editingEmployee.id
          ? { ...emp, customPin: newPin.trim().toLowerCase() }
          : emp,
      ),
    }));

    saveTeams(updatedTeams);
    setEditingEmployee(null);
    setNewPin("");
    setShowEditPin(false);
  };

  const exportToExcel = () => {
    const allSessions: BreakSession[] = [];
    const allEmployees = teams.flatMap((team) => team.employees);

    // Collect all sessions from the last 30 days
    allEmployees.forEach((employee) => {
      const team = teams.find((t) => t.id === employee.teamId);
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
            allSessions.push({
              ...session,
              employeeId: employee.id,
              employeeName: employee.name,
              teamId: employee.teamId,
              teamName: team?.name || "",
              startTime: new Date(session.startTime),
              endTime: new Date(session.endTime),
            });
          });
        }
      }
    });

    // Create CSV content
    const headers = [
      "Дата",
      "Команда",
      "Сотрудник",
      "Тип перерыва",
      "Время начала",
      "Время окончания",
      "Длительность (мин)",
    ];

    const csvContent = [
      headers.join(","),
      ...allSessions
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .map((session) => [
          session.startTime.toLocaleDateString("ru-RU"),
          session.teamName,
          session.employeeName,
          getBreakTypeName(session.type),
          session.startTime.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          session.endTime.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          Math.round(session.duration / 60),
        ]),
    ].join("\n");

    // Download CSV file
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `break_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBreakTypeName = (type: string): string => {
    const types: Record<string, string> = {
      lunch: "Обед",
      toilet: "Туалет",
      smoke: "Перекур",
      tea: "Чай",
    };
    return types[type] || type;
  };

  const getEmployeePin = (employee: Employee): string => {
    return employee.customPin || generateEmployeePIN(employee.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
                <Shield className="w-8 h-8 text-red-600" />
                Панель Администратора
              </h1>
              <p className="text-muted-foreground">
                Управление сотрудниками и отчетами
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/analytics"
              onClick={() => sessionStorage.setItem("adminAccess", "true")}
            >
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Аналитика
              </Button>
            </Link>
            <Button onClick={exportToExcel} variant="default">
              <Download className="w-4 h-4 mr-2" />
              Экспорт Excel
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowAddEmployee(true)}
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teams Management */}
        <div className="space-y-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={team.color}>{team.icon}</div>
                  <span>{team.name}</span>
                  <Badge variant="outline">{team.employees.length} чел.</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {team.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="p-4 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEmployee(employee);
                              setNewPin(getEmployeePin(employee));
                              setShowEditPin(true);
                            }}
                          >
                            <Key className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>ID: {employee.id}</p>
                        <p>PIN: {getEmployeePin(employee)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Добавить сотрудника</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Имя сотрудника:
                    </label>
                    <input
                      type="text"
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      placeholder="Введите имя"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Команда:
                    </label>
                    <select
                      value={newEmployeeTeam}
                      onChange={(e) => setNewEmployeeTeam(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">Выберите команду</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {newEmployeeName && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        PIN будет:{" "}
                        <code className="font-mono">
                          {generateEmployeePIN(newEmployeeName)}
                        </code>
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowAddEmployee(false);
                        setNewEmployeeName("");
                        setNewEmployeeTeam("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={addEmployee}
                      variant="default"
                      className="flex-1"
                      disabled={!newEmployeeName.trim() || !newEmployeeTeam}
                    >
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit PIN Modal */}
        {showEditPin && editingEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Изменить PIN</CardTitle>
                <p className="text-muted-foreground">
                  Сотрудник: {editingEmployee.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Новый PIN:
                    </label>
                    <input
                      type="text"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Введите новый PIN"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      По умолчанию: {generateEmployeePIN(editingEmployee.name)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowEditPin(false);
                        setEditingEmployee(null);
                        setNewPin("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={updateEmployeePin}
                      variant="default"
                      className="flex-1"
                      disabled={!newPin.trim()}
                    >
                      Сохранить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
