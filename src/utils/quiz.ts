import type { QuizQuestion } from '../types/profile';

export function quizScore(questions: QuizQuestion[], answers: number[]) {
  return answers.reduce(
    (score, answer, index) =>
      score + Number(questions[index]?.answer === answer),
    0,
  );
}
