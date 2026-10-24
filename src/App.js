import React, { useState, useEffect } from 'react';

const UNIDADES = ['Unidade Central', 'Jardim Lindóia', 'Moinhos de Vento', 'Atendimento Domiciliar'];
const PACK_OPTIONS = [
  { label: '4 Aulas (1x/semana)', value: 4, price: 400 },
  { label: '8 Aulas (2x/semana)', value: 8, price: 700 },
  { label: '12 Aulas (3x/semana)', value: 12, price: 950 },
  { label: '20 Aulas (5x/semana)', value: 20, price: 1400 },
];

const INITIAL_STUDENTS = [
  { id: '1', name: 'Carlos Silva', whatsapp: '51999999999', email: 'carlos@email.com', birthDate: '1990-05-12', unit: 'Jardim Lindóia', packTotal: 8, classesDone: 5, vouchers: 1, paymentPending: false },
  { id: '2', name: 'Mariana Souza', whatsapp: '51988888888', email: 'mariana@email.com', birthDate: '1985-08-20', unit: 'Unidade Central', packTotal: 12, classesDone: 10, vouchers: 0, paymentPending: true },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('Todas');
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', whatsapp: '', email: '', birthDate: '', unit: UNIDADES[0], packTotal: 4 });
  const [newSchedule, setNewSchedule] = useState({ studentId: '', date: new Date().toISOString().split('T')[0], time: '08:00', unit: UNIDADES[0] });

  useEffect(() => {
    const localStudents = localStorage.getItem('personal_students');
    const localSchedules = localStorage.getItem('personal_schedules');
    
    if (localStudents) setStudents(JSON.parse(localStudents));
    else setStudents(INITIAL_STUDENTS);

    if (localSchedules) setSchedules(JSON.parse(localSchedules));
  }, []);

  useEffect(() => {
    if (students.length > 0) localStorage.setItem('personal_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('personal_schedules', JSON.stringify(schedules));
  }, [schedules]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta! (Dica: 1234)');
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const student = { ...newStudent, id: Date.now().toString(), classesDone: 0, vouchers: 0, paymentPending: false };
    setStudents([...students, student]);
    setShowStudentModal(false);
    setNewStudent({ name: '', whatsapp: '', email: '', birthDate: '', unit: UNIDADES[0], packTotal: 4 });
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === newSchedule.studentId);
    const isBonus = student.packTotal === 4 && student.classesDone >= 4;

    const schedule = {
      id: Date.now().toString(),
      ...newSchedule,
      studentName: student.name,
      studentWhatsapp: student.whatsapp,
      status: 'pending',
      isBonus
    };

    setSchedules([...schedules, schedule]);
    setShowScheduleModal(false);
  };

  const handleCheckIn = (scheduleId, studentId) => {
    setSchedules(schedules.map(s => s.id === scheduleId ? { ...s, status: 'completed' } : s));
    setStudents(students.map(st => st.id === studentId ? { ...st, classesDone: st.classesDone + 1 } : st));
  };

  const handleCancelWithReagenda = (scheduleId, studentId) => {
    const now = new Date();
    const expiry = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0];

    setSchedules(schedules.map(s => s.id === scheduleId ? { ...s, status: 'cancelled' } : s));
    setStudents(students.map(st => st.id === studentId ? { ...st, vouchers: st.vouchers + 1 } : st));
    alert(`Aula cancelada! Voucher de reposição gerado. Validade: ${expiry}`);
  };

  const handleNoShow = (scheduleId, studentId) => {
    setSchedules(schedules.map(s => s.id === scheduleId ? { ...s, status: 'no-show' } : s));
    setStudents(students.map(st => st.id === studentId ? { ...st, classesDone: st.classesDone + 1 } : st));
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Confirmando nossa aula de Personal!`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h1 className="text-2xl font-bold mb-2">Dashboard Master</h1>
          <p className="text-slate-400 text-sm mb-6">Acesso exclusivo do Personal Trainer</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Digite sua senha" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition">
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Personal Master Hub</h1>
          <p className="text-xs text-slate-400">Gestão & Agenda</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          Sair
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Agenda Master</h2>
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center gap-1.5 text-sm font-semibold shadow"
              >
                + Novo Agendamento
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button 
                onClick={() => setSelectedUnit('Todas')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${selectedUnit === 'Todas' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}
              >
                Todas Unidades
              </button>
              {UNIDADES.map(u => (
                <button 
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${selectedUnit === u ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}
                >
                  {u}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {schedules
                .filter(s => selectedUnit === 'Todas' || s.unit === selectedUnit)
                .map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative">
                    {s.isBonus && (
                      <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        5ª Sem. Bônus (R$ 0,00)
                      </span>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase">{s.time} • {s.unit}</span>
                        <h3 className="text-base font-bold text-slate-900">{s.studentName}</h3>
                        <span className="text-xs text-slate-500">{s.date}</span>
                      </div>
                      <div>
                        {s.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">Realizada</span>}
                        {s.status === 'cancelled' && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">Reagendada</span>}
                        {s.status === 'no-show' && <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">Falta (&lt;12h)</span>}
                        {s.status === 'pending' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Pendente</span>}
                      </div>
                    </div>

                    {s.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button onClick={() => handleCheckIn(s.id, s.studentId)} className="bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                          ✓ Check-in
                        </button>
                        <button onClick={() => handleCancelWithReagenda(s.id, s.studentId)} className="bg-amber-500 text-white py-2 px-3 rounded-xl text-xs font-bold">
                          ↺ Cancelar (&gt;12h)
                        </button>
                        <button onClick={() => handleNoShow(s.id, s.studentId)} className="bg-rose-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                          ✕ Falta (&lt;12h)
                        </button>
                        <button onClick={() => openWhatsApp(s.studentWhatsapp, s.studentName)} className="bg-emerald-500 text-white py-2 px-3 rounded-xl text-xs font-bold">
                          💬 WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              {schedules.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhuma aula agendada.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alunos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Alunos & Vouchers</h2>
              <button onClick={() => setShowStudentModal(true)} className="bg-indigo-600 text-white p-2.5 rounded-xl text-sm font-semibold shadow">
                + Cadastrar Aluno
              </button>
            </div>

            <div className="space-y-3">
              {students.map(st => (
                <div key={st.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{st.name}</h3>
                      <p className="text-xs text-slate-500">{st.unit} • {st.whatsapp}</p>
                    </div>
                    {st.paymentPending ? (
                      <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded">Inadimplente</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">Em dia</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Aulas no Mês</span>
                      <span className="text-sm font-bold text-slate-800">{st.classesDone} / {st.packTotal} feitas</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vouchers</span>
                      <span className="text-sm font-bold text-indigo-600">{st.vouchers} Reposições</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button onClick={() => openWhatsApp(st.whatsapp, st.name)} className="text-xs text-emerald-600 font-semibold border border-emerald-200 bg-emerald-50 py-1.5 px-3 rounded-lg">
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Painel Financeiro</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Previsto no Mês</span>
                <span className="text-xl font-bold text-slate-900">
                  R$ {students.reduce((acc, st) => acc + (PACK_OPTIONS.find(p => p.value === st.packTotal)?.price || 0), 0)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Recebido via Pix</span>
                <span className="text-xl font-bold text-emerald-600">
                  R$ {students.filter(st => !st.paymentPending).reduce((acc, st) => acc + (PACK_OPTIONS.find(p => p.value === st.packTotal)?.price || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Novo Aluno</h3>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <input required type="text" placeholder="Nome Completo" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <input required type="tel" placeholder="WhatsApp (DDD + Número)" value={newStudent.whatsapp} onChange={e => setNewStudent({...newStudent, whatsapp: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <input required type="date" value={newStudent.birthDate} onChange={e => setNewStudent({...newStudent, birthDate: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <select value={newStudent.unit} onChange={e => setNewStudent({...newStudent, unit: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={newStudent.packTotal} onChange={e => setNewStudent({...newStudent, packTotal: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl text-sm">
                {PACK_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowStudentModal(false)} className="w-1/2 py-2.5 border rounded-xl text-sm font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Novo Agendamento</h3>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <select required value={newSchedule.studentId} onChange={e => setNewSchedule({...newSchedule, studentId: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                <option value="">Selecione o Aluno</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input required type="date" value={newSchedule.date} onChange={e => setNewSchedule({...newSchedule, date: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <input required type="time" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <select value={newSchedule.unit} onChange={e => setNewSchedule({...newSchedule, unit: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="w-1/2 py-2.5 border rounded-xl text-sm font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-40 flex justify-around">
        <button onClick={() => setActiveTab('agenda')} className={`flex flex-col items-center gap-1 p-1.5 ${activeTab === 'agenda' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          📅 <span className="text-[10px]">Agenda</span>
        </button>
        <button onClick={() => setActiveTab('alunos')} className={`flex flex-col items-center gap-1 p-1.5 ${activeTab === 'alunos' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          👥 <span className="text-[10px]">Alunos</span>
        </button>
        <button onClick={() => setActiveTab('financeiro')} className={`flex flex-col items-center gap-1 p-1.5 ${activeTab === 'financeiro' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          💲 <span className="text-[10px]">Financeiro</span>
        </button>
      </nav>
    </div>
  );
}
