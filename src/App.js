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
  { id: '1', label: 'Seg' },
  { id: '2', label: 'Ter' },
  { id: '3', label: 'Qua' },
  { id: '4', label: 'Qui' },
  { id: '5', label: 'Sex' },
  { id: '6', label: 'Sáb' },
  { id: '0', label: 'Dom' },
];

const MAPA_DIAS_SEMANA = {
  'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6, 'Dom': 0
};

const MODALIDADES = ['Consultoria', 'Híbrido', 'Presencial'];
const SEXO_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Não informado'];
const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Misto / Dividido'];

// DATAS E FERIADOS NACIONAIS & REGIONAIS (RS / POA)
const DATAS_MARKETING_INICIAL = [
  { id: '01-01', data: '01/01', nome: 'Ano Novo (Feriado Nacional)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Campanha "Novo Ano, Novas Metas": Plano Trimestral com desconto.' },
  { id: '02-02', data: '02/02', nome: 'Nossa Sra. dos Navegantes (RS/POA)', tipo: 'Feriado Regional', publico: 'Porto Alegre', ideia: 'Aulão de Verão ao ar livre no Orla do Guaíba.' },
  { id: '17-02', data: 'Fev/Mar', nome: 'Carnaval (Ponto Facultativo)', tipo: 'Nacional', publico: 'Geral', ideia: 'Desafio "Detox de Carnaval" para secar e recuperar o ritmo.' },
  { id: '08-03', data: '08/03', nome: 'Dia Internacional da Mulher', tipo: 'Promocional', publico: 'Feminino', ideia: 'Desconto de 20% no 1º mês para alunas novas ou voucher presente.' },
  { id: '15-03', data: '15/03', nome: 'Dia do Consumidor', tipo: 'Promocional', publico: 'Geral', ideia: 'Oferta relâmpago de taxa zero de avaliação física.' },
  { id: 'sexta-santa', data: 'Mar/Abr', nome: 'Sexta-Feira Santa (Feriado Nacional)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Treino especial pré-feriado prolongado.' },
  { id: '21-04', data: '21/04', nome: 'Tiradentes (Feriado Nacional)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Combo Treino + Consultoria com preço promocional.' },
  { id: '01-05', data: '01/05', nome: 'Dia do Trabalho (Feriado Nacional)', tipo: 'Feriado Nacional', publico: 'Trabalhadores', ideia: 'Campanha "Invista na sua Saúde": Condições para profissionais corporativos.' },
  { id: '10-05', data: '2º Dom/Mai', nome: 'Dia das Mães', tipo: 'Promocional', publico: 'Mães / Filhos', ideia: 'Plano em dupla Mãe & Filho(a) com isenção da primeira mensalidade.' },
  { id: '12-06', data: '12/06', nome: 'Dia dos Namorados', tipo: 'Promocional', publico: 'Casais', ideia: 'Treino em Dupla: Pague 1 e treinem 2 durante o mês de Junho.' },
  { id: '09-08', data: '2º Dom/Ago', nome: 'Dia dos Pais', tipo: 'Promocional', publico: 'Pais', ideia: 'Campanha "Pai Ativo" - Kit Personal + Consultoria.' },
  { id: '01-09', data: '01/09', nome: 'Dia do Ed. Físico / Personal', tipo: 'Especial', publico: 'Geral', ideia: 'Semana do Personal: Avaliação biomecânica gratuita para indicações.' },
  { id: '07-09', data: '07/09', nome: 'Independência do Brasil (Feriado)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Desafio 30 Dias de Independência do Sedentarismo.' },
  { id: '20-09', data: '20/09', nome: 'Revolução Farroupilha (Feriado RS)', tipo: 'Feriado Regional', publico: 'Rio Grande do Sul', ideia: 'Campanha "Força Gaúcha": Desconto em planos presenciais.' },
  { id: '12-10', data: '12/10', nome: 'Nossa Sra. Aparecida (Feriado)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Ação para pais e mães com rotina corrida.' },
  { id: '28-10', data: '28/10', nome: 'Dia do Servidor Público', tipo: 'Promocional', publico: 'Funcionalismo', ideia: 'Desconto exclusivo permanente para funcionários públicos.' },
  { id: '02-11', data: '02/11', nome: 'Finados (Feriado Nacional)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Reagendamento antecipado de aulas da semana.' },
  { id: '15-11', data: '15/11', nome: 'Proclamação da República (Feriado)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Ação "Projeto Verão Relâmpago" (Últimos 45 dias do ano).' },
  { id: '20-11', data: '20/11', nome: 'Dia da Consciência Negra (Feriado)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Aulão solidário e integrativo.' },
  { id: '27-11', data: 'Última Sex/Nov', nome: 'Black Friday', tipo: 'Promocional', publico: 'Geral', ideia: 'Maior oferta do ano: Desconto em planos semestrais ou anuais.' },
  { id: '25-12', data: '25/12', nome: 'Natal (Feriado Nacional)', tipo: 'Feriado Nacional', publico: 'Geral', ideia: 'Cartão presente de treino/consultoria para familiares.' }
];

