import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = 'https://hagwcvhsizwovxqgbmin.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eS7_vdQBFvMEAuhExjj7TQ_VdRQXQuE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

const MAPA_DIAS_SEMANA = {
  'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6
};

const MODALIDADES = ['Consultoria', 'Híbrido', 'Presencial'];
const SEXO_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Não informado'];
const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Misto / Dividido'];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [units, setUnits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pixKey, setPixKey] = useState(localStorage.getItem('pix_key') || '');
  
  // --- ESTADOS DA AGENDA ---
  const [calendarView, setCalendarView] = useState('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchStudent, setSearchStudent] = useState('');
  const [filterUnit, setFilterUnit] = useState('Todas');
  const [filterTurn, setFilterTurn] = useState('Todos');

  // --- ESTADOS DE PESQUISA & FILTROS DE ALUNOS ---
  const [searchStudentTab, setSearchStudentTab] = useState('');
  const [filterStatusTab, setFilterStatusTab] = useState('Todos');
  const [filterModalityTab, setFilterModalityTab] = useState('Todas');

  // --- FINANCEIRO ---
  const [financePeriod, setFinancePeriod] = useState('mensal');

  // Modais
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Formulários
  const [newUnitName, setNewUnitName] = useState('');
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [batchMonth, setBatchMonth] = useState(new Date().getMonth() + 1);
  
  const [paymentForm, setPaymentForm] = useState({
    method: 'Pix',
    details: '',
    amount: 0
  });

  const [newStudent, setNewStudent] = useState({ 
    name: '', whatsapp: '', email: '', birthdate: '', gender: 'Feminino', modality: 'Presencial',
    unit: '', packtotal: 4, monthly_fee: 0, fixed_schedule: {}, cycle_type: 'mês_vigente', due_day: 5,
    start_date: new Date().toISOString().split('T')[0]
  });

  const [newSchedule, setNewSchedule] = useState({ studentid: '', date: new Date().toISOString().split('T')[0], time: '08:00', unit: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  useEffect(() => {
    fetchStudents();
    fetchSchedules();
    fetchUnits();
    fetchTransactions();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (schedules.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      schedules.forEach(s => {
        if (s.status === 'pending' && s.time !== 'Sem horário fixo') {
          const classTime = new Date(`${s.date}T${s.time}`);
          const diffHours = (now - classTime) / (1000 * 60 * 60);

          if (diffHours >= 2 && diffHours < 3) {
            triggerPushNotification('Validação de Check-in Pendente', {
              body: `A aula de ${s.studentname} (${s.time}) ocorreu há 2 horas. Lembre-se de validar o check-in!`,
              icon: '/favicon.ico'
            });
          }
        }
      });
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [schedules]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const triggerPushNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  const fetchUnits = async () => {
    const { data, error } = await supabase.from('units').select('*');
    if (error) console.error(error);
    if (data && data.length > 0) {
      setUnits(data);
      if (!newStudent.unit) {
        const firstActive = data.find(u => u.active)?.name || data[0].name;
        setNewStudent(prev => ({ ...prev, unit: firstActive }));
        setNewSchedule(prev => ({ ...prev, unit: firstActive }));
      }
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) console.error(error);
    if (data) {
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
      setStudents(sorted);
    }
  };

  const fetchSchedules = async () => {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) console.error(error);
    if (data) setSchedules(data);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) console.error(error);
    if (data) setTransactions(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta! (Dica: 1234)');
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    const unitObj = { id: Date.now().toString(), name: newUnitName.trim(), active: true };
    const { error } = await supabase.from('units').insert([unitObj]);
    if (error) alert('Erro ao adicionar unidade: ' + error.message);
    else {
      setNewUnitName('');
      fetchUnits();
    }
  };

  const handleToggleUnitActive = async (unit) => {
    const { error } = await supabase.from('units').update({ active: !unit.active }).eq('id', unit.id);
    if (error) alert('Erro ao alterar status da unidade: ' + error.message);
    else fetchUnits();
  };

  const handleDeleteUnit = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      const { error } = await supabase.from('units').delete().eq('id', id);
      if (error) alert('Erro ao excluir unidade: ' + error.message);
      else fetchUnits();
    }
  };

  const activeUnitsList = units.filter(u => u.active).map(u => u.name);

  const handleOpenPaymentModal = (student) => {
    setSelectedStudentForPayment(student);
    setPaymentForm({
      method: 'Pix',
      details: '',
      amount: student.monthly_fee || 0
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentForPayment) return;

    const currentRefMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const transactionObj = {
      id: Date.now().toString(),
      student_id: selectedStudentForPayment.id,
      student_name: selectedStudentForPayment.name,
      amount: Number(paymentForm.amount),
      payment_method: paymentForm.method,
      payment_details: paymentForm.method === 'Misto / Dividido' ? paymentForm.details : paymentForm.method,
      reference_month: currentRefMonth
    };

    const { error: txError } = await supabase.from('transactions').insert([transactionObj]);
    if (txError) {
      alert('Erro ao registrar transação: ' + txError.message);
      return;
    }

    const { error: stError } = await supabase.from('students').update({ paymentpending: false }).eq('id', selectedStudentForPayment.id);
    if (stError) {
      alert('Erro ao atualizar status do aluno: ' + stError.message);
    } else {
      alert('Pagamento registrado com sucesso!');
      fetchStudents();
      fetchTransactions();
      setShowPaymentModal(false);
    }
  };

  const handleClearMonthSchedules = async () => {
    const year = Number(batchYear);
    const monthStr = String(batchMonth).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;

    if (!window.confirm(`Tem certeza que deseja APAGAR TODOS os agendamentos do mês ${batchMonth}/${batchYear}?`)) {
      return;
    }

    const { error } = await supabase.from('schedules').delete().like('date', `${prefix}%`);
    if (error) {
      alert('Erro ao limpar agendamentos: ' + error.message);
    } else {
      alert(`Agendamentos de ${batchMonth}/${batchYear} removidos com sucesso!`);
      fetchSchedules();
      setShowBatchModal(false);
    }
  };

  const handleGenerateBatchSchedules = async (e) => {
    e.preventDefault();
    const activeStudents = students.filter(s => (s.active ?? true) && s.modality !== 'Consultoria');
    if (activeStudents.length === 0) {
      alert('Nenhum aluno presencial ou híbrido ativo encontrado.');
      return;
    }

    const year = Number(batchYear);
    const month = Number(batchMonth) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const newSchedulesToInsert = [];

    activeStudents.forEach(st => {
      let scheduleMap = {};
      try {
        scheduleMap = typeof st.fixed_days === 'string' && st.fixed_days.startsWith('{') 
          ? JSON.parse(st.fixed_days) 
          : {};
      } catch (err) {
        scheduleMap = {};
      }

      if (Object.keys(scheduleMap).length === 0 && st.fixed_days) {
        st.fixed_days.split(',').forEach(d => {
          scheduleMap[d.trim()] = st.fixed_time || '08:00';
        });
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();

        Object.entries(scheduleMap).forEach(([dayLabel, timeVal]) => {
          if (MAPA_DIAS_SEMANA[dayLabel] === dayOfWeek) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const exists = schedules.some(sc => sc.studentid === st.id && sc.date === dateStr);
            if (!exists) {
              newSchedulesToInsert.push({
                id: `${st.id}_${dateStr}_${Date.now()}_${Math.random()}`,
                studentid: st.id,
                studentname: st.name,
                studentwhatsapp: st.whatsapp,
                date: dateStr,
                time: timeVal || '08:00',
                unit: st.unit || activeUnitsList[0] || 'Atendimento Domiciliar',
                status: 'pending',
                isbonus: false
              });
            }
          }
        });
      }
    });

    if (newSchedulesToInsert.length === 0) {
      alert('Nenhum novo agendamento gerado (já existem ou não há grades fixas configuradas).');
      setShowBatchModal(false);
      return;
    }

    const { error } = await supabase.from('schedules').insert(newSchedulesToInsert);
    if (error) {
      alert('Erro ao gerar agendamentos em massa: ' + error.message);
    } else {
      alert(`Sucesso! ${newSchedulesToInsert.length} agendamentos gerados para ${batchMonth}/${batchYear}!`);
      fetchSchedules();
      setShowBatchModal(false);
    }
  };

  const navigateDate = (amount) => {
    const newDate = new Date(currentDate);
    if (calendarView === 'dia') {
      newDate.setDate(newDate.getDate() + amount);
    } else if (calendarView === 'semana') {
      newDate.setDate(newDate.getDate() + (amount * 7));
    } else if (calendarView === 'mes') {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
  };

  const formatDateYYYYMMDD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const matchesTurn = (timeStr, turn) => {
    if (turn === 'Todos' || !timeStr) return true;
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (isNaN(hour)) return true;
    if (turn === 'Manhã') return hour >= 5 && hour < 12;
    if (turn === 'Tarde') return hour >= 12 && hour < 18;
    if (turn === 'Noite') return hour >= 18 && hour <= 23;
    return true;
  };

  const filteredSchedules = schedules.filter(s => {
    const matchStudent = searchStudent ? s.studentname.toLowerCase().includes(searchStudent.toLowerCase()) : true;
    const matchUnit = filterUnit === 'Todas' ? true : s.unit === filterUnit;
    const matchTurn = matchesTurn(s.time, filterTurn);
    return matchStudent && matchUnit && matchTurn;
  });

  const filteredStudentsTab = students.filter(st => {
    const isActive = st.active ?? true;
    const matchText = !searchStudentTab.trim() || 
      st.name.toLowerCase().includes(searchStudentTab.toLowerCase()) || 
      (st.whatsapp && st.whatsapp.includes(searchStudentTab));

    const matchStatus = filterStatusTab === 'Todos' || 
      (filterStatusTab === 'Ativos' && isActive) || 
      (filterStatusTab === 'Inativos' && !isActive);

    const matchModality = filterModalityTab === 'Todas' || 
      (st.modality || 'Presencial') === filterModalityTab;

    return matchText && matchStatus && matchModality;
  });

  const handleOpenStudentModal = (student = null) => {
    const defaultUnit = activeUnitsList[0] || 'Atendimento Domiciliar';
    if (student) {
      setEditingStudentId(student.id);
      let parsedSchedule = {};
      try {
        parsedSchedule = typeof student.fixed_days === 'string' && student.fixed_days.startsWith('{') 
          ? JSON.parse(student.fixed_days) 
          : {};
      } catch (err) { parsedSchedule = {}; }

      if (Object.keys(parsedSchedule).length === 0 && student.fixed_days) {
        student.fixed_days.split(',').forEach(d => {
          parsedSchedule[d.trim()] = student.fixed_time || '08:00';
        });
      }

      setNewStudent({
        name: student.name || '',
        whatsapp: student.whatsapp || '',
        email: student.email || '',
        birthdate: student.birthdate || '',
        gender: student.gender || 'Feminino',
        modality: student.modality || 'Presencial',
        unit: student.unit || defaultUnit,
        packtotal: student.packtotal ?? 4,
        monthly_fee: student.monthly_fee ?? 0,
        fixed_schedule: parsedSchedule,
        cycle_type: student.cycle_type || 'mês_vigente',
        due_day: student.due_day || 5,
        start_date: student.start_date || formatDateYYYYMMDD(new Date())
      });
    } else {
      setEditingStudentId(null);
      setNewStudent({ 
        name: '', whatsapp: '', email: '', birthdate: '', gender: 'Feminino', modality: 'Presencial',
        unit: defaultUnit, packtotal: 4, monthly_fee: 0, fixed_schedule: {}, cycle_type: 'mês_vigente', due_day: 5,
        start_date: formatDateYYYYMMDD(new Date())
      });
    }
    setShowStudentModal(true);
  };

  const handleModalityChange = (modality) => {
    const defaultUnit = activeUnitsList[0] || 'Atendimento Domiciliar';
    if (modality === 'Consultoria') {
      setNewStudent({ 
        ...newStudent, 
        modality, 
        packtotal: 0, 
        unit: 'Sem Unidade / Online'
      });
    } else {
      setNewStudent({ 
        ...newStudent, 
        modality, 
        packtotal: newStudent.packtotal === 0 ? 4 : newStudent.packtotal,
        unit: newStudent.unit === 'Sem Unidade / Online' ? defaultUnit : newStudent.unit
      });
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const payload = {
      ...newStudent,
      monthly_fee: Number(newStudent.monthly_fee),
      fixed_days: JSON.stringify(newStudent.fixed_schedule)
    };
    delete payload.fixed_schedule;

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

  const handleTogglePaymentStatusDirect = async (student) => {
    if (student.paymentpending) {
      handleOpenPaymentModal(student);
    } else {
      const { error } = await supabase.from('students').update({ paymentpending: true }).eq('id', student.id);
      if (error) alert('Erro ao atualizar status: ' + error.message);
      else fetchStudents();
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      else fetchStudents();
    }
  };

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

  // REVERTER CHECK-IN (VOLTAR PARA PENDENTE E DESFAZER CONTAGEM)
  const handleResetToPending = async (schedule, studentId) => {
    const student = students.find(s => s.id === studentId);
    await supabase.from('schedules').update({ status: 'pending' }).eq('id', schedule.id);
    
    // Se estava concluída, desconta 1 aula realizada do aluno
    if (schedule.status === 'completed' && student && (student.classesdone || 0) > 0) {
      await supabase.from('students').update({ classesdone: Math.max(0, student.classesdone - 1) }).eq('id', studentId);
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

  const handleRescheduleLater = async (scheduleId, studentId, currentStatus) => {
    const student = students.find(s => s.id === studentId);
    const now = new Date();
    const expiry = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    const expiryStr = expiry.toLocaleDateString('pt-BR');

    await supabase.from('schedules').update({ status: 'cancelled' }).eq('id', scheduleId);
    
    if (student) {
      const updates = { vouchers: (student.vouchers || 0) + 1 };
      // Se estava concluída antes, subtrai a aula feita equivocadamente
      if (currentStatus === 'completed' && (student.classesdone || 0) > 0) {
        updates.classesdone = Math.max(0, student.classesdone - 1);
      }
      await supabase.from('students').update(updates).eq('id', studentId);
    }

    fetchSchedules();
    fetchStudents();
    setShowRescheduleModal(false);
    alert(`Aula desmarcada/ajustada! Voucher de reposição adicionado para ${student ? student.name : 'o aluno'}. Validade até ${expiryStr}.`);
  };

  const handleNoShow = async (scheduleId, studentId, currentStatus) => {
    const student = students.find(s => s.id === studentId);
    await supabase.from('schedules').update({ status: 'no-show' }).eq('id', scheduleId);
    
    if (student && currentStatus !== 'completed' && currentStatus !== 'no-show') {
      await supabase.from('students').update({ classesdone: (student.classesdone || 0) + 1 }).eq('id', studentId);
    }
    fetchSchedules();
    fetchStudents();
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Tem certeza que deseja EXCLUIR este agendamento do histórico?')) {
      const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
      if (error) alert('Erro ao excluir: ' + error.message);
      else fetchSchedules();
    }
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

  const getWeekDaysArray = (date) => {
    const tempDate = new Date(date);
    const dayOfWeek = tempDate.getDay();
    const sundayDate = new Date(tempDate);
    sundayDate.setDate(tempDate.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sundayDate);
      d.setDate(sundayDate.getDate() + i);
      const dateStr = formatDateYYYYMMDD(d);
      days.push({
        dateObj: d,
        dateStr,
        dayLabel: DIAS_SEMANA[i].label,
        dayNumber: d.getDate()
      });
    }
    return days;
  };

  const activeStudents = students.filter(st => st.active ?? true);
  const now = new Date();

  const getActiveMonthsInPeriod = (startDateStr, periodMonths) => {
    const startDate = startDateStr ? new Date(`${startDateStr}T00:00:00`) : new Date(2020, 0, 1);
    let monthsToCount = 0;

    for (let i = 0; i < periodMonths; i++) {
      const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (startDate <= new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0)) {
        monthsToCount++;
      }
    }
    return monthsToCount;
  };

  const periodMonths = financePeriod === 'mensal' ? 1 : financePeriod === 'trimestral' ? 3 : financePeriod === 'semestral' ? 6 : 12;

  const totalPeriodGross = activeStudents.reduce((acc, st) => {
    const activeMonths = getActiveMonthsInPeriod(st.start_date, periodMonths);
    return acc + (Number(st.monthly_fee || 0) * activeMonths);
  }, 0);

  const totalPaidPeriod = activeStudents.reduce((acc, st) => {
    if (st.paymentpending) return acc;
    const activeMonths = getActiveMonthsInPeriod(st.start_date, periodMonths);
    return acc + (Number(st.monthly_fee || 0) * activeMonths);
  }, 0);

  const totalPendingPeriod = activeStudents.reduce((acc, st) => {
    if (!st.paymentpending) return acc;
    const activeMonths = getActiveMonthsInPeriod(st.start_date, periodMonths);
    return acc + (Number(st.monthly_fee || 0) * activeMonths);
  }, 0);

  const defaultRate = totalPeriodGross > 0 ? ((totalPendingPeriod / totalPeriodGross) * 100).toFixed(1) : 0;
  const avgTicket = activeStudents.length > 0 ? (activeStudents.reduce((acc, st) => acc + Number(st.monthly_fee || 0), 0) / activeStudents.length).toFixed(0) : 0;

  const paymentMethodTotals = FORMAS_PAGAMENTO.reduce((acc, method) => {
    const sum = transactions
      .filter(t => t.payment_method === method)
      .reduce((tAcc, t) => tAcc + Number(t.amount || 0), 0);
    acc[method] = sum;
    return acc;
  }, {});

  const modalityStats = MODALIDADES.map(m => {
    const mStudents = activeStudents.filter(st => (st.modality || 'Presencial') === m);
    const mRevenue = mStudents.reduce((acc, st) => {
      const activeMonths = getActiveMonthsInPeriod(st.start_date, periodMonths);
      return acc + (Number(st.monthly_fee || 0) * activeMonths);
    }, 0);
    const percent = totalPeriodGross > 0 ? Math.round((mRevenue / totalPeriodGross) * 100) : 0;
    return { name: m, count: mStudents.length, revenue: mRevenue, percent };
  });

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

  const getDaysInMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }
    return days;
  };

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
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">Agenda Master</h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setShowBatchModal(true)}
                  className="bg-amber-500 text-white px-2.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1"
                >
                  ⚡ Gerar / Limpar Mês
                </button>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-indigo-600 text-white px-2.5 py-2 rounded-xl text-xs font-bold shadow"
                >
                  + Agendar
                </button>
              </div>
            </div>

            {/* BARRA DE FILTROS & PESQUISA */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <input 
                type="text" 
                placeholder="🔍 Buscar aluno na agenda..." 
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="w-full p-2 border rounded-xl text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Unidade</label>
                  <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs">
                    <option value="Todas">Todas Unidades</option>
                    {activeUnitsList.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Turno</label>
                  <select value={filterTurn} onChange={e => setFilterTurn(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs">
                    <option value="Todos">Todos Turnos</option>
                    <option value="Manhã">Manhã (05h-12h)</option>
                    <option value="Tarde">Tarde (12h-18h)</option>
                    <option value="Noite">Noite (18h-23h)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SELETOR DE VISÃO & NAVEGAÇÃO DE DATAS */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setCalendarView('dia')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${calendarView === 'dia' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setCalendarView('semana')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${calendarView === 'semana' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setCalendarView('mes')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${calendarView === 'mes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
                >
                  Mês
                </button>
              </div>

              <div className="flex justify-between items-center px-1">
                <button onClick={() => navigateDate(-1)} className="p-1.5 bg-slate-100 rounded-lg text-xs font-bold">◀ Anterior</button>
                <span className="text-xs font-bold text-slate-800">
                  {calendarView === 'dia' && currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  {calendarView === 'semana' && `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                  {calendarView === 'mes' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </span>
                <button onClick={() => navigateDate(1)} className="p-1.5 bg-slate-100 rounded-lg text-xs font-bold">Próximo ▶</button>
              </div>
            </div>

            {/* --- EXIBIÇÃO: VISÃO DIA --- */}
            {calendarView === 'dia' && (
              <div className="space-y-3">
                {filteredSchedules
                  .filter(s => s.date === formatDateYYYYMMDD(currentDate))
                  .sort((a, b) => a.time.localeCompare(b.time))
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
                          <div className="flex flex-col items-end gap-1">
                            {s.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">Realizada</span>}
                            {s.status === 'cancelled' && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">Reagendada</span>}
                            {s.status === 'no-show' && <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">Falta (&lt;12h)</span>}
                            {s.status === 'pending' && !delayed && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Pendente</span>}
                            {delayed && <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">Atrasado (+15m)</span>}
                          </div>
                        </div>

                        {/* PAINEL DE AÇÕES DISPONÍVEL PARA QUALQUER STATUS (INCLUSIVE AULAS JÁ REALIZADAS) */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          {s.status !== 'completed' ? (
                            <button onClick={() => handleCheckIn(s.id, s.studentid)} className="bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                              ✓ Check-in
                            </button>
                          ) : (
                            <button onClick={() => handleResetToPending(s, s.studentid)} className="bg-slate-700 text-white py-2 px-3 rounded-xl text-xs font-bold">
                              ↩ Voltar a Pendente
                            </button>
                          )}
                          
                          <button onClick={() => handleOpenReschedule(s)} className="bg-indigo-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            📅 Mudar Data/Hora
                          </button>
                          
                          <button onClick={() => handleRescheduleLater(s.id, s.studentid, s.status)} className="bg-amber-500 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            ↺ Reagendar (Voucher)
                          </button>
                          
                          <button onClick={() => handleNoShow(s.id, s.studentid, s.status)} className="bg-rose-600 text-white py-2 px-3 rounded-xl text-xs font-bold">
                            ✕ Falta (&lt;12h)
                          </button>
                        </div>

                        {/* BOTAO PARA EXCLUIR AGENDAMENTO INDEVIDO DO HISTORICO */}
                        <div className="text-right pt-1">
                          <button onClick={() => handleDeleteSchedule(s.id)} className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold underline">
                            🗑️ Excluir Agendamento
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {filteredSchedules.filter(s => s.date === formatDateYYYYMMDD(currentDate)).length === 0 && (
                  <p className="text-center text-slate-400 py-8 text-sm">Nenhum agendamento para este dia.</p>
                )}
              </div>
            )}

            {/* --- EXIBIÇÃO: VISÃO SEMANA --- */}
            {calendarView === 'semana' && (
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <div className="grid grid-cols-7 gap-1.5 min-w-[650px]">
                  {getWeekDaysArray(currentDate).map((wDay) => {
                    const daySchedules = filteredSchedules
                      .filter(s => s.date === wDay.dateStr)
                      .sort((a, b) => a.time.localeCompare(b.time));

                    const isToday = wDay.dateStr === formatDateYYYYMMDD(new Date());

                    return (
                      <div 
                        key={wDay.dateStr} 
                        className={`border rounded-xl p-1.5 min-h-[300px] flex flex-col justify-start space-y-1.5 ${isToday ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50'}`}
                      >
                        <div className={`text-center py-1 rounded-lg ${isToday ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-700 font-semibold'}`}>
                          <span className="text-[10px] uppercase block">{wDay.dayLabel}</span>
                          <span className="text-xs font-extrabold">{wDay.dayNumber}</span>
                        </div>

                        <div className="space-y-1.5 overflow-y-auto">
                          {daySchedules.map(sc => (
                            <div 
                              key={sc.id} 
                              onClick={() => {
                                setCurrentDate(new Date(`${sc.date}T00:00:00`));
                                setCalendarView('dia');
                              }}
                              className={`p-1.5 rounded-lg border text-[9px] shadow-sm cursor-pointer transition ${sc.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400'}`}
                            >
                              <div className="flex justify-between items-center font-bold text-indigo-600">
                                <span>{sc.time}</span>
                                {sc.status === 'completed' && <span>✓</span>}
                              </div>
                              <div className="font-bold truncate text-slate-900 mt-0.5">{sc.studentname}</div>
                              <div className="text-[8px] text-slate-400 truncate">{sc.unit}</div>
                            </div>
                          ))}
                          {daySchedules.length === 0 && (
                            <div className="text-center text-[9px] text-slate-300 py-4">Sem aulas</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- EXIBIÇÃO: VISÃO MÊS INTEIRO --- */}
            {calendarView === 'mes' && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                  <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonthGrid(currentDate).map((d, index) => {
                    if (!d) return <div key={index} className="h-20 bg-slate-50/50 rounded-lg"></div>;
                    
                    const daySchedules = filteredSchedules.filter(s => s.date === d.dateStr);
                    const isToday = d.dateStr === formatDateYYYYMMDD(new Date());

                    return (
                      <div 
                        key={d.dateStr} 
                        onClick={() => {
                          setCurrentDate(new Date(`${d.dateStr}T00:00:00`));
                          setCalendarView('dia');
                        }}
                        className={`h-20 border rounded-lg p-1 text-[9px] overflow-hidden cursor-pointer flex flex-col justify-between transition ${isToday ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                      >
                        <span className={`font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{d.day}</span>
                        <div className="space-y-0.5 overflow-y-auto">
                          {daySchedules.map(st => (
                            <div 
                              key={st.id} 
                              className={`px-1 py-0.5 rounded text-[8px] truncate font-semibold ${st.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}
                            >
                              {st.time} {st.studentname.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ABA ALUNOS & VOUCHERS --- */}
        {activeTab === 'alunos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Alunos & Vouchers</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  <span className="text-indigo-600 font-bold">{students.length}</span> Cadastrados • <span className="text-emerald-600 font-bold">{students.filter(s => s.active ?? true).length}</span> Ativos
                </p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setShowUnitsModal(true)} className="bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-semibold">
                  ⚙️ Unidades
                </button>
                <button onClick={() => handleOpenStudentModal()} className="bg-indigo-600 text-white p-2 rounded-xl text-xs font-semibold shadow">
                  + Cadastrar
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <input 
                type="text" 
                placeholder="🔍 Pesquisar por nome ou WhatsApp..." 
                value={searchStudentTab} 
                onChange={e => setSearchStudentTab(e.target.value)} 
                className="w-full p-2 border rounded-xl text-xs" 
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Status</label>
                  <select 
                    value={filterStatusTab} 
                    onChange={e => setFilterStatusTab(e.target.value)} 
                    className="w-full p-1.5 border rounded-lg text-xs font-medium"
                  >
                    <option value="Todos">Todos (Ativos/Inativos)</option>
                    <option value="Ativos">Apenas Ativos</option>
                    <option value="Inativos">Apenas Inativos</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Modalidade</label>
                  <select 
                    value={filterModalityTab} 
                    onChange={e => setFilterModalityTab(e.target.value)} 
                    className="w-full p-1.5 border rounded-lg text-xs font-medium"
                  >
                    <option value="Todas">Todas Modalidades</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Consultoria">Consultoria</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredStudentsTab.map(st => {
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
                        <p className="text-[10px] text-slate-400 font-medium">Início Contrato: {st.start_date ? new Date(`${st.start_date}T00:00:00`).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                      </div>
                      <button 
                        onClick={() => handleTogglePaymentStatusDirect(st)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.paymentpending ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}
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
              {filteredStudentsTab.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhum aluno encontrado com os filtros selecionados.</p>
              )}
            </div>
          </div>
        )}

        {/* --- ABA PAINEL FINANCEIRO INTELIGENTE --- */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Painel Financeiro</h2>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                {activeStudents.length} Alunos Ativos
              </span>
            </div>

            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex justify-between gap-1">
              {[
                { id: 'mensal', label: 'Mensal' },
                { id: 'trimestral', label: 'Trimestral' },
                { id: 'semestral', label: 'Semestral' },
                { id: 'anual', label: 'Anual' }
              ].map(p => (
                <button 
                  key={p.id}
                  onClick={() => setFinancePeriod(p.id)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${financePeriod === p.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-400 font-bold uppercase block mb-1">Faturamento Real ({financePeriod.toUpperCase()})</span>
                <span className="text-xl font-extrabold text-slate-900">R$ {totalPeriodGross.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Calculado pelo tempo de contrato</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-emerald-600 font-bold uppercase block mb-1">Recebido Quitado</span>
                <span className="text-xl font-extrabold text-emerald-600">R$ {totalPaidPeriod.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-emerald-700/70 block mt-1">
                  {((totalPaidPeriod / (totalPeriodGross || 1)) * 100).toFixed(0)}% do previsto
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-rose-500 font-bold uppercase block mb-1">Pendente / Inadimplência</span>
                <span className="text-xl font-extrabold text-rose-600">R$ {totalPendingPeriod.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                  Taxa: {defaultRate}%
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-indigo-600 font-bold uppercase block mb-1">Ticket Médio / Aluno</span>
                <span className="text-xl font-extrabold text-indigo-600">R$ {avgTicket}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Mensal por contrato</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico de Recebimentos por Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-2">
                {FORMAS_PAGAMENTO.map(method => (
                  <div key={method} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block">{method}</span>
                    <span className="text-sm font-bold text-slate-900">R$ {(paymentMethodTotals[method] || 0).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Divisão de Receita por Modalidade</h3>
              
              <div className="flex items-center justify-around py-2">
                <div 
                  className="w-24 h-24 rounded-full border-2 border-white shadow-inner flex items-center justify-center relative"
                  style={{
                    background: `conic-gradient(
                      #4f46e5 0% ${modalityStats[0].percent}%, 
                      #06b6d4 ${modalityStats[0].percent}% ${modalityStats[0].percent + modalityStats[1].percent}%, 
                      #10b981 ${modalityStats[0].percent + modalityStats[1].percent}% 100%
                    )`
                  }}
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[10px] text-slate-700">
                    {periodMonths}M
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                    <span className="font-semibold text-slate-700">Consultoria:</span>
                    <span className="font-bold text-slate-900">R$ {modalityStats[0].revenue} ({modalityStats[0].percent}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                    <span className="font-semibold text-slate-700">Híbrido:</span>
                    <span className="font-bold text-slate-900">R$ {modalityStats[1].revenue} ({modalityStats[1].percent}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-700">Presencial:</span>
                    <span className="font-bold text-slate-900">R$ {modalityStats[2].revenue} ({modalityStats[2].percent}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ajuste de Valores dos Alunos</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeStudents.map(st => (
                  <div key={st.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{st.name}</p>
                      <p className="text-[10px] text-slate-400">Vencimento: Dia {st.due_day || 5} • {st.modality || 'Presencial'}</p>
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

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chave Pix para Cobrança</h3>
              <form onSubmit={handleSavePix} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Cole sua chave Pix (E-mail, CPF, Telefone...)" 
                  value={pixKey} 
                  onChange={e => setPixKey(e.target.value)} 
                  className="flex-1 p-2.5 border rounded-xl text-xs" 
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl text-xs font-bold">Salvar</button>
              </form>
              <button onClick={copyPix} className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                📋 Copiar Chave Pix
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DAR BAIXA EM PAGAMENTO --- */}
      {showPaymentModal && selectedStudentForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Dar Baixa em Mensalidade</h3>
            <p className="text-xs text-slate-500">Registrar pagamento de <strong>{selectedStudentForPayment.name}</strong></p>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valor Pago (R$)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={paymentForm.amount} 
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-sm font-bold text-emerald-700" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Forma de Pagamento</label>
                <select 
                  value={paymentForm.method} 
                  onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} 
                  className="w-full p-2.5 border rounded-xl text-sm font-bold"
                >
                  {FORMAS_PAGAMENTO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {paymentForm.method === 'Misto / Dividido' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Detalhamento da Divisão</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: R$ 200 Pix + R$ 300 Cartão Crédito" 
                    value={paymentForm.details} 
                    onChange={e => setPaymentForm({...paymentForm, details: e.target.value})} 
                    className="w-full p-2.5 border rounded-xl text-xs" 
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="w-1/2 py-2.5 border rounded-xl text-sm font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold">Confirmar Baixa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL GERAÇÃO EM MASSA DA GRADE --- */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">⚡ Gerar ou Limpar Mês</h3>
            <p className="text-xs text-slate-500">
              Gere automaticamente as aulas do mês com base na grade fixa ou limpe os agendamentos do mês selecionado.
            </p>

            <form onSubmit={handleGenerateBatchSchedules} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mês</label>
                  <select value={batchMonth} onChange={e => setBatchMonth(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-sm font-bold">
                    <option value={1}>01 - Janeiro</option>
                    <option value={2}>02 - Fevereiro</option>
                    <option value={3}>03 - Março</option>
                    <option value={4}>04 - Abril</option>
                    <option value={5}>05 - Maio</option>
                    <option value={6}>06 - Junho</option>
                    <option value={7}>07 - Julho</option>
                    <option value={8}>08 - Agosto</option>
                    <option value={9}>09 - Setembro</option>
                    <option value={10}>10 - Outubro</option>
                    <option value={11}>11 - Novembro</option>
                    <option value={12}>12 - Dezembro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ano</label>
                  <input type="number" value={batchYear} onChange={e => setBatchYear(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-sm font-bold text-center" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
                  ⚡ Gerar Aulas do Mês
                </button>
                <button type="button" onClick={handleClearMonthSchedules} className="w-full py-2.5 bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold">
                  🗑️ Limpar Todos Agendamentos Deste Mês
                </button>
                <button type="button" onClick={() => setShowBatchModal(false)} className="w-full py-2 border rounded-xl text-xs font-bold text-slate-500">
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL GESTÃO DE UNIDADES --- */}
      {showUnitsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Gerenciar Unidades</h3>
              <button onClick={() => setShowUnitsModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUnit} className="flex gap-2">
              <input 
                required 
                type="text" 
                placeholder="Nova Unidade (ex: EC Moinhos)" 
                value={newUnitName} 
                onChange={e => setNewUnitName(e.target.value)} 
                className="flex-1 p-2.5 border rounded-xl text-sm" 
              />
              <button type="submit" className="bg-indigo-600 text-white px-3.5 rounded-xl text-xs font-bold">+ Adicionar</button>
            </form>

            <div className="space-y-2 pt-2">
              {units.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-xl">
                  <span className={`text-sm font-bold ${!u.active ? 'line-through text-slate-400' : 'text-slate-800'}`}>{u.name}</span>
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => handleToggleUnitActive(u)} className={u.active ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {u.active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button onClick={() => handleDeleteUnit(u.id)} className="text-rose-600 font-bold">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data Início Contrato</label>
                  <input required type="date" value={newStudent.start_date} onChange={e => setNewStudent({...newStudent, start_date: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data de Nascimento</label>
                  <input required type="date" value={newStudent.birthdate} onChange={e => setNewStudent({...newStudent, birthdate: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sexo</label>
                <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                  {SEXO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
                {newStudent.modality === 'Consultoria' ? (
                  <input type="text" readOnly value="Sem Unidade / Online" className="w-full p-2.5 border rounded-xl text-sm bg-slate-100 text-slate-500 italic" />
                ) : (
                  <select value={newStudent.unit} onChange={e => setNewStudent({...newStudent, unit: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm">
                    {activeUnitsList.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                )}
              </div>

              {newStudent.modality !== 'Consultoria' && (
                <div className="space-y-2 border-t pt-2">
                  <label className="text-xs font-bold text-slate-700 block">Grade Fixa (Selecione o Dia e o Horário)</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {DIAS_SEMANA.map(d => {
                      const isSelected = !!newStudent.fixed_schedule[d.label];
                      return (
                        <div key={d.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              const newSched = { ...newStudent.fixed_schedule };
                              if (isSelected) {
                                delete newSched[d.label];
                              } else {
                                newSched[d.label] = '08:00';
                              }
                              setNewStudent({ ...newStudent, fixed_schedule: newSched });
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border min-w-[50px] ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600'}`}
                          >
                            {d.label}
                          </button>
                          {isSelected && (
                            <input
                              type="time"
                              value={newStudent.fixed_schedule[d.label] || '08:00'}
                              onChange={e => {
                                const newSched = { ...newStudent.fixed_schedule, [d.label]: e.target.value };
                                setNewStudent({ ...newStudent, fixed_schedule: newSched });
                              }}
                              className="p-1 border rounded-lg text-xs bg-white font-bold"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dia Vencimento</label>
                <input type="number" min="1" max="31" value={newStudent.due_day} onChange={e => setNewStudent({...newStudent, due_day: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl text-sm" />
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
                {activeUnitsList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="w-1/2 py-2.5 border rounded-xl text-sm font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE REMANEJAR HORÁRIO OU GERAR VOUCHER --- */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Remanejar ou Desmarcar</h3>
            <p className="text-xs text-slate-500">
              Escolha uma nova data para <strong>{selectedSchedule?.studentname}</strong> ou libere o horário gerando um voucher de reposição.
            </p>

            <form onSubmit={handleSaveReschedule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nova Data</label>
                <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Novo Horário</label>
                <input type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">
                Confirmar Nova Data
              </button>
            </form>

            <div className="border-t pt-3 space-y-2">
              <button 
                type="button" 
                onClick={() => handleRescheduleLater(selectedSchedule.id, selectedSchedule.studentid, selectedSchedule.status)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
              >
                ↺ Reagendar Depois (Gerar Voucher)
              </button>
              <button 
                type="button" 
                onClick={() => setShowRescheduleModal(false)} 
                className="w-full py-2 border rounded-xl text-xs font-bold text-slate-500"
              >
                Cancelar
              </button>
            </div>
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
