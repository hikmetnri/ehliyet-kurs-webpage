import React from 'react';
import {
  Loader2, Search, Plus, X, Check,
  BookOpen, RotateCcw,
  Hash, Activity, AlignLeft,
  Image as ImageIcon,
  Trash2, FilePlus, Edit3, RefreshCw,
  FileText, Save,
} from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { QUESTION_DIFFICULTY_META, optionLabel, getQuestionPerformance } from './contentHelpers';
import { DifficultyPill } from './contentUiParts';

export const TopicQuestionCard = ({ question, index, active, onEdit, onDuplicate, onDelete }) => {
  const performance = getQuestionPerformance(question);

  return (
    <div className={`group rounded-2xl border transition-all ${active ? 'border-accent/40 bg-accent/10 shadow-lg shadow-accent/5' : 'border-white/10 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.025]'}`}>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {question.media ? (
            <button
              type="button"
              onClick={() => onEdit(question)}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30 hover:scale-105 transition-transform"
              title="Soruyu düzenle"
            >
              <img src={resolveMediaUrl(question.media)} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEdit(question)}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              title="Soruyu düzenle"
            >
              {index + 1}
            </button>
          )}

          <button type="button" onClick={() => onEdit(question)} className="min-w-0 flex-1 text-left">
            <p className="break-words text-sm font-bold leading-relaxed text-white">{question.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DifficultyPill difficulty={question.difficulty} />
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                {question.options?.length || 0} Şık
              </span>
              {performance.rate !== null && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${performance.rate >= 50 ? 'border-success/20 bg-success/10 text-success' : 'border-danger/20 bg-danger/10 text-danger'}`}>
                  %{performance.rate} Başarı
                </span>
              )}
              {question.media && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-light">
                  <ImageIcon className="h-2.5 w-2.5" /> Görselli
                </span>
              )}
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => onEdit(question)} title="Düzenle" className="rounded-lg p-2 text-text-muted hover:bg-primary/20 hover:text-primary-light transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDuplicate(question)} title="Kopyala" className="rounded-lg p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors">
              <FilePlus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDelete(question._id)} title="Sil" className="rounded-lg p-2 text-text-muted hover:bg-danger/20 hover:text-danger transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(question.options || []).map((option, i) => {
            const isCorrect = i === question.correctAnswer;
            return (
              <div key={`${question._id}-${i}`} className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${isCorrect ? 'border-success/30 bg-success/10 text-success' : 'border-white/10 bg-black/10 text-text-secondary hover:bg-black/20'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${isCorrect ? 'bg-success text-white' : 'bg-white/10 text-white/40'}`}>
                  {optionLabel(i)}
                </span>
                <span className="min-w-0 flex-1 break-words leading-snug">{option}</span>
                {isCorrect && <Check className="h-3.5 w-3.5 shrink-0" />}
              </div>
            );
          })}
        </div>

        {question.explanation && (
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-xs leading-relaxed text-primary-light">
            {question.explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export const TopicQuestionEditor = ({
  selectedCat,
  form,
  editingQuestionId,
  saving,
  onSubmit,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onReset,
}) => (
  <form onSubmit={onSubmit} className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-sm">
    <div className="shrink-0 border-b border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">{selectedCat?.name}</p>
          <h3 className="mt-1 truncate text-base font-bold text-white">
            {editingQuestionId ? 'Soruyu Düzenle' : 'Yeni Kısa Test Sorusu'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-xl border border-white/10 p-2 text-text-muted transition-all hover:bg-white/5 hover:text-white"
          title="Yeni soru"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar">
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <FileText className="h-3.5 w-3.5 text-accent" /> Soru Metni
        </label>
        <textarea
          rows={4}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium leading-relaxed text-white outline-none transition-all placeholder:text-white/30 focus:border-accent/50 focus:bg-transparent"
          placeholder="Soruyu buraya yazın..."
          value={form.text}
          onChange={e => onChange('text', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <ImageIcon className="h-3.5 w-3.5 text-accent" /> Görsel Yolu
        </label>
        <input
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-white outline-none transition-all placeholder:text-white/30 focus:border-accent/50 focus:bg-transparent"
          placeholder="assets/signs/... veya https://..."
          value={form.media}
          onChange={e => onChange('media', e.target.value)}
        />
        {form.media && (
          <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <img src={resolveMediaUrl(form.media)} alt="Soru görseli" className="max-h-full max-w-full object-contain p-2" />
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <Hash className="h-3.5 w-3.5 text-accent" /> Şıklar
          </label>
          {form.options.length < 6 && (
            <button type="button" onClick={onAddOption} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-accent hover:bg-accent/10 hover:text-white">
              <Plus className="h-3.5 w-3.5" /> Şık Ekle
            </button>
          )}
        </div>
        <div className="space-y-2">
          {form.options.map((option, i) => {
            const isCorrect = form.correctAnswer === i;
            return (
              <div key={i} className={`flex items-center gap-2 rounded-2xl border p-2.5 transition-all ${isCorrect ? 'border-success/40 bg-success/5' : 'border-white/10 bg-white/[0.015]'}`}>
                <button
                  type="button"
                  onClick={() => onChange('correctAnswer', i)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${isCorrect ? 'bg-success text-white shadow-md shadow-success/10' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                  title="Doğru cevap"
                >
                  {isCorrect ? <Check className="h-4 w-4" /> : optionLabel(i)}
                </button>
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  placeholder={`${optionLabel(i)} şıkkı`}
                  value={option}
                  onChange={e => onOptionChange(i, e.target.value)}
                />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => onRemoveOption(i)} className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger" title="Şıkkı sil">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <Activity className="h-3.5 w-3.5 text-accent" /> Zorluk
        </label>
        <div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">
          {Object.entries(QUESTION_DIFFICULTY_META).map(([value, meta]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('difficulty', value)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${form.difficulty === value ? `${meta.active} shadow-lg` : 'text-text-muted hover:text-white'}`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <AlignLeft className="h-3.5 w-3.5 text-accent" /> Açıklama
        </label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium leading-relaxed text-white outline-none transition-all placeholder:text-white/30 focus:border-accent/50 focus:bg-transparent"
          placeholder="Doğru cevabın kısa açıklaması..."
          value={form.explanation}
          onChange={e => onChange('explanation', e.target.value)}
        />
      </div>
    </div>

    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 p-4">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-text-muted transition-all hover:bg-white/5 hover:text-white"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Temizle
      </button>
      <button
        type="submit"
        disabled={saving || !form.text.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-accent/10 hover:bg-accent/90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {editingQuestionId ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  </form>
);

export const TopicQuestionsWorkspace = ({
  selectedCat,
  questions,
  visibleQuestions,
  loadingQuestions,
  search,
  difficultyFilter,
  editingQuestionId,
  questionForm,
  questionSaving,
  onSearchChange,
  onDifficultyFilterChange,
  onRefresh,
  onNewQuestion,
  onEditQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onQuestionSubmit,
  onQuestionFormChange,
  onQuestionOptionChange,
  onQuestionAddOption,
  onQuestionRemoveOption,
}) => {
  const counts = {
    all: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black/10 p-3 sm:p-4 custom-scrollbar">
      <div className="grid min-h-full grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-sm">
          <div className="shrink-0 border-b border-white/10 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Konu Sonu Testi</p>
                <h3 className="mt-1 truncate text-lg font-bold text-white">{selectedCat?.name}</h3>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-text-muted transition-all hover:bg-white/10 hover:text-white"
                  title="Soruları yenile"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingQuestions ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={onNewQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-accent/10 hover:bg-accent/90 transition-all"
                >
                  <Plus className="h-4 w-4" /> Yeni Soru
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                ['all', 'Toplam', counts.all],
                ['easy', 'Kolay', counts.easy],
                ['medium', 'Orta', counts.medium],
                ['hard', 'Zor', counts.hard],
              ].map(([key, label, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onDifficultyFilterChange(key)}
                  className={`rounded-2xl border px-3 py-2 text-left transition-all ${difficultyFilter === key ? 'border-accent/40 bg-accent/15' : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
                  <p className="mt-1 text-lg font-bold text-white">{value}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:border-accent/50 focus-within:bg-transparent transition-all">
              <Search className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                placeholder="Soru, şık veya açıklama ara..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => onSearchChange('')} className="rounded-lg p-1 text-text-muted hover:bg-white/10 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
              </div>
            ) : visibleQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] py-16 text-center">
                <BookOpen className="mb-3 h-10 w-10 text-white/10" />
                <p className="text-sm font-bold text-text-secondary">
                  {questions.length === 0 ? 'Bu konuya henüz kısa test sorusu eklenmemiş.' : 'Filtreyle eşleşen soru bulunamadı.'}
                </p>
                <button type="button" onClick={onNewQuestion} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent/20 border border-accent/30 px-4 py-2.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all">
                  <Plus className="h-4 w-4" /> Soru Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleQuestions.map((question, index) => (
                  <TopicQuestionCard
                    key={question._id}
                    question={question}
                    index={index}
                    active={editingQuestionId === question._id}
                    onEdit={onEditQuestion}
                    onDuplicate={onDuplicateQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="2xl:sticky 2xl:top-0">
            <TopicQuestionEditor
              selectedCat={selectedCat}
              form={questionForm}
              editingQuestionId={editingQuestionId}
              saving={questionSaving}
              onSubmit={onQuestionSubmit}
              onChange={onQuestionFormChange}
              onOptionChange={onQuestionOptionChange}
              onAddOption={onQuestionAddOption}
              onRemoveOption={onQuestionRemoveOption}
              onReset={onNewQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