export default function App() {
  // AUTENTICAÇÃO E PERFIS
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('super_admin'); // 'super_admin' (Allan) | 'moderator' (Cris) | 'student'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activeTab, setActiveTab] = useState('resumo');
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [units, setUnits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pixKey, setPixKey] = useState(localStorage.getItem('pix_key') || '');

  // Efeito Lanterna
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // SISTEMA DE LEMBRETES & NOTIFICAÇÕES (PERSISTENTE NO LOCALSTORAGE)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hub_custom_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    is_full_day: false,
    expiry_date: ''
  });

  const saveNotification = (e) => {
    e.preventDefault();
    if (!newNotice.title.trim()) return;

    const created = {
      id: Date.now().toString(),
      ...newNotice,
      completed: false
    };

    const updated = [created, ...notifications];
    setNotifications(updated);
    localStorage.setItem('hub_custom_notifications', JSON.stringify(updated));

    setNewNotice({
      title: '',
      description: '',
      student_id: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      is_full_day: false,
      expiry_date: ''
    });
    setShowNotificationModal(false);
    alert('Notificação/Lembrete criado com sucesso!');
  };

  const toggleNotificationComplete = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, completed: !n.completed } : n);
    setNotifications(updated);
    localStorage.setItem('hub_custom_notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    if (window.confirm('Excluir esta notificação definitivamente?')) {
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      localStorage.setItem('hub_custom_notifications', JSON.stringify(updated));
    }
  };

  // ESTADOS DE MARKETING & CAMPANHAS
  const [campaignData, setCampaignData] = useState(() => {
    const saved = localStorage.getItem('marketing_campaigns_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignRevenue, setCampaignRevenue] = useState('');

  const saveCampaignMetrics = (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    const updated = {
      ...campaignData,
      [selectedCampaign.id]: {
        startDate: campaignStartDate,
        revenue: Number(campaignRevenue || 0)
      }
    };

    setCampaignData(updated);
    localStorage.setItem('marketing_campaigns_data', JSON.stringify(updated));
    alert(`Ação registrada para "${selectedCampaign.nome}"!`);
    setSelectedCampaign(null);
  };
  
  // ESTADOS DA AGENDA
  const [calendarView, setCalendarView] = useState('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchStudent, setSearchStudent] = useState('');
  const [filterUnit, setFilterUnit] = useState('Todas');
  const [filterTurn, setFilterTurn] = useState('Todos');

  // ESTADOS DE PESQUISA & FILTROS DE ALUNOS
  const [searchStudentTab, setSearchStudentTab] = useState('');
  const [filterStatusTab, setFilterStatusTab] = useState('Todos');
  const [filterModalityTab, setFilterModalityTab] = useState('Todas');
  const [filterBirthdayMonthTab, setFilterBirthdayMonthTab] = useState('Todos');

  // FINANCEIRO AVANÇADO
  const [filterRefMonth, setFilterRefMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [filterSelectedStudents, setFilterSelectedStudents] = useState([]);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('Todos');

  // Formulário Manual Financeiro
  const [manualPayStudents, setManualPayStudents] = useState([]);
  const [manualPayRefMonth, setManualPayRefMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [manualPayAmount, setManualPayAmount] = useState('');
  const [manualPayMethod, setManualPayMethod] = useState('Pix');
  const [manualPayDetails, setManualPayDetails] = useState('');

  // PRESCRIÇÃO DE TREINOS & DIETA (ADMIN)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedStudentForWorkout, setSelectedStudentForWorkout] = useState(null);
  const [activeProtocol, setActiveProtocol] = useState({ title: 'Protocolo 1.0', duration_days: 60 });
  const [studentWorkoutsList, setStudentWorkoutsList] = useState([]);
  const [studentDiet, setStudentDiet] = useState({ water_target_liters: 2.5, calories_target: 2000, protein_g: 150, carbs_g: 160, fat_g: 55 });

  const [newWorkoutForm, setNewWorkoutForm] = useState({
    day_label: 'Segunda',
    observations: 'Olhar as observações de cada exercício.',
    exercises: [
      { name: '', sets: 4, reps: '10-12', load: '0kg', rest: '60s', video_url: '' }
    ]
  });

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

  // Formulários Gerais
  const [newUnitName, setNewUnitName] = useState('');
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [batchMonth, setBatchMonth] = useState(new Date().getMonth() + 1);
  
  const [paymentForm, setPaymentForm] = useState({
    method: 'Pix',
    details: '',
    amount: 0,
    refMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  });

  const [newStudent, setNewStudent] = useState({ 
    name: '', whatsapp: '', email: '', birthdate: '', gender: 'Feminino', modality: 'Presencial',
    unit: '', packtotal: 4, monthly_fee: 0, preferred_payment: 'Pix', fixed_schedule: {}, cycle_type: 'mês_vigente', due_day: 5,
    start_date: new Date().toISOString().split('T')[0], student_alert: ''
  });

  const [newSchedule, setNewSchedule] = useState({ studentid: '', date: new Date().toISOString().split('T')[0], time: '08:00', unit: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  useEffect(() => {
    fetchStudents();
    fetchSchedules();
    fetchUnits();
    fetchTransactions();
    fetchPendingApprovals();
  }, []);

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

  const fetchPendingApprovals = async () => {
    const { data } = await supabase.from('pending_approvals').select('*').eq('status', 'pending');
    if (data) setPendingApprovals(data);
  };

  // AUTENTICAÇÃO
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail.toLowerCase().includes('cris') || loginEmail.toLowerCase().includes('moderador')) {
      setUserRole('moderator');
      setCurrentUser({ email: loginEmail, name: 'Cristina Mello (Moderadora)' });
    } else {
      setUserRole('super_admin');
      setCurrentUser({ email: loginEmail || 'allandemellobenites@gmail.com', name: 'Allan Benites (Super Admin)' });
    }
  };

  // FLUXO DE APROVAÇÃO
  const handleCreatePendingAction = async (actionType, payloadDescription, payloadData) => {
    const newApproval = {
      author_email: currentUser?.email || 'moderador@masterhub.com',
      action_type: actionType,
      payload: { description: payloadDescription, data: payloadData },
      status: 'pending'
    };

    const { error } = await supabase.from('pending_approvals').insert([newApproval]);
    if (!error) {
      alert(`Ação registrada! Como você está acessando como Moderadora, a alteração foi enviada para aprovação do Allan em até 24h.`);
      fetchPendingApprovals();
    } else {
      alert('Erro ao registrar pendência: ' + error.message);
    }
  };

  const handleApproveAction = async (approval) => {
    const { action_type, payload } = approval;

    if (action_type === 'Lançamento de Pagamento') {
      await supabase.from('transactions').insert([payload.data]);
      await supabase.from('students').update({ paymentpending: false }).eq('id', payload.data.student_id);
    }

    await supabase.from('pending_approvals').update({ status: 'approved' }).eq('id', approval.id);
    alert('Ação APROVADA com sucesso!');
    fetchPendingApprovals();
    fetchTransactions();
    fetchStudents();
  };

  const handleRejectAction = async (approvalId) => {
    await supabase.from('pending_approvals').update({ status: 'rejected' }).eq('id', approvalId);
    alert('Ação recusada e removida da fila.');
    fetchPendingApprovals();
  };

  // GERENCIAMENTO DE PRESCRIÇÃO DE TREINOS (ADMIN)
  const handleOpenPrescription = async (student) => {
    setSelectedStudentForWorkout(student);
    
    // Busca treinos gravados do aluno
    const { data: workouts } = await supabase.from('protocol_workouts').select('*').eq('student_id', student.id);
    if (workouts) setStudentWorkoutsList(workouts);

    // Busca dieta/metas do aluno
    const { data: dietData } = await supabase.from('student_diets').select('*').eq('student_id', student.id).single();
    if (dietData) {
      setStudentDiet(dietData);
    } else {
      setStudentDiet({ water_target_liters: 2.5, calories_target: 2000, protein_g: 150, carbs_g: 160, fat_g: 55 });
    }

    setShowPrescriptionModal(true);
  };

  const handleAddExerciseRow = () => {
    setNewWorkoutForm({
      ...newWorkoutForm,
      exercises: [
        ...newWorkoutForm.exercises,
        { name: '', sets: 4, reps: '10-12', load: '0kg', rest: '60s', video_url: '' }
      ]
    });
  };

  const handleRemoveExerciseRow = (index) => {
    const updated = newWorkoutForm.exercises.filter((_, i) => i !== index);
    setNewWorkoutForm({ ...newWorkoutForm, exercises: updated });
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...newWorkoutForm.exercises];
    updated[index][field] = value;
    setNewWorkoutForm({ ...newWorkoutForm, exercises: updated });
  };

  const handleSaveWorkoutToStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentForWorkout) return;

    const payload = {
      student_id: selectedStudentForWorkout.id,
      day_label: newWorkoutForm.day_label,
      observations: newWorkoutForm.observations,
      exercises: newWorkoutForm.exercises
    };

    const { error } = await supabase.from('protocol_workouts').insert([payload]);
    if (error) {
      alert('Erro ao salvar ficha: ' + error.message);
    } else {
      alert(`Ficha "${newWorkoutForm.day_label}" gravada com sucesso para ${selectedStudentForWorkout.name}!`);
      const { data: workouts } = await supabase.from('protocol_workouts').select('*').eq('student_id', selectedStudentForWorkout.id);
      if (workouts) setStudentWorkoutsList(workouts);
      setNewWorkoutForm({
        day_label: 'Segunda',
        observations: 'Olhar as observações de cada exercício.',
        exercises: [{ name: '', sets: 4, reps: '10-12', load: '0kg', rest: '60s', video_url: '' }]
      });
    }
  };

  const handleDeleteWorkoutFromStudent = async (workoutId) => {
    if (window.confirm('Excluir esta ficha de treino definitivamente?')) {
      await supabase.from('protocol_workouts').delete().eq('id', workoutId);
      const { data: workouts } = await supabase.from('protocol_workouts').select('*').eq('student_id', selectedStudentForWorkout.id);
      if (workouts) setStudentWorkoutsList(workouts);
    }
  };

  const handleSaveStudentDiet = async (e) => {
    e.preventDefault();
    if (!selectedStudentForWorkout) return;

    const payload = {
      student_id: selectedStudentForWorkout.id,
      water_target_liters: Number(studentDiet.water_target_liters),
      calories_target: Number(studentDiet.calories_target),
      protein_g: Number(studentDiet.protein_g),
      carbs_g: Number(studentDiet.carbs_g),
      fat_g: Number(studentDiet.fat_g)
    };

    const { error } = await supabase.from('student_diets').upsert([payload], { onConflict: 'student_id' });
    if (error) alert('Erro ao salvar metas nutricionais: ' + error.message);
    else alert('Metas de água e macros salvas para o aluno!');
  };

  // VERIFICADOR DE ALERTA INDIVIDUAL DO ALUNO
  const checkAndShowStudentAlert = (studentId) => {
    const st = students.find(s => s.id === studentId);
    if (st && st.student_alert && st.student_alert.trim() !== '') {
      alert(`🚨 ALERTA DO ALUNO (${st.name.toUpperCase()}):\n\n"${st.student_alert}"`);
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
    const currentRef = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    setSelectedStudentForPayment(student);
    setPaymentForm({
      method: student.preferred_payment || 'Pix',
      details: '',
      amount: student.monthly_fee || 0,
      refMonth: currentRef
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentForPayment) return;

    const transactionObj = {
      id: Date.now().toString(),
      student_id: selectedStudentForPayment.id,
      student_name: selectedStudentForPayment.name,
      amount: Number(paymentForm.amount),
      payment_method: paymentForm.method,
      payment_details: paymentForm.method === 'Misto / Dividido' ? paymentForm.details : paymentForm.method,
      reference_month: paymentForm.refMonth
    };

    if (userRole === 'moderator') {
      await handleCreatePendingAction(
        'Lançamento de Pagamento',
        `Pagamento de R$ ${paymentForm.amount} para ${selectedStudentForPayment.name} (Ref: ${paymentForm.refMonth})`,
        transactionObj
      );
      setShowPaymentModal(false);
      return;
    }

    const { error: txError } = await supabase.from('transactions').insert([transactionObj]);
    if (txError) {
      alert('Erro ao registrar transação: ' + txError.message);
      return;
    }

    const { error: stError } = await supabase.from('students').update({ paymentpending: false }).eq('id', selectedStudentForPayment.id);
    if (stError) {
      alert('Erro ao atualizar status do aluno: ' + stError.message);
    } else {
      alert(`Pagamento de R$ ${paymentForm.amount} registrado para ${selectedStudentForPayment.name} (Ref: ${paymentForm.refMonth})!`);
      fetchStudents();
      fetchTransactions();
      setShowPaymentModal(false);
    }
  };

  const handleAddBatchTransactions = async (e) => {
    e.preventDefault();
    if (manualPayStudents.length === 0) {
      alert('Selecione pelo menos um aluno.');
      return;
    }
    if (!manualPayAmount || Number(manualPayAmount) <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    const newTxs = manualPayStudents.map(stId => {
      const st = students.find(s => s.id === stId);
      return {
        id: `${stId}_${Date.now()}_${Math.random()}`,
        student_id: stId,
        student_name: st ? st.name : 'Aluno',
        amount: Number(manualPayAmount),
        payment_method: manualPayMethod,
        payment_details: manualPayMethod === 'Misto / Dividido' ? manualPayDetails : manualPayMethod,
        reference_month: manualPayRefMonth
      };
    });

    if (userRole === 'moderator') {
      await handleCreatePendingAction(
        'Lançamento de Pagamento em Lote',
        `Lançamento de R$ ${manualPayAmount} para ${newTxs.length} aluno(s) (Ref: ${manualPayRefMonth})`,
        newTxs
      );
      setManualPayStudents([]);
      setManualPayAmount('');
      setManualPayDetails('');
      return;
    }

    const { error } = await supabase.from('transactions').insert(newTxs);
    if (error) {
      alert('Erro ao registrar pagamentos: ' + error.message);
    } else {
      alert(`Lançamento efetuado com sucesso para ${newTxs.length} aluno(s) referente a ${manualPayRefMonth}!`);
      setManualPayStudents([]);
      setManualPayAmount('');
      setManualPayDetails('');
      fetchTransactions();
      fetchStudents();
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Deseja cancelar/excluir este registro de pagamento?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      else fetchTransactions();
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
      (filterStatusTab === 'Inativos' && !isActive) ||
      (filterStatusTab === 'Vouchers' && (st.vouchers || 0) > 0);

    const matchModality = filterModalityTab === 'Todas' || 
      (st.modality || 'Presencial') === filterModalityTab;

    const matchBirthday = filterBirthdayMonthTab === 'Todos' ||
      (st.birthdate && parseInt(st.birthdate.split('-')[1], 10) === Number(filterBirthdayMonthTab));

    return matchText && matchStatus && matchModality && matchBirthday;
  }).sort((a, b) => {
    if (filterBirthdayMonthTab === 'Todos' && (a.birthdate || b.birthdate)) {
      const monthA = a.birthdate ? parseInt(a.birthdate.split('-')[1], 10) : 99;
      const monthB = b.birthdate ? parseInt(b.birthdate.split('-')[1], 10) : 99;
      if (monthA !== monthB) return monthA - monthB;

      const dayA = a.birthdate ? parseInt(a.birthdate.split('-')[2], 10) : 99;
      const dayB = b.birthdate ? parseInt(b.birthdate.split('-')[2], 10) : 99;
      return dayA - dayB;
    }
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
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
        preferred_payment: student.preferred_payment || 'Pix',
        fixed_schedule: parsedSchedule,
        cycle_type: student.cycle_type || 'mês_vigente',
        due_day: student.due_day || 5,
        start_date: student.start_date || formatDateYYYYMMDD(new Date()),
        student_alert: student.student_alert || ''
      });
    } else {
      setEditingStudentId(null);
      setNewStudent({ 
        name: '', whatsapp: '', email: '', birthdate: '', gender: 'Feminino', modality: 'Presencial',
        unit: defaultUnit, packtotal: 4, monthly_fee: 0, preferred_payment: 'Pix', fixed_schedule: {}, cycle_type: 'mês_vigente', due_day: 5,
        start_date: formatDateYYYYMMDD(new Date()), student_alert: ''
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
    checkAndShowStudentAlert(newSchedule.studentid);

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
    checkAndShowStudentAlert(studentId);

    const student = students.find(s => s.id === studentId);
    await supabase.from('schedules').update({ status: 'completed' }).eq('id', scheduleId);
    if (student) {
      await supabase.from('students').update({ classesdone: (student.classesdone || 0) + 1 }).eq('id', studentId);
    }
    fetchSchedules();
    fetchStudents();
  };

  const handleResetToPending = async (schedule, studentId) => {
    checkAndShowStudentAlert(studentId);

    const student = students.find(s => s.id === studentId);
    await supabase.from('schedules').update({ status: 'pending' }).eq('id', schedule.id);
    
    if (schedule.status === 'completed' && student && (student.classesdone || 0) > 0) {
      await supabase.from('students').update({ classesdone: Math.max(0, student.classesdone - 1) }).eq('id', studentId);
    }
    fetchSchedules();
    fetchStudents();
  };

  const handleOpenReschedule = (schedule) => {
    checkAndShowStudentAlert(schedule.studentid);
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
    checkAndShowStudentAlert(studentId);

    const student = students.find(s => s.id === studentId);
    const now = new Date();
    const expiry = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    const expiryStr = expiry.toLocaleDateString('pt-BR');

    await supabase.from('schedules').update({ status: 'cancelled' }).eq('id', scheduleId);
    
    if (student) {
      const updates = { vouchers: (student.vouchers || 0) + 1 };
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
    checkAndShowStudentAlert(studentId);

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

  const openWhatsApp = (phone, name, customMsg = null) => {
    const message = encodeURIComponent(customMsg || `Olá ${name}, tudo bem? Confirmando nossa aula de Personal!`);
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
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const mondayDate = new Date(tempDate);
    mondayDate.setDate(tempDate.getDate() + distanceToMonday);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
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

  // DASHBOARD RESUMO
  const todayStr = formatDateYYYYMMDD(new Date());
  const todaySchedules = schedules.filter(s => s.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));

  const currentWeekDays = getWeekDaysArray(new Date());
  const weekStartStr = currentWeekDays[0].dateStr;
  const weekEndStr = currentWeekDays[6].dateStr;
  const weekSchedulesDone = schedules.filter(s => s.date >= weekStartStr && s.date <= weekEndStr && s.status === 'completed');

  const currentMonthNum = new Date().getMonth() + 1;
  const birthdayStudents = students.filter(s => {
    if (!s.birthdate) return false;
    const m = parseInt(s.birthdate.split('-')[1], 10);
    return m === currentMonthNum;
  });

  const voucherStudents = students.filter(s => (s.vouchers || 0) > 0);

  const currentMonthRefStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTransactions = transactions.filter(t => t.reference_month === currentMonthRefStr);
  const currentMonthRevenue = currentMonthTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const activeNotifications = notifications.filter(n => !n.completed);

  // NAVEGAÇÕES DOS WIDGETS
  const goToActiveStudents = () => {
    setFilterStatusTab('Ativos');
    setFilterBirthdayMonthTab('Todos');
    setActiveTab('alunos');
  };

  const goToBirthdayStudents = () => {
    setFilterStatusTab('Todos');
    setFilterBirthdayMonthTab('Todos');
    setActiveTab('alunos');
  };

  const goToFinanceTab = () => {
    setActiveTab('financeiro');
  };

  const goToVouchers = () => {
    setFilterStatusTab('Vouchers');
    setFilterBirthdayMonthTab('Todos');
    setActiveTab('alunos');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchMonth = filterRefMonth === 'Todos' || !filterRefMonth ? true : (t.reference_month === filterRefMonth);
    const matchStudents = filterSelectedStudents.length === 0 ? true : filterSelectedStudents.includes(t.student_id);
    const matchMethod = filterPaymentMethod === 'Todos' ? true : t.payment_method === filterPaymentMethod;
    return matchMonth && matchStudents && matchMethod;
  });

  const totalFilteredRevenue = filteredTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);

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

  // TELA DE LOGIN UNIFICADA
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div 
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
          }}
        />
        <div className="w-full max-w-sm bg-[#0e1422]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-800/80 text-center relative z-10">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-blue-500/30">
            ⚡
          </div>
          <h1 className="text-2xl font-black mb-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Personal Master Hub</h1>
          <p className="text-slate-400 text-xs mb-6 font-medium">Acesso Unificado • Admin & Alunos</p>
          
          <form onSubmit={handleLogin} className="space-y-3">
            <input 
              type="email" 
              placeholder="Digite seu E-mail" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#080b13] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
            <input 
              type="password" 
              placeholder="Digite sua Senha" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#080b13] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition text-sm">
              Entrar no Painel
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            <p>Dica de teste:</p>
            <p>Digite qualquer e-mail com <strong>cris</strong> para modo Moderadora.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 pb-24 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* EFEITO LANTERNA */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.12), transparent 80%)`
        }}
      />

      {/* HEADER FIXO */}
      <header className="bg-[#0b0f1a]/80 backdrop-blur-md text-white p-4 sticky top-0 z-40 border-b border-slate-800/80 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
            MH
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Personal Master Hub</h1>
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
              {userRole === 'super_admin' ? '👑 Super Admin' : '🛡️ Moderador (Cris)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowNotificationModal(true)} 
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1"
          >
            🔔 + Criar Lembrete
          </button>
          <button 
            onClick={() => setCurrentUser(null)} 
            className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 transition font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-5 relative z-10">

        {/* ALERTA / CENTRAL DE APROVAÇÕES PENDENTES (SUPER ADMIN) */}
        {userRole === 'super_admin' && pendingApprovals.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-600/60 p-4 rounded-3xl shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-amber-800/50 pb-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span>📩</span> Central de Moderação (Alterações da Cris para Aprovar)
              </h3>
              <span className="text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full">
                {pendingApprovals.length} Pendente(s)
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingApprovals.map(appr => (
                <div key={appr.id} className="p-3 bg-[#080c16] rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{appr.action_type}</span>
                    <span className="text-slate-400 text-[11px]">{appr.payload?.description}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Enviado por: {appr.author_email}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveAction(appr)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow transition"
                    >
                      ✓ Aceitar
                    </button>
                    <button 
                      onClick={() => handleRejectAction(appr.id)}
                      className="bg-rose-950 text-rose-400 border border-rose-800/50 hover:bg-rose-900 font-bold px-2.5 py-1.5 rounded-xl text-xs transition"
                    >
                      ✕ Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA RESUMO */}
        {activeTab === 'resumo' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Olá, {currentUser.name.split(' ')[0]} 👋</h2>
                <p className="text-xs text-slate-400 font-medium">Aqui está o panorama geral do seu consultório e agenda hoje.</p>
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-inner">
                PRO • Ativo
              </span>
            </div>

            {/* KPIS PRINCIPAIS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                onClick={goToActiveStudents}
                className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-1 relative overflow-hidden group hover:border-blue-500 cursor-pointer transition"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clientes Ativos ➔</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">{activeStudents.length}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">Ver Alunos</span>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('agenda')}
                className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-1 relative overflow-hidden group hover:border-indigo-500 cursor-pointer transition"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aulas na Semana ➔</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-indigo-400">{weekSchedulesDone.length}</span>
                  <span className="text-[10px] font-medium text-slate-400">Ver Agenda</span>
                </div>
              </div>

              <div 
                onClick={goToFinanceTab}
                className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-1 relative overflow-hidden group hover:border-emerald-500 cursor-pointer transition"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita no Mês ➔</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-400">R$ {currentMonthRevenue.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] font-bold text-emerald-400">Financeiro</span>
                </div>
              </div>

              <div 
                onClick={goToVouchers}
                className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-1 relative overflow-hidden group hover:border-amber-500 cursor-pointer transition"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vouchers Pendentes ➔</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-400">{voucherStudents.reduce((acc, s) => acc + (s.vouchers || 0), 0)}</span>
                  <span className="text-[10px] font-medium text-slate-400">Ver Lista</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO CENTRAL DE WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="md:col-span-2 space-y-4">
                {/* WIDGET: CENTRAL DE NOTIFICAÇÕES */}
                <div className="bg-[#0e1422]/90 backdrop-blur-md p-5 rounded-3xl border border-blue-800/50 shadow-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔔</span>
                      <h3 className="text-sm font-bold text-white">Lembretes & Tarefas com Expiração</h3>
                    </div>
                    <button 
                      onClick={() => setShowNotificationModal(true)} 
                      className="text-[11px] font-bold text-blue-400 hover:underline"
                    >
                      + Novo
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeNotifications.map(n => {
                      const st = students.find(s => s.id === n.student_id);
                      const isExpiredToday = n.expiry_date === todayStr;

                      return (
                        <div key={n.id} className={`p-3 rounded-2xl border bg-[#080c16] flex justify-between items-center text-xs shadow-md transition ${isExpiredToday ? 'border-amber-500 bg-amber-950/20' : 'border-slate-800/80'}`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{n.title}</span>
                              {st && <span className="bg-blue-950 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-blue-800/40">{st.name}</span>}
                              {isExpiredToday && <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">ÚLTIMO DIA (EXPIRA HOJE)</span>}
                            </div>
                            {n.description && <p className="text-slate-400">{n.description}</p>}
                            <div className="flex gap-3 text-[10px] text-slate-500 font-semibold">
                              <span>📅 Data: {n.date.split('-').reverse().join('/')} {n.is_full_day ? '(Dia Inteiro)' : `às ${n.time}`}</span>
                              {n.expiry_date && <span>⏳ Expira em: {n.expiry_date.split('-').reverse().join('/')}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => toggleNotificationComplete(n.id)} 
                              className="bg-emerald-600/90 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition shadow"
                            >
                              ✓ Concluir
                            </button>
                            <button 
                              onClick={() => deleteNotification(n.id)} 
                              className="text-rose-400 hover:text-rose-300 font-bold p-1 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {activeNotifications.length === 0 && (
                      <p className="text-center text-slate-500 text-xs py-4">Nenhuma notificação ou lembrete pendente.</p>
                    )}
                  </div>
                </div>

                {/* CARD: ATENDIMENTOS DE HOJE */}
                <div className="bg-[#0e1422]/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                      <h3 className="text-sm font-bold text-white tracking-wide">Agenda de Hoje</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {todaySchedules.map(sc => (
                      <div key={sc.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#080c16] border border-slate-800/80 hover:border-blue-600/50 transition">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-400">{sc.time}</span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">{sc.unit}</span>
                          </div>
                          <p className="text-sm font-bold text-white">{sc.studentname}</p>
                        </div>
                        <div>
                          {sc.status === 'completed' ? (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-xl">✓ Concluída</span>
                          ) : (
                            <button 
                              onClick={() => handleCheckIn(sc.id, sc.studentid)}
                              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl shadow-lg shadow-blue-600/20 transition"
                            >
                              Check-in
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {todaySchedules.length === 0 && (
                      <div className="text-center py-10 space-y-2">
                        <span className="text-3xl block">☕</span>
                        <p className="text-xs font-medium text-slate-400">Nenhum atendimento agendado para hoje.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD LATERAL: ANIVERSARIANTES & REPOSIÇÕES */}
              <div className="space-y-4">
                <div 
                  onClick={goToBirthdayStudents}
                  className="bg-[#0e1422]/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-3 cursor-pointer hover:border-blue-500/50 transition"
                >
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      🎉 Aniversariantes ➔
                    </h3>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded-lg">Ver por Mês</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {birthdayStudents.map(st => (
                      <div key={st.id} className="flex justify-between items-center p-2 rounded-xl bg-[#080c16] border border-slate-800/60 text-xs">
                        <div>
                          <p className="font-bold text-white">{st.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {st.birthdate ? `${st.birthdate.split('-')[2]}/${st.birthdate.split('-')[1]}` : ''}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openWhatsApp(st.whatsapp, st.name, `Parabéns ${st.name}! Desejo um feliz aniversário, muita saúde e foco nos treinos! 🎉💪`);
                          }} 
                          className="text-emerald-400 font-bold hover:underline text-[10px]"
                        >
                          Parabenizar
                        </button>
                      </div>
                    ))}
                    {birthdayStudents.length === 0 && (
                      <p className="text-center text-xs text-slate-500 py-4">Sem aniversariantes neste mês. Clique para ver todos os meses.</p>
                    )}
                  </div>
                </div>

                <div 
                  onClick={goToVouchers}
                  className="bg-[#0e1422]/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-3 cursor-pointer hover:border-amber-500/50 transition"
                >
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">🔄 Reposições Pendentes ➔</h3>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {voucherStudents.map(st => (
                      <div key={st.id} className="flex justify-between items-center p-2 rounded-xl bg-[#080c16] border border-slate-800/60 text-xs">
                        <span className="font-bold text-white">{st.name}</span>
                        <span className="font-black text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-lg">
                          {st.vouchers} Voucher(s)
                        </span>
                      </div>
                    ))}
                    {voucherStudents.length === 0 && (
                      <p className="text-center text-xs text-slate-500 py-4">Nenhuma reposição pendente.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* AGENDA MASTER */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-white">Agenda Master</h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setShowBatchModal(true)}
                  className="bg-amber-600/90 hover:bg-amber-500 text-white px-3 py-2 rounded-2xl text-xs font-bold shadow-lg transition flex items-center gap-1"
                >
                  ⚡ Gerar / Limpar Mês
                </button>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition"
                >
                  + Agendar
                </button>
              </div>
            </div>

            <div className="bg-[#0e1422]/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800/80 shadow-xl space-y-2.5">
              <input 
                type="text" 
                placeholder="🔍 Buscar aluno na agenda..." 
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Unidade</label>
                  <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white">
                    <option value="Todas">Todas Unidades</option>
                    {activeUnitsList.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Turno</label>
                  <select value={filterTurn} onChange={e => setFilterTurn(e.target.value)} className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white">
                    <option value="Todos">Todos Turnos</option>
                    <option value="Manhã">Manhã (05h-12h)</option>
                    <option value="Tarde">Tarde (12h-18h)</option>
                    <option value="Noite">Noite (18h-23h)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1422]/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
              <div className="flex justify-between items-center bg-[#080c16] p-1 rounded-2xl border border-slate-800/60">
                <button 
                  onClick={() => setCalendarView('dia')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${calendarView === 'dia' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setCalendarView('semana')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${calendarView === 'semana' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setCalendarView('mes')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${calendarView === 'mes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Mês
                </button>
              </div>

              <div className="flex justify-between items-center px-1">
                <button onClick={() => navigateDate(-1)} className="p-2 bg-[#080c16] hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 border border-slate-800">◀ Anterior</button>
                <span className="text-xs font-bold text-white">
                  {calendarView === 'dia' && currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  {calendarView === 'semana' && `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                  {calendarView === 'mes' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </span>
                <button onClick={() => navigateDate(1)} className="p-2 bg-[#080c16] hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 border border-slate-800">Próximo ▶</button>
              </div>
            </div>

            {/* VISÃO DIA */}
            {calendarView === 'dia' && (
              <div className="space-y-3 max-w-lg mx-auto">
                {filteredSchedules
                  .filter(s => s.date === formatDateYYYYMMDD(currentDate))
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((s) => {
                    const delayed = isDelayed(s.date, s.time, s.status);
                    const st = students.find(stObj => stObj.id === s.studentid);

                    return (
                      <div key={s.id} className={`p-4 rounded-3xl bg-[#0e1422]/90 backdrop-blur-md border shadow-xl space-y-3 relative ${delayed ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800/80'}`}>
                        {s.isbonus && (
                          <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-2xl shadow">
                            5ª Sem. Bônus
                          </span>
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-blue-400 uppercase">{s.time} • {s.unit}</span>
                            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                              {s.studentname}
                              {st?.student_alert && (
                                <button 
                                  onClick={() => alert(`🚨 ALERTA DE ${st.name.toUpperCase()}:\n\n"${st.student_alert}"`)}
                                  className="text-xs bg-rose-950 text-rose-400 border border-rose-800/50 px-2 py-0.5 rounded-lg font-bold"
                                >
                                  ⚠️ Alerta
                                </button>
                              )}
                            </h3>
                            <span className="text-xs text-slate-400">{s.date}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {s.status === 'completed' && <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-xs font-bold px-2.5 py-1 rounded-full">Realizada</span>}
                            {s.status === 'cancelled' && <span className="bg-amber-950/60 text-amber-400 border border-amber-800/50 text-xs font-bold px-2.5 py-1 rounded-full">Reagendada</span>}
                            {s.status === 'no-show' && <span className="bg-rose-950/60 text-rose-400 border border-rose-800/50 text-xs font-bold px-2.5 py-1 rounded-full">Falta (&lt;12h)</span>}
                            {s.status === 'pending' && !delayed && <span className="bg-blue-950/60 text-blue-400 border border-blue-800/50 text-xs font-bold px-2.5 py-1 rounded-full">Pendente</span>}
                            {delayed && <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">Atrasado (+15m)</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                          {s.status !== 'completed' ? (
                            <button onClick={() => handleCheckIn(s.id, s.studentid)} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-2xl text-xs font-bold shadow-md transition">
                              ✓ Check-in
                            </button>
                          ) : (
                            <button onClick={() => handleResetToPending(s, s.studentid)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-2xl text-xs font-bold transition">
                              ↩ Voltar a Pendente
                            </button>
                          )}
                          
                          <button onClick={() => handleOpenReschedule(s)} className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-2xl text-xs font-bold transition">
                            📅 Mudar Data/Hora
                          </button>
                          
                          <button onClick={() => handleRescheduleLater(s.id, s.studentid, s.status)} className="bg-amber-600 hover:bg-amber-500 text-white py-2 px-3 rounded-2xl text-xs font-bold transition">
                            ↺ Reagendar (Voucher)
                          </button>
                          
                          <button onClick={() => handleNoShow(s.id, s.studentid, s.status)} className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-3 rounded-2xl text-xs font-bold transition">
                            ✕ Falta (&lt;12h)
                          </button>
                        </div>

                        <div className="text-right pt-1">
                          <button onClick={() => handleDeleteSchedule(s.id)} className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold underline">
                            🗑️ Excluir Agendamento
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {filteredSchedules.filter(s => s.date === formatDateYYYYMMDD(currentDate)).length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">Nenhum agendamento para este dia.</p>
                )}
              </div>
            )}

            {/* VISÃO SEMANA */}
            {calendarView === 'semana' && (
              <div className="bg-[#0e1422]/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800/80 shadow-xl overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[1000px]">
                  {getWeekDaysArray(currentDate).map((wDay) => {
                    const daySchedules = filteredSchedules
                      .filter(s => s.date === wDay.dateStr)
                      .sort((a, b) => a.time.localeCompare(b.time));

                    const isToday = wDay.dateStr === formatDateYYYYMMDD(new Date());

                    return (
                      <div 
                        key={wDay.dateStr} 
                        className={`border rounded-2xl p-2 min-h-[380px] flex flex-col justify-start space-y-2 ${isToday ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800/80 bg-[#080c16]/50'}`}
                      >
                        <div className={`text-center py-1.5 rounded-xl ${isToday ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'bg-slate-900 text-slate-300 font-semibold'}`}>
                          <span className="text-[11px] uppercase block">{wDay.dayLabel}</span>
                          <span className="text-sm font-extrabold">{wDay.dayNumber}</span>
                        </div>

                        <div className="space-y-2 overflow-y-auto">
                          {daySchedules.map(sc => (
                            <div 
                              key={sc.id} 
                              onClick={() => {
                                setCurrentDate(new Date(`${sc.date}T00:00:00`));
                                setCalendarView('dia');
                              }}
                              className={`p-2 rounded-xl border text-xs shadow-md cursor-pointer transition ${sc.status === 'completed' ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' : 'bg-[#0e1422] border-slate-800 text-slate-200 hover:border-blue-500'}`}
                            >
                              <div className="flex justify-between items-center font-bold text-blue-400 text-[11px]">
                                <span>{sc.time}</span>
                                {sc.status === 'completed' && <span className="text-emerald-400">✓</span>}
                              </div>
                              <div className="font-bold text-white mt-1 leading-snug">{sc.studentname}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{sc.unit}</div>
                            </div>
                          ))}
                          {daySchedules.length === 0 && (
                            <div className="text-center text-xs text-slate-600 py-6 font-medium">Sem aulas</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VISÃO MÊS */}
            {calendarView === 'mes' && (
              <div className="bg-[#0e1422]/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800/80 shadow-xl space-y-2">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                  <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonthGrid(currentDate).map((d, index) => {
                    if (!d) return <div key={index} className="h-20 bg-[#080c16]/30 rounded-xl"></div>;
                    
                    const daySchedules = filteredSchedules.filter(s => s.date === d.dateStr);
                    const isToday = d.dateStr === formatDateYYYYMMDD(new Date());

                    return (
                      <div 
                        key={d.dateStr} 
                        onClick={() => {
                          setCurrentDate(new Date(`${d.dateStr}T00:00:00`));
                          setCalendarView('dia');
                        }}
                        className={`h-20 border rounded-xl p-1 text-[9px] overflow-hidden cursor-pointer flex flex-col justify-between transition ${isToday ? 'border-blue-500 bg-blue-950/30' : 'border-slate-800/60 bg-[#080c16] hover:border-slate-700'}`}
                      >
                        <span className={`font-bold ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>{d.day}</span>
                        <div className="space-y-0.5 overflow-y-auto">
                          {daySchedules.map(st => (
                            <div 
                              key={st.id} 
                              className={`px-1 py-0.5 rounded text-[8px] truncate font-semibold ${st.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-blue-950 text-blue-300 border border-blue-800/40'}`}
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

        {/* ALUNOS & ANIVERSARIANTES */}
        {activeTab === 'alunos' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Alunos & Vouchers</h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  <span className="text-blue-400 font-bold">{students.length}</span> Cadastrados • <span className="text-emerald-400 font-bold">{students.filter(s => s.active ?? true).length}</span> Ativos
                </p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setShowUnitsModal(true)} className="bg-slate-800 text-slate-200 p-2.5 rounded-2xl text-xs font-semibold border border-slate-700 hover:bg-slate-700 transition">
                  ⚙️ Unidades
                </button>
                <button onClick={() => handleOpenStudentModal()} className="bg-blue-600 text-white p-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition">
                  + Cadastrar
                </button>
              </div>
            </div>

            <div className="bg-[#0e1422]/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800/80 shadow-xl space-y-2.5">
              <input 
                type="text" 
                placeholder="🔍 Pesquisar por nome ou WhatsApp..." 
                value={searchStudentTab} 
                onChange={e => setSearchStudentTab(e.target.value)} 
                className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500" 
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Status</label>
                  <select 
                    value={filterStatusTab} 
                    onChange={e => setFilterStatusTab(e.target.value)} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-medium"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Ativos">Ativos</option>
                    <option value="Inativos">Inativos</option>
                    <option value="Vouchers">Com Vouchers</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Modalidade</label>
                  <select 
                    value={filterModalityTab} 
                    onChange={e => setFilterModalityTab(e.target.value)} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-medium"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Consultoria">Consultoria</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Mês Aniversário</label>
                  <select 
                    value={filterBirthdayMonthTab} 
                    onChange={e => setFilterBirthdayMonthTab(e.target.value)} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-medium"
                  >
                    <option value="Todos">Ano Inteiro (Jan-Dez)</option>
                    <option value="1">01 - Janeiro</option>
                    <option value="2">02 - Fevereiro</option>
                    <option value="3">03 - Março</option>
                    <option value="4">04 - Abril</option>
                    <option value="5">05 - Maio</option>
                    <option value="6">06 - Junho</option>
                    <option value="7">07 - Julho</option>
                    <option value="8">08 - Agosto</option>
                    <option value="9">09 - Setembro</option>
                    <option value="10">10 - Outubro</option>
                    <option value="11">11 - Novembro</option>
                    <option value="12">12 - Dezembro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredStudentsTab.map(st => {
                const isActive = st.active ?? true;
                const currentMonthRef = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                const hasPaidCurrentMonth = transactions.some(t => t.student_id === st.id && t.reference_month === currentMonthRef);

                return (
                  <div key={st.id} className={`p-4 bg-[#0e1422]/90 backdrop-blur-md rounded-3xl border shadow-xl space-y-3 ${!isActive ? 'opacity-50 border-slate-800' : 'border-slate-800/80 hover:border-slate-700'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{st.name}</h3>
                          {!isActive && <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md">Inativo</span>}
                          {st.modality && (
                            <span className="bg-blue-950 text-blue-400 border border-blue-800/50 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              {st.modality}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{st.unit} • {st.whatsapp}</p>
                        <p className="text-[10px] text-blue-400 font-bold mt-0.5">
                          🎂 Aniversário: {st.birthdate ? `${st.birthdate.split('-')[2]}/${st.birthdate.split('-')[1]}` : 'Não informado'}
                        </p>
                        {st.student_alert && (
                          <p className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-800/50 p-2 rounded-xl mt-1.5">
                            🚨 Alerta: "{st.student_alert}"
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <button 
                          onClick={() => handleTogglePaymentStatusDirect(st)}
                          className={`text-xs font-bold px-3 py-1 rounded-full border transition ${!hasPaidCurrentMonth ? 'bg-rose-950/60 text-rose-400 border-rose-800/50' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'}`}
                        >
                          {!hasPaidCurrentMonth ? 'Pendente Mês Atual' : 'Em Dia (Quitado)'}
                        </button>

                        <button 
                          onClick={() => handleOpenPrescription(st)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow transition flex items-center gap-1"
                        >
                          🏋️ Prescrever Treinos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#080c16] p-3 rounded-2xl border border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Aulas no Mês</span>
                        <span className="text-sm font-bold text-white">
                          {st.packtotal === 0 ? 'Consultoria' : `${st.classesdone || 0} / ${st.packtotal} feitas`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Vouchers</span>
                        <span className="text-sm font-bold text-amber-400">{st.vouchers || 0} Reposições</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex gap-3">
                        <button onClick={() => handleOpenStudentModal(st)} className="text-slate-400 font-semibold hover:text-white transition">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleToggleActive(st)} className="text-amber-400 font-semibold hover:text-amber-300 transition">
                          {isActive ? '⏸️ Desativar' : '▶️ Ativar'}
                        </button>
                        <button onClick={() => handleDeleteStudent(st.id)} className="text-rose-400 font-semibold hover:text-rose-300 transition">
                          🗑️ Excluir
                        </button>
                      </div>
                      <button onClick={() => openWhatsApp(st.whatsapp, st.name)} className="text-xs text-emerald-400 font-semibold border border-emerald-800/50 bg-emerald-950/40 py-1 px-3 rounded-xl hover:bg-emerald-900/50 transition">
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredStudentsTab.length === 0 && (
                <p className="text-center text-slate-500 py-8 text-sm">Nenhum aluno encontrado.</p>
              )}
            </div>
          </div>
        )}

        {/* PAINEL FINANCEIRO */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Painel Financeiro & Lançamentos</h2>
              <span className="text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-3 py-1 rounded-full">
                {activeStudents.length} Alunos Ativos
              </span>
            </div>

            <div className="bg-[#0e1422]/90 backdrop-blur-md p-4 rounded-3xl border border-blue-800/50 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">➕ Lançar / Registrar Pagamento Manual</h3>
              <form onSubmit={handleAddBatchTransactions} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Selecione o(s) Aluno(s) <span className="text-slate-500 font-normal">(Segure Ctrl/Cmd para múltiplos)</span>
                  </label>
                  <select 
                    multiple 
                    required 
                    value={manualPayStudents} 
                    onChange={e => setManualPayStudents(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white min-h-[90px]"
                  >
                    {activeStudents.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} (Base: R$ {st.monthly_fee || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Mês Ref.</label>
                    <input 
                      required 
                      type="month" 
                      value={manualPayRefMonth} 
                      onChange={e => setManualPayRefMonth(e.target.value)} 
                      className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs font-bold text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Valor Pago (R$)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      placeholder="Ex: 450" 
                      value={manualPayAmount} 
                      onChange={e => setManualPayAmount(e.target.value)} 
                      className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs font-bold text-emerald-400" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Método</label>
                    <select 
                      value={manualPayMethod} 
                      onChange={e => setManualPayMethod(e.target.value)} 
                      className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs font-bold text-white"
                    >
                      {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                {manualPayMethod === 'Misto / Dividido' && (
                  <div>
                    <input 
                      type="text" 
                      placeholder="Detalhamento da divisão (ex: R$ 200 Pix + R$ 200 Cartão)" 
                      value={manualPayDetails} 
                      onChange={e => setManualPayDetails(e.target.value)} 
                      className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white" 
                    />
                  </div>
                )}

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition">
                  ✓ Confirmar Lançamento do Pagamento
                </button>
              </form>
            </div>

            <div className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">🔍 Filtro Mês a Mês & Multi-Aluno</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Mês de Referência</label>
                  <input 
                    type="month" 
                    value={filterRefMonth === 'Todos' ? '' : filterRefMonth} 
                    onChange={e => setFilterRefMonth(e.target.value || 'Todos')} 
                    className="w-full p-1.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs font-bold text-white" 
                  />
                  <button onClick={() => setFilterRefMonth('Todos')} className="text-[9px] text-blue-400 underline font-semibold mt-0.5">Limpar Mês</button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Forma de Pagamento</label>
                  <select 
                    value={filterPaymentMethod} 
                    onChange={e => setFilterPaymentMethod(e.target.value)} 
                    className="w-full p-1.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs font-semibold text-white"
                  >
                    <option value="Todos">Todas Formas</option>
                    {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Alunos Selecionados</label>
                  <select 
                    multiple 
                    value={filterSelectedStudents} 
                    onChange={e => setFilterSelectedStudents(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full p-1 bg-[#080c16] border border-slate-800 rounded-xl text-[10px] max-h-16 text-white"
                  >
                    {students.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                  {filterSelectedStudents.length > 0 && (
                    <button onClick={() => setFilterSelectedStudents([])} className="text-[9px] text-rose-400 underline font-semibold block mt-0.5">Limpar Seleção</button>
                  )}
                </div>
              </div>

              <div className="bg-[#080c16] p-3 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">Total Quitado (Filtro Atual)</span>
                  <span className="text-xl font-extrabold text-white">R$ {totalFilteredRevenue.toLocaleString('pt-BR')}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{filteredTransactions.length} Registro(s)</span>
              </div>
            </div>

            <div className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Histórico de Pagamentos Recebidos</h3>
              
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-2.5 bg-[#080c16] rounded-2xl border border-slate-800/60 text-xs">
                    <div>
                      <span className="font-bold text-white block">{tx.student_name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Ref: <strong>{tx.reference_month}</strong> • {tx.payment_method}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-emerald-400 text-sm">R$ {Number(tx.amount || 0).toLocaleString('pt-BR')}</span>
                      <button onClick={() => handleDeleteTransaction(tx.id)} className="text-rose-400 hover:text-rose-300 font-bold text-xs">🗑️</button>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="text-center text-slate-500 py-6 text-xs">Nenhum pagamento registrado.</p>
                )}
              </div>
            </div>

            <div className="bg-[#0e1422]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chave Pix para Cobrança</h3>
              <form onSubmit={handleSavePix} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Cole sua chave Pix (E-mail, CPF...)" 
                  value={pixKey} 
                  onChange={e => setPixKey(e.target.value)} 
                  className="flex-1 p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white" 
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-2xl text-xs font-bold transition">Salvar</button>
              </form>
              <button onClick={copyPix} className="w-full py-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-2xl text-xs font-bold hover:bg-emerald-900/50 transition">
                📋 Copiar Chave Pix
              </button>
            </div>
          </div>
        )}

        {/* PROSPECÇÃO & MARKETING */}
        {activeTab === 'marketing' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Prospecção & Marketing</h2>
                <p className="text-xs text-slate-400">Feriados Nacionais & Regionais com Registro de Ofertaços</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-3 py-1 rounded-full">
                🚀 Ofertômetro
              </span>
            </div>

            <div className="space-y-3">
              {DATAS_MARKETING_INICIAL.map((item) => {
                const metrics = campaignData[item.id] || {};
                const hasMetrics = !!metrics.startDate;

                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setSelectedCampaign(item);
                      setCampaignStartDate(metrics.startDate || new Date().toISOString().split('T')[0]);
                      setCampaignRevenue(metrics.revenue || '');
                    }}
                    className={`bg-[#0e1422]/90 backdrop-blur-md p-4 rounded-3xl border shadow-xl space-y-2.5 cursor-pointer transition ${hasMetrics ? 'border-emerald-600/80 bg-emerald-950/10' : 'border-slate-800/80 hover:border-blue-500/50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-xl">
                          {item.data}
                        </span>
                        <h3 className="font-bold text-white text-sm">{item.nome}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.tipo === 'Promocional' ? 'bg-amber-950/60 text-amber-400 border-amber-800/50' : item.tipo === 'Feriado Regional' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {item.tipo}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      🎯 <strong>Público:</strong> {item.publico}
                    </p>

                    <div className="bg-[#080c16] p-3 rounded-2xl border border-slate-800/60 space-y-1.5">
                      <p className="text-xs text-amber-300 font-semibold">💡 Estratégia de Ação:</p>
                      <p className="text-xs text-slate-300">{item.ideia}</p>
                    </div>

                    <div className="pt-1 flex justify-between items-center text-xs">
                      {hasMetrics ? (
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-1 rounded-xl">
                            Início: {metrics.startDate.split('-').reverse().join('/')}
                          </span>
                          <span className="text-white font-extrabold bg-blue-950/80 border border-blue-800/50 px-2.5 py-1 rounded-xl">
                            Faturamento: R$ {Number(metrics.revenue).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Clique para registrar início da oferta e faturamento ➔</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MODAL PRESCRIÇÃO DE TREINOS & DIETA (ADMIN) */}
      {showPrescriptionModal && selectedStudentForWorkout && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">🏋️ Prescrever Treino & Metas</h3>
                <p className="text-xs text-indigo-400 font-bold">Aluno: {selectedStudentForWorkout.name}</p>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            {/* FICHAS JÁ GRAVADAS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fichas de Treino Ativas ({studentWorkoutsList.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {studentWorkoutsList.map(w => (
                  <div key={w.id} className="p-3 bg-[#080c16] rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{w.day_label}</span>
                      <span className="text-slate-400 text-[10px]">{w.exercises?.length || 0} exercícios cadastrados</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteWorkoutFromStudent(w.id)}
                      className="text-rose-400 font-bold text-xs hover:underline"
                    >
                      🗑️ Remover Ficha
                    </button>
                  </div>
                ))}
                {studentWorkoutsList.length === 0 && (
                  <p className="text-slate-500 text-xs py-2 italic">Nenhuma ficha criada para este aluno ainda.</p>
                )}
              </div>
            </div>

            {/* FORMULÁRIO DE NOVA FICHA */}
            <form onSubmit={handleSaveWorkoutToStudent} className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">+ Adicionar Nova Ficha de Treino</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Dia / Título da Ficha</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Segunda ou Treino A - Peito" 
                    value={newWorkoutForm.day_label} 
                    onChange={e => setNewWorkoutForm({ ...newWorkoutForm, day_label: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Observações Gerais</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Olhar observações de cada ex." 
                    value={newWorkoutForm.observations} 
                    onChange={e => setNewWorkoutForm({ ...newWorkoutForm, observations: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white" 
                  />
                </div>
              </div>

              {/* LISTA DE EXERCÍCIOS DA FICHA */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-300 uppercase">Exercícios da Ficha</label>
                  <button 
                    type="button" 
                    onClick={handleAddExerciseRow} 
                    className="text-[10px] font-bold text-blue-400 underline"
                  >
                    + Exercício
                  </button>
                </div>

                {newWorkoutForm.exercises.map((ex, idx) => (
                  <div key={idx} className="p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl space-y-2 text-xs">
                    <div className="flex gap-2">
                      <input 
                        required 
                        type="text" 
                        placeholder="Nome do Exercício (ex: Hack Squat)" 
                        value={ex.name} 
                        onChange={e => handleExerciseChange(idx, 'name', e.target.value)} 
                        className="flex-1 p-2 bg-[#0e1422] border border-slate-800 rounded-xl text-xs text-white font-bold" 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveExerciseRow(idx)} 
                        className="text-rose-400 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <div>
                        <label className="text-[9px] text-slate-400 block">Séries</label>
                        <input 
                          type="number" 
                          value={ex.sets} 
                          onChange={e => handleExerciseChange(idx, 'sets', e.target.value)} 
                          className="w-full p-1.5 bg-[#0e1422] border border-slate-800 rounded-lg text-center text-xs text-white font-bold" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block">Reps</label>
                        <input 
                          type="text" 
                          value={ex.reps} 
                          onChange={e => handleExerciseChange(idx, 'reps', e.target.value)} 
                          className="w-full p-1.5 bg-[#0e1422] border border-slate-800 rounded-lg text-center text-xs text-white font-bold" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block">Carga Alvo</label>
                        <input 
                          type="text" 
                          value={ex.load} 
                          onChange={e => handleExerciseChange(idx, 'load', e.target.value)} 
                          className="w-full p-1.5 bg-[#0e1422] border border-slate-800 rounded-lg text-center text-xs text-emerald-400 font-bold" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block">Vídeo URL</label>
                        <input 
                          type="text" 
                          placeholder="Link" 
                          value={ex.video_url} 
                          onChange={e => handleExerciseChange(idx, 'video_url', e.target.value)} 
                          className="w-full p-1.5 bg-[#0e1422] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition">
                ✓ Salvar Ficha de Treino para o Aluno
              </button>
            </form>

            {/* SEÇÃO METAS / DIETA */}
            <form onSubmit={handleSaveStudentDiet} className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🥗 Metas de Água & Macronutrientes (Dieta)</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Meta de Água (L/dia)</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={studentDiet.water_target_liters} 
                    onChange={e => setStudentDiet({ ...studentDiet, water_target_liters: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Calorias Alvo (kcal)</label>
                  <input 
                    type="number" 
                    value={studentDiet.calories_target} 
                    onChange={e => setStudentDiet({ ...studentDiet, calories_target: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-blue-400 block mb-1">Proteínas (g)</label>
                  <input 
                    type="number" 
                    value={studentDiet.protein_g} 
                    onChange={e => setStudentDiet({ ...studentDiet, protein_g: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-amber-400 block mb-1">Carbos (g)</label>
                  <input 
                    type="number" 
                    value={studentDiet.carbs_g} 
                    onChange={e => setStudentDiet({ ...studentDiet, carbs_g: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-rose-400 block mb-1">Gordura (g)</label>
                  <input 
                    type="number" 
                    value={studentDiet.fat_g} 
                    onChange={e => setStudentDiet({ ...studentDiet, fat_g: e.target.value })} 
                    className="w-full p-2 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white font-bold" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition">
                ✓ Atualizar Metas de Água/Macros
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOTIFICAÇÕES */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">🔔 Criar Notificação / Lembrete</h3>
            <form onSubmit={saveNotification} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Título do Lembrete</label>
                <input required type="text" placeholder="Ex: Mandar mensagem de boas-vindas" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descrição / Observação</label>
                <textarea placeholder="Detalhes da tarefa..." value={newNotice.description} onChange={e => setNewNotice({...newNotice, description: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Vincular a um Aluno (Opcional)</label>
                <select value={newNotice.student_id} onChange={e => setNewNotice({...newNotice, student_id: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white">
                  <option value="">Nenhum (Lembrete Geral)</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data da Notificação</label>
                  <input type="date" value={newNotice.date} onChange={e => setNewNotice({...newNotice, date: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Horário</label>
                  <input type="time" disabled={newNotice.is_full_day} value={newNotice.time} onChange={e => setNewNotice({...newNotice, time: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white disabled:opacity-30" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="fullDayCheck" checked={newNotice.is_full_day} onChange={e => setNewNotice({...newNotice, is_full_day: e.target.checked})} className="rounded" />
                <label htmlFor="fullDayCheck" className="text-xs text-slate-300 font-semibold">Marcar como Dia Inteiro</label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Data para Expirar / Prazo Final</label>
                <input type="date" value={newNotice.expiry_date} onChange={e => setNewNotice({...newNotice, expiry_date: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white" />
                <span className="text-[10px] text-slate-500 font-medium">Opcional. Destaca alerta de "Último Dia" na data de expiração.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowNotificationModal(false)} className="w-1/2 py-2.5 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30">Criar Lembrete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MARKETING */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">🚀 Lançar / Registrar Ofertaço</h3>
            <p className="text-xs text-slate-400">Ação para <strong>{selectedCampaign.nome}</strong></p>

            <form onSubmit={saveCampaignMetrics} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Data Início da Oferta</label>
                <input required type="date" value={campaignStartDate} onChange={e => setCampaignStartDate(e.target.value)} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Faturamento Obtido (R$)</label>
                <input type="number" step="0.01" placeholder="Ex: 1500" value={campaignRevenue} onChange={e => setCampaignRevenue(e.target.value)} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-emerald-400" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedCampaign(null)} className="w-1/2 py-2.5 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-sm font-bold shadow-lg">Salvar Métrica</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGAMENTO */}
      {showPaymentModal && selectedStudentForPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Dar Baixa em Mensalidade</h3>
            <p className="text-xs text-slate-400">Registrar pagamento de <strong>{selectedStudentForPayment.name}</strong></p>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mês de Referência</label>
                <input required type="month" value={paymentForm.refMonth} onChange={e => setPaymentForm({...paymentForm, refMonth: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Valor Pago (R$)</label>
                <input required type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-emerald-400" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Forma de Pagamento Utilizada</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-white">
                  {FORMAS_PAGAMENTO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {paymentForm.method === 'Misto / Dividido' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Detalhamento da Divisão</label>
                  <input required type="text" placeholder="Ex: R$ 200 Pix + R$ 300 Cartão Crédito" value={paymentForm.details} onChange={e => setPaymentForm({...paymentForm, details: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="w-1/2 py-2.5 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/30">Confirmar Baixa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AULAS EM LOTE */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">⚡ Gerar ou Limpar Mês</h3>
            <p className="text-xs text-slate-400">Gere automaticamente as aulas do mês com base na grade fixa ou limpe os agendamentos do mês selecionado.</p>

            <form onSubmit={handleGenerateBatchSchedules} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mês</label>
                  <select value={batchMonth} onChange={e => setBatchMonth(Number(e.target.value))} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-white">
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
                  <label className="text-xs font-bold text-slate-300 block mb-1">Ano</label>
                  <input type="number" value={batchYear} onChange={e => setBatchYear(Number(e.target.value))} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-center text-white" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-sm font-bold shadow-lg">
                  ⚡ Gerar Aulas do Mês
                </button>
                <button type="button" onClick={handleClearMonthSchedules} className="w-full py-2.5 bg-rose-950/60 text-rose-400 border border-rose-800/50 rounded-2xl text-xs font-bold">
                  🗑️ Limpar Todos Agendamentos Deste Mês
                </button>
                <button type="button" onClick={() => setShowBatchModal(false)} className="w-full py-2 border border-slate-800 rounded-2xl text-xs font-bold text-slate-500">
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UNIDADES */}
      {showUnitsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Gerenciar Unidades</h3>
              <button onClick={() => setShowUnitsModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUnit} className="flex gap-2">
              <input required type="text" placeholder="Nova Unidade (ex: EC Moinhos)" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} className="flex-1 p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              <button type="submit" className="bg-blue-600 text-white px-3.5 rounded-2xl text-xs font-bold">+ Adicionar</button>
            </form>

            <div className="space-y-2 pt-2">
              {units.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl">
                  <span className={`text-sm font-bold ${!u.active ? 'line-through text-slate-500' : 'text-slate-200'}`}>{u.name}</span>
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => handleToggleUnitActive(u)} className={u.active ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {u.active ? 'Pausar' : 'Ativar'}
                    </button>
                    <button onClick={() => handleDeleteUnit(u.id)} className="text-rose-400 font-bold">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR/EDITAR ALUNO */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{editingStudentId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome</label>
                <input required type="text" placeholder="Nome Completo" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">🚨 Alerta do Aluno (Ex: Lesão no joelho, Acomodação)</label>
                <input type="text" placeholder="Aviso importante ao clicar no aluno" value={newStudent.student_alert} onChange={e => setNewStudent({...newStudent, student_alert: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-rose-800/60 rounded-2xl text-xs font-bold text-rose-300" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">E-mail</label>
                <input required type="email" placeholder="email@exemplo.com" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Telefone (WhatsApp)</label>
                <input required type="tel" placeholder="+55 (51) 99999-9999" value={newStudent.whatsapp} onChange={e => setNewStudent({...newStudent, whatsapp: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data Início Contrato</label>
                  <input required type="date" value={newStudent.start_date} onChange={e => setNewStudent({...newStudent, start_date: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs font-bold text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Data Nascimento</label>
                  <input required type="date" value={newStudent.birthdate} onChange={e => setNewStudent({...newStudent, birthdate: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs font-bold text-white" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Sexo</label>
                <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white">
                  {SEXO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Turmas / Modalidade</label>
                <div className="flex gap-2">
                  {MODALIDADES.map(m => {
                    const selected = newStudent.modality === m;
                    return (
                      <button 
                        type="button" 
                        key={m} 
                        onClick={() => handleModalityChange(m)}
                        className={`flex-1 py-2 text-xs font-bold rounded-2xl border transition ${selected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-[#080c16] text-slate-400 border-slate-800'}`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Pacote Contratado</label>
                  <select value={newStudent.packtotal} onChange={e => setNewStudent({...newStudent, packtotal: Number(e.target.value)})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-xs text-white">
                    {PACK_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor Mensal (R$)</label>
                  <input required type="number" step="0.01" placeholder="Ex: 500" value={newStudent.monthly_fee} onChange={e => setNewStudent({...newStudent, monthly_fee: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-emerald-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Forma de Pagamento Preferencial</label>
                <select value={newStudent.preferred_payment} onChange={e => setNewStudent({...newStudent, preferred_payment: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm font-bold text-white">
                  {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Unidade Principal</label>
                {newStudent.modality === 'Consultoria' ? (
                  <input type="text" readOnly value="Sem Unidade / Online" className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-slate-500 italic" />
                ) : (
                  <select value={newStudent.unit} onChange={e => setNewStudent({...newStudent, unit: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white">
                    {activeUnitsList.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                )}
              </div>

              {newStudent.modality !== 'Consultoria' && (
                <div className="space-y-2 border-t border-slate-800 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">Grade Fixa (Selecione o Dia e o Horário)</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {DIAS_SEMANA.map(d => {
                      const isSelected = !!newStudent.fixed_schedule[d.label];
                      return (
                        <div key={d.id} className="flex items-center gap-2 bg-[#080c16] p-2 rounded-2xl border border-slate-800">
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
                            className={`px-3 py-1 text-xs font-bold rounded-xl border transition ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
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
                              className="p-1 border border-slate-800 rounded-xl text-xs bg-[#0e1422] font-bold text-white"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Dia Vencimento</label>
                <input type="number" min="1" max="31" value={newStudent.due_day} onChange={e => setNewStudent({...newStudent, due_day: Number(e.target.value)})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowStudentModal(false)} className="w-1/2 py-2.5 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGENDAMENTO */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Novo Agendamento</h3>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <select required value={newSchedule.studentid} onChange={e => setNewSchedule({...newSchedule, studentid: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white">
                <option value="">Selecione o Aluno</option>
                {students.filter(s => s.active ?? true).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input required type="date" value={newSchedule.date} onChange={e => setNewSchedule({...newSchedule, date: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              <input required type="time" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              <select value={newSchedule.unit} onChange={e => setNewSchedule({...newSchedule, unit: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white">
                {activeUnitsList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="w-1/2 py-2.5 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REAGENDAMENTO */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-3xl p-5 w-full max-w-sm space-y-4 border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Remanejar ou Desmarcar</h3>
            <p className="text-xs text-slate-400">Escolha uma nova data para <strong>{selectedSchedule?.studentname}</strong> ou libere o horário gerando um voucher.</p>

            <form onSubmit={handleSaveReschedule} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nova Data</label>
                <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Novo Horário</label>
                <input type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full p-2.5 bg-[#080c16] border border-slate-800 rounded-2xl text-sm text-white" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg">
                Confirmar Nova Data
              </button>
            </form>

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <button 
                type="button" 
                onClick={() => handleRescheduleLater(selectedSchedule.id, selectedSchedule.studentid, selectedSchedule.status)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold shadow-lg"
              >
                ↺ Reagendar Depois (Gerar Voucher)
              </button>
              <button type="button" onClick={() => setShowRescheduleModal(false)} className="w-full py-2 border border-slate-800 rounded-2xl text-xs font-bold text-slate-500">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO FIXA INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0b0f1a]/90 backdrop-blur-md border-t border-slate-800/80 p-2.5 z-40 flex justify-around">
        <button 
          onClick={() => setActiveTab('resumo')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'resumo' ? 'text-blue-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'}`}
        >
          📊 <span className="text-[10px]">Resumo</span>
        </button>
        <button 
          onClick={() => setActiveTab('agenda')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'agenda' ? 'text-blue-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'}`}
        >
          📅 <span className="text-[10px]">Agenda</span>
        </button>
        <button 
          onClick={() => setActiveTab('alunos')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'alunos' ? 'text-blue-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'}`}
        >
          👥 <span className="text-[10px]">Alunos</span>
        </button>
        <button 
          onClick={() => setActiveTab('financeiro')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'financeiro' ? 'text-blue-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'}`}
        >
          💲 <span className="text-[10px]">Financeiro</span>
        </button>
        <button 
          onClick={() => setActiveTab('marketing')} 
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'marketing' ? 'text-amber-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'}`}
        >
          🚀 <span className="text-[10px]">Marketing</span>
        </button>
      </nav>
    </div>
  );
}
