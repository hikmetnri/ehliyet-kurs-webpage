import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, FileText, Star } from 'lucide-react';
import api from '../api';

const ExamArea = ({ isQuickTest = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorite_questions') || '[]'));

  // Mock data fallback handler
  const loadMockExam = () => {
    setExam({ _id: id, title: 'Mock Exam', duration: 45 });
    setQuestions([
      {
        _id: 'q1',
        description: 'Trafikte öncelik hakkı kimindir?',
        options: [
          { text: 'Büyük araçların', isCorrect: false },
          { text: 'Hızlı gidenlerin', isCorrect: false },
          { text: 'Yaya ve geçiş üstünlüğü olan araçların', isCorrect: true },
          { text: 'Pahalı arabaların', isCorrect: false },
        ]
      },
      {
        _id: 'q2',
        description: 'Kırmızı ışıkta durmadan geçmenin cezası hangisidir?',
        options: [
          { text: 'İdari para cezası ve ehliyet puanı düşürülmesi', isCorrect: true },
          { text: 'Hiçbir cezası yoktur', isCorrect: false },
          { text: 'Sadece sözlü uyarı', isCorrect: false },
          { text: 'Ehliyete el konulması (ilk ihlalde)', isCorrect: false },
        ]
      }
    ]);
  };

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        if (id.startsWith('mock')) {
          loadMockExam();
          setLoading(false);
          return;
        }

        if (isQuickTest) {
          try {
            const catRes = await api.get(`/categories/${id}`);
            setExam(catRes.data.data || catRes.data);
          } catch (e) {
            setExam({ _id: id, title: 'Hızlı Test', duration: 20 });
          }
        } else {
          // Fetch Exam info
          try {
            const examRes = await api.get(`/exams/${id}`);
            if (examRes.data) {
              setExam(examRes.data);
            }
          } catch (e) {
            // If the backend doesn't have an individual GET /exams/:id route yet
            setExam({ _id: id, title: 'Deneme Sınavı', duration: 45 });
          }
        }

        // Fetch Questions
        const qUrl = isQuickTest ? `/questions?category=${id}` : `/questions?examId=${id}`;
        const qRes = await api.get(qUrl);
        if (qRes.data && Array.isArray(qRes.data)) {
            // Need to map the backend 'text' to frontend 'description'
            // and adapt options structure
            const mappedQuestions = qRes.data.map(q => ({
                _id: q._id,
                description: q.text,
                imageUrl: q.media,
                options: q.options.map((opt, i) => ({
                    text: opt,
                    isCorrect: q.correctAnswer === i
                }))
            }));
            setQuestions(mappedQuestions);
        } else if (qRes.data && qRes.data.data) {
             const mappedQuestions = qRes.data.data.map(q => ({
                _id: q._id,
                description: q.text,
                imageUrl: q.media,
                options: q.options.map((opt, i) => ({
                    text: opt,
                    isCorrect: q.correctAnswer === i
                }))
            }));
            setQuestions(mappedQuestions);
        }

      } catch (err) {
        console.error('Failed to load exam', err);
        loadMockExam();
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [id]);

  const handleSelectOption = (qId, oIndex) => {
    if (isFinished) return; // Prevent changing answer after finish
    setAnswers(prev => ({ ...prev, [qId]: oIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleFavorite = (question) => {
    let newFavs;
    const isFav = favorites.some(f => f.id === question._id);
    
    if (isFav) {
      newFavs = favorites.filter(f => f.id !== question._id);
    } else {
      newFavs = [...favorites, {
        id: question._id,
        text: question.description,
        correctAnswerText: question.options.find(o => o.isCorrect)?.text,
        examId: id,
        category: exam?.title || 'Genel'
      }];
    }
    
    setFavorites(newFavs);
    localStorage.setItem('favorite_questions', JSON.stringify(newFavs));
  };

  const handleFinish = async () => {
    setIsFinished(true);
    
    // Calculate stats
    let correctCount = 0;
    let wrongCount = 0;
    const wrongQuestionsList = [];

    questions.forEach(q => {
      const selectedIdx = answers[q._id];
      const isCorrect = selectedIdx !== undefined && q.options[selectedIdx]?.isCorrect;
      
      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
        wrongQuestionsList.push({
          questionId: q._id,
          questionText: q.description,
          userAnswer: selectedIdx,
          correctAnswer: q.options.findIndex(opt => opt.isCorrect),
          options: q.options.map(opt => opt.text),
          explanation: q.explanation || ''
        });
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= 70;

    // Send to backend
    try {
      await Promise.all([
        // Save the overall exam result
        api.post('/exam-results', {
          examId: exam._id,
          examName: exam.name || exam.title,
          totalQuestions: questions.length,
          correctCount: correctCount,
          wrongCount: wrongCount,
          score: Math.round(score),
          passed: passed,
          wrongQuestions: wrongQuestionsList,
          testType: isQuickTest ? 'short_test' : 'exam'
        }),
        // Also save to "Mistakes" (WrongAnswer) collection for tracking
        api.post('/wrong-answers/bulk', {
          wrongQuestions: wrongQuestionsList,
          correctQuestionIds: questions
            .filter(q => answers[q._id] !== undefined && q.options[answers[q._id]]?.isCorrect)
            .map(q => q._id),
          testType: isQuickTest ? 'short_test' : 'exam'
        })
      ]);
      console.log('Result and mistakes saved successfully');
    } catch (e) {
      console.error("Could not save result/mistakes to API:", e);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}>Sınav yükleniyor...</div>;
  if (!exam || questions.length === 0) return <div>Soru bulunamadı.</div>;

  const currentQ = questions[currentIndex];
  // Calculate letters dynamically
  const letters = ['A', 'B', 'C', 'D'];

  if (isFinished) {
    let corr = 0;
    questions.forEach(q => {
      if (answers[q._id] !== undefined && q.options[answers[q._id]]?.isCorrect) corr++;
    });

    return (
      <div className="solver-container animate-fade-in text-center">
        <div className="glass-panel" style={{ padding: '60px 40px' }}>
          <CheckCircle size={80} color="var(--secondary)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Sınavı Tamamladınız!</h2>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: 40 }}>Sonucunuz sisteme kaydedildi ve analizlerinize eklendi.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--secondary)' }}>{corr}</div>
              <div className="text-muted">Doğru</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#ef4444' }}>{questions.length - corr}</div>
              <div className="text-muted">Yanlış / Boş</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '16px 40px' }}>
            Panele Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="solver-container animate-fade-in">
      <div className="question-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} /> Soru {currentIndex + 1} / {questions.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => toggleFavorite(currentQ)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: favorites.some(f => f.id === currentQ._id) ? '#fbbf24' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Star size={20} fill={favorites.some(f => f.id === currentQ._id) ? '#fbbf24' : 'none'} />
            <span style={{ fontSize: '0.8rem' }}>Favorilere Ekle</span>
          </button>
          <span style={{ color: 'var(--primary)' }}>
            {answers[currentQ._id] !== undefined ? 'Cevaplandı' : 'Bekliyor'}
          </span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h3 className="question-text">{currentQ.description}</h3>
        {currentQ.imageUrl && <img src={currentQ.imageUrl} alt="Soru Görseli" className="question-image" />}

        <div className="options-list">
          {currentQ.options.map((option, idx) => {
            const isSelected = answers[currentQ._id] === idx;
            return (
              <button 
                key={idx} 
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(currentQ._id, idx)}
              >
                <span className="option-letter">{letters[idx]}</span>
                <span style={{ flex: 1, lineHeight: 1.5 }}>{option.text || option.optionText}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="solver-footer">
        <button 
          className="btn btn-outline" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={18} /> Önceki
        </button>

        {currentIndex === questions.length - 1 ? (
          <button className="btn btn-primary" style={{ background: 'var(--secondary)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }} onClick={handleFinish}>
            Sınavı Bitir <CheckCircle size={18} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            Sonraki <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamArea;
