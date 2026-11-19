import { useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferences } from '../../contexts/preferences';
import type { QuizQuestion } from '../../types/profile';
import { readPreference, savePreference } from '../../utils/storage';
import { quizScore } from '../../utils/quiz';

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const { t } = usePreferences();
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const scoreKey =
    'hub-quiz-' +
    JSON.stringify(questions.map(({ prompt, answer }) => [prompt.zh, answer]));
  const [best, setBest] = useState(() => Number(readPreference(scoreKey)) || 0);
  const selected = answers[step];
  const question = questions[step];
  const score = quizScore(questions, answers);
  const { localize } = usePreferences();
  function go(next: number) {
    if (next === questions.length && score > best) {
      setBest(score);
      savePreference(scoreKey, String(score));
    }
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  return (
    <div className="panel quiz-card">
      {step === -1 ? (
        <>
          <p>{t('quizIntro')}</p>
          <button className="button primary" onClick={() => go(0)}>
            {t('start')} <ArrowRight size={17} aria-hidden="true" />
          </button>
        </>
      ) : question ? (
        <>
          <div className="quiz-progress">
            <progress
              aria-label={t('quiz')}
              max={questions.length}
              value={step + 1}
            />
            <span>
              {step + 1} / {questions.length}
            </span>
          </div>
          <h3 ref={heading} tabIndex={-1}>
            {localize(question.prompt)}
          </h3>
          <div
            className="quiz-choices"
            role="group"
            aria-label={localize(question.prompt)}
          >
            {question.options.map((option, index) => {
              const correct =
                selected !== undefined && index === question.answer;
              const wrong = selected === index && !correct;
              return (
                <button
                  className={
                    'button answer' +
                    (correct ? ' correct' : wrong ? ' wrong' : '')
                  }
                  key={option}
                  aria-disabled={selected !== undefined}
                  aria-pressed={selected === index}
                  onClick={() => {
                    if (selected === undefined)
                      setAnswers((previous) =>
                        previous.length === step
                          ? [...previous, index]
                          : previous,
                      );
                  }}
                >
                  <span className="answer-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {correct && <Check size={18} aria-hidden="true" />}
                  {wrong && <X size={18} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <p role="status" className="quiz-feedback">
            {selected !== undefined &&
              (selected === question.answer
                ? t('correct')
                : t('incorrect') + ' · ' + question.options[question.answer])}
          </p>
          {selected !== undefined && (
            <button className="button primary" onClick={() => go(step + 1)}>
              {t(step + 1 === questions.length ? 'results' : 'next')}{' '}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          )}
        </>
      ) : (
        <motion.div
          className="quiz-result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Sparkles aria-hidden="true" />
          <h3 ref={heading} tabIndex={-1}>
            {t('score')} · {score}/{questions.length}
          </h3>
          <p>
            {t(
              score === questions.length
                ? 'perfect'
                : score * 2 >= questions.length
                  ? 'good'
                  : 'tryAgain',
            )}
          </p>
          <p className="muted">
            {t('high')} · {best}/{questions.length}
          </p>
          <button
            className="button primary"
            onClick={() => {
              setAnswers([]);
              go(0);
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {t('restart')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
