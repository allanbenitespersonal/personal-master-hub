import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://hagwcvhsizwovxqgbmin.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eS7_vdQBFvMEAuhExjj7TQ_VdRQXQuE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- UNIDADES ---
const UNIDADES = [
  'EC Grand Park',
  'EC Alvorada',
  'MF São João',
  'MF Country',
  'Atendimento Domiciliar'
];

const PACK_OPTIONS = [
  { label: '0 Aulas (Consultoria)', value: 0 },
  { label: '4 Aulas (1x/semana)', value: 4 },
  { label: '8 Aulas (2x/semana)', value: 8 },
  { label: '12 Aulas (3x/semana)', value: 12 },
  { label: '20 Aulas (5x/semana)', value: 20 },
];

const DIAS_SEMANA = [
  { id: '0', label: 'Dom' },
  { id: '1', label: 'Seg' },
  { id: '2', label: 'Ter' },
  { id: '3', label: 'Qua' },
  { id: '4', label: 'Qui' },
  { id: '5', label: 'Sex' },
  { id: '6', label: 'Sáb' },
];

const MODALIDADES = ['Consultoria', 'Híbrido', 'Presencial'];
const SEXO_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Não informado'];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('Todas');
  const [pixKey, setPixKey] = useState(localStorage.getItem('pix_key') || '');
  
  // Modais
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Formulários
  const [newStudent, setNewStudent] = useState({ 
    name: '', whatsapp: '', email: '', birthdate: '', gender: 'Feminino', modality: 'Presencial',
    unit: UNIDADES[0], packtotal: 4, monthly_fee: 0, fixed_days: [], fixed_time: '08:00', cycle_type: 'mês_vigente', due_day: 5 
  });
  const [newSchedule, setNewSchedule] = useState({ studentid: '', date: new Date().toISOString().split('T')[0], time: '08:00', unit: UNIDADES[0] });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  useEffect(() => {
    fetchStudents();
    fetchSchedules();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) console.error(error);
    if (data) setStudents(data);
  };

  const fetchSchedules = async () => {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) console.error(error);
    if (data) setSchedules(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta! (Dica: 1234)');
    }
  };

  // --- GESTÃO DE ALUNOS ---
  const handleOpenStudentModal = (student = null) => {
    if (student) {
      setEditingStudentId(student.id);
      setNewStudent({
        name: student.name || '',
        whatsapp: student.whatsapp || '',
        email: student.email || '',
        birthdate: student.birthdate || '',
        gender: student.gender || 'Feminino',
        modality: student.modality || 'Presencial',
        unit: student.unit || UNIDADES[0],
        packtotal: student.packtotal ?? 4,
        monthly_fee: student.monthly_fee ?? 0,
        fixed_days: student.fixed_days ? student.fixed_days.split(',') : [],
        fixed_time: student.fixed_time || '08:00',
        cycle_type: student.cycle_type || 'mês_vigente',
        due_day: student.due_day || 5
      });
    } else {
      setEditingStudentId(null);
      setNewStudent({ 
        name: '', whatsapp: '', email: '', birthdate: '', gender: 'Feminino', modality: 'Presencial',
        unit: UNIDADES[0], packtotal: 4, monthly_fee: 0, fixed_days: [], fixed_time: '08:00', cycle_type: 'mês_vigente', due_day: 5 
      });
    }
    setShowStudentModal(true);
  };

  const handleModalityChange = (modality) => {
    if (modality === 'Consultoria') {
      setNewStudent({ ...newStudent, modality, packtotal: 0, fixed_time: 'Sem horário fixo' });
    } else {
      setNewStudent({ ...newStudent, modality, packtotal: newStudent.packtotal === 0 ? 4 : newStudent.packtotal });
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const payload = {
      ...newStudent,
      monthly_fee: Number(newStudent.monthly_fee),
      fixed_days: newStudent.fixed_days.join(',')
    };

    if (editingStudentId) {
      const { error } = await supabase.from('students').update(payload).eq('id', editingStudentId);
      if (error) alert('Erro ao atualizar aluno: ' + error.message);
    } else {
      const student = { ...payload, id: Date.now().toString(), classesdone: 0, vouchers: 0, paymentpending: false, active: true };
      const { error } = await supabase.from('students').insert([student]);
      if (error) alert('Erro ao salvar aluno: ' + error.message);
    }
    fetchStudents();
    setShowStudentModal(false);
  };

  const handleUpdateStudentFee = async (studentId, newFee) => {
    const { error } = await supabase.from('students').update({ monthly_fee: Number(newFee) }).eq('id', studentId);
    if (error) alert('Erro ao atualizar valor: ' + error.message);
    else fetchStudents();
  };

  const handleToggleActive = async (student) => {
    const newStatus = !(student.active ?? true);
    const { error } = await supabase.from('students').update({ active: newStatus }).eq('id', student.id);
    if (error) alert('Erro ao alterar status: ' + error.message);
    else fetchStudents();
  };

  const handleTogglePayment = async (student) => {
    const newPayment = !student.paymentpending;
    const { error } = await supabase.from('students').update({ paymentpending: newPayment }).eq('id', student.id);
    if (error) alert('Erro ao atualizar pagamento: ' + error.message);
    else fetchStudents();
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      else fetchStudents();
    }
  };

  // --- GESTÃO DE AGENDAMENTOS ---
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === newSchedule.studentid);
    const isbonus = student ? (student.packtotal === 4 && student.classesdone >= 4) : false;

    const schedule = {
      id: Date.now().toString(),
      ...newSchedule,
      studentname: student ? student.name : '',
      studentwhatsapp: student ? student.whatsapp : '',
      status: 'pending',
      isbonus
    };

    const { error } = await supabase.from('schedules').insert([schedule]);
    if (error) {
      alert('Erro ao agendar aula: ' + error.message);
    } else {
      fetchSchedules();
      setShowScheduleModal(false);
    }
  };

  const handleCheckIn = async (scheduleId, studentId) => {
    const student = students.find(s => s.id === studentId);
    await supabase.from('schedules').update({ status: 'completed' }).eq('id', scheduleId);
    if (student) {
      await supabase.from('students').update({ classesdone: (student.classesdone || 0) + 1 }).eq('id', studentId);
    }
    fetchSchedules();
    fetchStudents();
  };

  const handleOpenReschedule = (schedule) => {
    setSelectedSchedule(schedule);
    setRescheduleData({ date: schedule.date, time: schedule.time });
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    await supabase.from('schedules').update({ 
      date: rescheduleData.date, 
      time: rescheduleData.time,
      status: 'pending'
    }).eq('id', selectedSchedule.id);

    fetchSchedules();
    setShowRescheduleModal(false);
  };

  const handleCancelWithReagenda = async (scheduleId, studentId) => {
    const student = students.find(s => s.id === studentId);
    const now = new Date();
    const expiry = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0];

    await supabase.from('schedules').update({ status: 'cancelled' }).eq('id', scheduleId);
    if (student) {
      await supabase.from('students').update({ vouchers: (student.vouchers || 0) + 1 }).eq('id', studentId);
    }
    fetchSchedules();
    fetchStudents();
    alert(`Aula cancelada! Voucher de reposição gerado. Validade: ${expiry}`);
  };

  const handleNoShow = async (scheduleId, studentId) => {
    const student = students.find(s => s.id === studentId);
    await supabase.from('schedules').update({ status: 'no-show' }).eq('id', scheduleId);
    if (student) {
      await supabase.from('students').update({ classesdone: (student.classesdone || 0) + 1 }).eq('id', studentId);
    }
    fetchSchedules();
    fetchStudents();
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Confirmando nossa aula de Personal!`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleSavePix = (e) => {
    e.preventDefault();
    localStorage.setItem('pix_key', pixKey);
    alert('Chave Pix salva com sucesso!');
  };

  const copyPix = () => {
    if (!pixKey) {
      alert('Configure sua chave Pix no Painel Financeiro primeiro!');
      return;
    }
    navigator.clipboard.writeText(pixKey);
    alert('Chave Pix copiada para a área de transferência!');
  };

  const isDelayed = (dateStr, timeStr, status) => {
    if (status !== 'pending' || timeStr === 'Sem horário fixo') return false;
    const classTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffMinutes = (now - classTime) / (1000 * 60);
    return diffMinutes > 15;
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
        {/* --- ABA AGENDA MASTER --- */}
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
                .map((s) => {
                  const delayed = isDelayed(s.date, s.time, s.status);
                  return (
                    <div key={s.id} className={`p-4 rounded-2xl bg-white border shadow-sm space-y-3 relative ${delayed ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200'}`}>
                      {s.isbonus && (
                        <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                          5ª Sem. Bônus (R$ 0,00)
                        </span>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase">{s.time} • {s.unit}</span>
                          <h3 className="text-base font-bold text-slate-900">{s.studentname}</h3>
                          <span className="text-xs text-slate-500">{s.date}</span>
                        </div>
                        <div>
                          {s.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">Realizada</span>}
                          {s.status === 'cancelled' && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">Reagendada</span>}
                          {s.status === 'no-show' && <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">Falta (&lt;12h)</span>}
                          {s.status === 'pending' && !delayed && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Pendente</span>}
                          {delayed && <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">Atrasado (+15m)</span>}
                        </div>
                      </div>

                      {s.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleCheckIn(s.id, s.studentid)} className="bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            ✓ Check-in
                          </button>
                          <button onClick={() => handleOpenReschedule(s)} className="bg-indigo-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            📅 Remanejar
                          </button>
                          <button onClick={() => handleCancelWithReagenda(s.id, s.studentid)} className="bg-amber-500 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            ↺ Cancelar (&gt;12h)
                          </button>
                          <button onClick={() => handleNoShow(s.id, s.studentid)} className="bg-rose-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            ✕ Falta (&lt;12h)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              {schedules.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhuma aula agendada.</p>
              )}
            </div>
          </div>
        )}

        {/* --- ABA ALUNOS & VOUCHERS --- */}
        {activeTab === 'alunos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Alunos & Vouchers</h2>
              <button onClick={() => handleOpenStudentModal()} className="bg-indigo-600 text-white p-2.5 rounded-xl text-sm font-semibold shadow">
                + Cadastrar Aluno
              </button>
            </div>

            <div className="space-y-3">
              {students.map(st => {
                const isActive = st.active ?? true;
                return (
                  <div key={st.id} className={`p-4 bg-white rounded-2xl border shadow-sm space-y-3 ${!isActive ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{st.name}</h3>
                          {!isActive && <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">Inativo</span>}
                          {st.modality && (
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {st.modality}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{st.unit} • {st.whatsapp}</p>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">Mensalidade: R$ {st.monthly_fee || 0}</p>
                        {st.fixed_days && (
                          <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                            Grade Fixa: {st.fixed_days} {st.fixed_time ? `às ${st.fixed_time}` : ''}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleTogglePayment(st)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.paymentpending ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {st.paymentpending ? 'Inadimplente' : 'Em dia'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Aulas no Mês</span>
                        <span className="text-sm font-bold text-slate-800">
                          {st.packtotal === 0 ? 'Consultoria' : `${st.classesdone || 0} / ${st.packtotal} feitas`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Vouchers</span>
                        <span className="text-sm font-bold text-indigo-600">{st.vouchers || 0} Reposições</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenStudentModal(st)} className="text-slate-600 font-semibold hover:text-indigo-600">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleToggleActive(st)} className="text-amber-600 font-semibold hover:text-amber-700">
                          {isActive ? '⏸️ Desativar' : '▶️ Ativar'}
                        </button>
                        <button onClick={() => handleDeleteStudent(st.id)} className="text-rose-600 font-semibold hover:text-rose-700">
                          🗑️ Excluir
                        </button>
                      </div>
                      <button onClick={() => openWhatsApp(st.whatsapp, st.name)} className="text-xs text-emerald-600 font-semibold border border-emerald-200 bg-emerald-50 py-1 px-2.5 rounded-lg">
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- ABA PAINEL FINANCEIRO (EDITÁVEL) --- */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Painel Financeiro</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Previsto no Mês</span>
                <span className="text-xl font-bold text-slate-900">
                  R$ {students.filter(st => st.active ?? true).reduce((acc, st) => acc + Number(st.monthly_fee || 0), 0)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Recebido via Pix</span>
                <span className="text-xl font-bold text-emerald-600">
                  R$ {students.filter(st => (st.active ?? true) && !st.paymentpending).reduce((acc, st) => acc + Number(st.monthly_fee || 0), 0)}
                </span>
              </div>
            </div>

            {/* Ajuste de mensalidade por aluno */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Ajuste de Valores dos Alunos (Mês Vigente)</h3>
              <div className="space-y-2">
                {students.filter(st => st.active ?? true).map(st => (
                  <div key={st.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{st.name}</p>
                      <p className="text-[10px] text-slate-400">Vencimento: Dia {st.due_day || 5}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-600">R$</span>
                      <input 
                        type="number" 
                        defaultValue={st.monthly_fee || 0}
                        onBlur={(e) => handleUpdateStudentFee(st.id, e.target.value)}
                        className="w-20 p-1 border rounded-lg text-xs font-bold text-right bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuração do Pix */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Sua Chave Pix para Cobrança</h3>
              <form onSubmit={handleSavePix} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Cole sua chave Pix (E-mail, CPF, Telefone...)" 
                  value={pixKey} 
                  onChange={e => setPixKey(e.target.value)} 
                  className="flex-1 p-2.5 border rounded-xl text-sm" 
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl text-xs font-bold">Salvar</button>
              </form>
              <button onClick={copyPix} className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                📋 Copiar Minha Chave Pix
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL CADASTRO / EDIÇÃO DE ALUNO --- */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">{editingStudentId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome</label>
                <input required type="text" placeholder="Nome Completo" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">E-mail</label>
                <input required type="email" placeholder="email@exemplo.com" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telefone (WhatsApp)</label>
                <input required type="tel" placeholder="+55 (51) 99999-9999" value={newStudent.whatsapp} onChange={e => setNewStudent({...newStudent, whatsapp: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sexo</label>
                  <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                    {SEXO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data de Nascimento</label>
                  <input required type="date" value={newStudent.birthdate} onChange={e => setNewStudent({...newStudent, birthdate: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Turmas / Modalidade</label>
                <div className="flex gap-2">
                  {MODALIDADES.map(m => {
                    const selected = newStudent.modality === m;
                    return (
                      <button 
                        type="button" 
                        key={m} 
                        onClick={() => handleModalityChange(m)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${selected ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pacote Contratado</label>
                  <select value={newStudent.packtotal} onChange={e => setNewStudent({...newStudent, packtotal: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl text-sm">
                    {PACK_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valor Mensal (R$)</label>
                  <input required type="number" step="0.01" placeholder="Ex: 500" value={newStudent.monthly_fee} onChange={e => setNewStudent({...newStudent, monthly_fee: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm font-bold text-emerald-700" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Unidade Principal</label>
                <select value={newStudent.unit} onChange={e => setNewStudent({...newStudent, unit: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dias da Grade Fixa</label>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {DIAS_SEMANA.map(d => {
                    const selected = newStudent.fixed_days.includes(d.label);
                    return (
                      <button 
                        type="button" 
                        key={d.id} 
                        onClick={() => {
                          const days = selected ? newStudent.fixed_days.filter(x => x !== d.label) : [...newStudent.fixed_days, d.label];
                          setNewStudent({...newStudent, fixed_days: days});
                        }}
                        className={`flex-1 min-w-[36px] py-1.5 text-xs font-bold rounded-lg border ${selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600'}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Horário Fixo</label>
                  {newStudent.modality === 'Consultoria' ? (
                    <input type="text" readOnly value="Sem horário fixo" className="w-full p-2.5 border rounded-xl text-sm bg-slate-100 text-slate-500" />
                  ) : (
                    <input type="time" value={newStudent.fixed_time} onChange={e => setNewStudent({...newStudent, fixed_time: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dia Vencimento</label>
                  <input type="number" min="1" max="31" value={newStudent.due_day} onChange={e => setNewStudent({...newStudent, due_day: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowStudentModal(false)} className="w-1/2 py-2.5 border rounded-xl text-sm font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE NOVO AGENDAMENTO --- */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Novo Agendamento</h3>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <select required value={newSchedule.studentid} onChange={e => setNewSchedule({...newSchedule, studentid: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                <option value="">Selecione o Aluno</option>
                {students.filter(s => s.active ?? true).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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

      {/* --- MODAL DE REMANEJAR HORÁRIO --- */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Remanejar Aula</h3>
            <p className="text-xs text-slate-500">Alterar data e horário de {selectedSchedule?.studentname}</p>
            <form onSubmit={handleSaveReschedule} className="space-y-3">
              <input required type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <input required type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="w-1/2 py-2.5 border rounded-xl text-sm font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Salvar Remanejamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BARRA DE NAVEGAÇÃO FIXA --- */}
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
