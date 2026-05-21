"use client";

import {
  ImagePlus,
  ListChecks,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Trophy,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AdminTab = "questions" | "backgrounds" | "rewardCodes";
type GameLevel = 1 | 2 | 3 | 4 | 5;

type AdminAnswer = {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
};

type AdminQuestion = {
  id: string;
  content: string;
  explanation: string | null;
  imageUrl: string | null;
  level: GameLevel;
  answers: AdminAnswer[];
};

type BackgroundImage = {
  id: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
};

type RewardCode = {
  id: string;
  code: string;
  createdAt: string;
};

type QuestionFormAnswer = {
  id?: string;
  content: string;
  isCorrect: boolean;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

const levels: GameLevel[] = [1, 2, 3, 4, 5];
const emptyAnswers = (): QuestionFormAnswer[] =>
  Array.from({ length: 4 }, () => ({ content: "", isCorrect: false }));

const initialQuestionForm = {
  level: 1 as GameLevel,
  content: "",
  explanation: "",
  imageUrl: "",
  answers: emptyAnswers().map((answer, index) => ({
    ...answer,
    isCorrect: index === 0,
  })),
};

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload.data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("questions");
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
  const [rewardCodes, setRewardCodes] = useState<RewardCode[]>([]);
  const [questionForm, setQuestionForm] = useState(initialQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [backgroundForm, setBackgroundForm] = useState({
    imageUrl: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [isSavingBackground, setIsSavingBackground] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questionsByLevel = useMemo(
    () =>
      levels.map((level) => ({
        level,
        questions: questions.filter((question) => question.level === level),
      })),
    [questions],
  );

  async function refreshQuestions() {
    const data = await fetchJson<AdminQuestion[]>("/api/admin/questions");
    setQuestions(data);
  }

  async function refreshBackgrounds() {
    const data = await fetchJson<BackgroundImage[]>("/api/admin/backgrounds");
    setBackgrounds(data);
  }

  async function refreshRewardCodes() {
    const data = await fetchJson<RewardCode[]>(
      "/api/admin/reward-codes?limit=200",
    );
    setRewardCodes(data);
  }

  async function refreshAll() {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        refreshQuestions(),
        refreshBackgrounds(),
        refreshRewardCodes(),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải dữ liệu admin.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchJson<AdminQuestion[]>("/api/admin/questions"),
      fetchJson<BackgroundImage[]>("/api/admin/backgrounds"),
      fetchJson<RewardCode[]>("/api/admin/reward-codes?limit=200"),
    ])
      .then(([questionData, backgroundData, rewardCodeData]) => {
        if (!isMounted) {
          return;
        }

        setQuestions(questionData);
        setBackgrounds(backgroundData);
        setRewardCodes(rewardCodeData);
      })
      .catch((requestError) => {
        if (!isMounted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể tải dữ liệu admin.",
        );
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function resetQuestionForm() {
    setQuestionForm(initialQuestionForm);
    setEditingQuestionId(null);
  }

  function editQuestion(question: AdminQuestion) {
    const normalizedAnswers = emptyAnswers().map((answer, index) => {
      const existingAnswer = question.answers[index];

      if (!existingAnswer) {
        return answer;
      }

      return {
        id: existingAnswer.id,
        content: existingAnswer.content,
        isCorrect: existingAnswer.isCorrect,
      };
    });

    const hasCorrectAnswer = normalizedAnswers.some((answer) => answer.isCorrect);

    setQuestionForm({
      level: question.level,
      content: question.content,
      explanation: question.explanation ?? "",
      imageUrl: question.imageUrl ?? "",
      answers: hasCorrectAnswer
        ? normalizedAnswers
        : normalizedAnswers.map((answer, index) => ({
            ...answer,
            isCorrect: index === 0,
          })),
    });
    setEditingQuestionId(question.id);
    setActiveTab("questions");
    setMessage("Đang chỉnh sửa câu hỏi đã chọn.");
  }

  function updateAnswerContent(index: number, content: string) {
    setQuestionForm((current) => ({
      ...current,
      answers: current.answers.map((answer, answerIndex) =>
        answerIndex === index ? { ...answer, content } : answer,
      ),
    }));
  }

  function selectCorrectAnswer(index: number) {
    setQuestionForm((current) => ({
      ...current,
      answers: current.answers.map((answer, answerIndex) => ({
        ...answer,
        isCorrect: answerIndex === index,
      })),
    }));
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const answers = questionForm.answers.map((answer) => ({
      ...answer,
      content: answer.content.trim(),
    }));

    if (!questionForm.content.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    if (answers.some((answer) => !answer.content)) {
      setError("Vui lòng nhập đủ 4 đáp án.");
      return;
    }

    if (!answers.some((answer) => answer.isCorrect)) {
      setError("Vui lòng chọn một đáp án đúng.");
      return;
    }

    setIsSavingQuestion(true);

    try {
      if (!editingQuestionId) {
        await fetchJson<AdminQuestion>("/api/admin/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: questionForm.content.trim(),
            explanation: questionForm.explanation.trim() || null,
            level: questionForm.level,
            imageUrl: questionForm.imageUrl.trim() || null,
            answers: answers.map(({ content, isCorrect }) => ({
              content,
              isCorrect,
            })),
          }),
        });
      } else {
        const currentQuestion = questions.find(
          (question) => question.id === editingQuestionId,
        );
        const answerIdsKept = new Set(
          answers.flatMap((answer) => (answer.id ? [answer.id] : [])),
        );

        await fetchJson<AdminQuestion>(`/api/admin/questions/${editingQuestionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: questionForm.content.trim(),
            explanation: questionForm.explanation.trim() || null,
            level: questionForm.level,
            imageUrl: questionForm.imageUrl.trim() || null,
          }),
        });

        await Promise.all(
          answers.map((answer) => {
            if (answer.id) {
              return fetchJson<AdminAnswer>(`/api/admin/answers/${answer.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                }),
              });
            }

            return fetchJson<AdminAnswer>(
              `/api/admin/questions/${editingQuestionId}/answers`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                }),
              },
            );
          }),
        );

        const extraAnswers =
          currentQuestion?.answers.filter((answer) => !answerIdsKept.has(answer.id)) ??
          [];

        await Promise.all(
          extraAnswers.map((answer) =>
            fetchJson<{ id: string }>(`/api/admin/answers/${answer.id}`, {
              method: "DELETE",
            }),
          ),
        );
      }

      await refreshQuestions();
      resetQuestionForm();
      setMessage(
        editingQuestionId
          ? "Đã cập nhật câu hỏi và đáp án."
          : "Đã tạo câu hỏi mới.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể lưu câu hỏi.",
      );
    } finally {
      setIsSavingQuestion(false);
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!window.confirm("Xóa câu hỏi này và toàn bộ đáp án liên quan?")) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await fetchJson<{ id: string }>(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });
      await refreshQuestions();
      setMessage("Đã xóa câu hỏi.");

      if (editingQuestionId === questionId) {
        resetQuestionForm();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể xóa câu hỏi.",
      );
    }
  }

  async function saveBackground(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!backgroundForm.imageUrl.trim()) {
      setError("Vui lòng nhập link ảnh background.");
      return;
    }

    setIsSavingBackground(true);

    try {
      await fetchJson<BackgroundImage>("/api/admin/backgrounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: backgroundForm.imageUrl.trim(),
          isActive: backgroundForm.isActive,
        }),
      });
      setBackgroundForm({ imageUrl: "", isActive: true });
      await refreshBackgrounds();
      setMessage("Đã thêm ảnh background.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể thêm background.",
      );
    } finally {
      setIsSavingBackground(false);
    }
  }

  async function toggleBackground(background: BackgroundImage) {
    setError(null);
    setMessage(null);

    try {
      await fetchJson<BackgroundImage>(`/api/admin/backgrounds/${background.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !background.isActive,
        }),
      });
      await refreshBackgrounds();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật background.",
      );
    }
  }

  async function deleteBackground(backgroundId: string) {
    if (!window.confirm("Xóa ảnh background này?")) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await fetchJson<{ id: string }>(`/api/admin/backgrounds/${backgroundId}`, {
        method: "DELETE",
      });
      await refreshBackgrounds();
      setMessage("Đã xóa background.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể xóa background.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#071a2f] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,#4aa3df_0%,#0b4f8a_45%,#1f2b1f_100%)] opacity-90" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#ffcd00]">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Quản trị Quiz Game GGHB VN
            </h1>
            <p className="mt-2 max-w-2xl text-white/75">
              Giao diện CRUD tạm thời không yêu cầu đăng nhập, dùng trực tiếp
              các API route admin.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            <RefreshCcw className="h-5 w-5" />
            Tải lại dữ liệu
          </button>
        </header>

        <section className="rounded-[2rem] border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur md:p-6">
          <div className="mb-6 flex flex-wrap gap-3">
            {[
              { id: "questions" as const, label: "Quản lý câu hỏi" },
              { id: "backgrounds" as const, label: "Quản lý Background" },
              { id: "rewardCodes" as const, label: "Reward Codes" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-3 text-sm font-black transition ${
                  activeTab === tab.id
                    ? "bg-[#0b4f8a] text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center font-bold text-[#0b4f8a]">
              Đang tải dữ liệu admin...
            </div>
          ) : null}

          {!isLoading && activeTab === "questions" ? (
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <form
                onSubmit={saveQuestion}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#da251d]">
                      Questions
                    </p>
                    <h2 className="text-2xl font-black text-[#0b4f8a]">
                      {editingQuestionId ? "Sửa câu hỏi" : "Thêm câu hỏi"}
                    </h2>
                  </div>
                  {editingQuestionId ? (
                    <button
                      type="button"
                      onClick={resetQuestionForm}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-100"
                    >
                      Hủy sửa
                    </button>
                  ) : null}
                </div>

                <label className="block text-sm font-bold text-slate-700">
                  Level
                  <select
                    value={questionForm.level}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        level: Number(event.target.value) as GameLevel,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#4aa3df] focus:ring-4 focus:ring-[#4aa3df]/20"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        Level {level}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block text-sm font-bold text-slate-700">
                  Nội dung câu hỏi
                  <textarea
                    value={questionForm.content}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#4aa3df] focus:ring-4 focus:ring-[#4aa3df]/20"
                    placeholder="Nhập câu hỏi..."
                  />
                </label>

                <label className="mt-4 block text-sm font-bold text-slate-700">
                  Giải thích đáp án đúng nếu có
                  <textarea
                    value={questionForm.explanation}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        explanation: event.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#4aa3df] focus:ring-4 focus:ring-[#4aa3df]/20"
                    placeholder="Giải thích sẽ được dùng khi công bố đáp án đúng..."
                  />
                </label>

                <label className="mt-4 block text-sm font-bold text-slate-700">
                  Link ảnh minh họa nếu có
                  <input
                    value={questionForm.imageUrl}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#4aa3df] focus:ring-4 focus:ring-[#4aa3df]/20"
                    placeholder="https://... hoặc /uploads/..."
                  />
                </label>

                <div className="mt-5 space-y-3">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-600">
                    4 đáp án
                  </p>
                  {questionForm.answers.map((answer, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-3"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b4f8a] font-black text-white">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <input
                          value={answer.content}
                          onChange={(event) =>
                            updateAnswerContent(index, event.target.value)
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#4aa3df] focus:ring-4 focus:ring-[#4aa3df]/20"
                          placeholder={`Đáp án ${index + 1}`}
                        />
                      </div>
                      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={answer.isCorrect}
                          onChange={() => selectCorrectAnswer(index)}
                          className="h-4 w-4 accent-[#da251d]"
                        />
                        Đáp án đúng
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#da251d] px-5 py-3 font-black text-white shadow-lg transition hover:bg-[#b91d17] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-5 w-5" />
                  {isSavingQuestion
                    ? "Đang lưu..."
                    : editingQuestionId
                      ? "Cập nhật câu hỏi"
                      : "Tạo câu hỏi"}
                </button>
              </form>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3">
                  <ListChecks className="h-6 w-6 text-[#0b4f8a]" />
                  <h2 className="text-2xl font-black text-[#0b4f8a]">
                    Danh sách câu hỏi
                  </h2>
                </div>

                <div className="max-h-[820px] space-y-5 overflow-y-auto pr-1">
                  {questionsByLevel.map(({ level, questions: levelQuestions }) => (
                    <section key={level}>
                      <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#1f2b1f] px-4 py-3 text-white">
                        <h3 className="font-black">Level {level}</h3>
                        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
                          {levelQuestions.length} câu
                        </span>
                      </div>

                      {levelQuestions.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500">
                          Chưa có câu hỏi.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {levelQuestions.map((question) => (
                            <article
                              key={question.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-black text-slate-900">
                                    {question.content}
                                  </p>
                                  {question.imageUrl ? (
                                    <p className="mt-1 truncate text-xs font-semibold text-[#0b4f8a]">
                                      Ảnh: {question.imageUrl}
                                    </p>
                                  ) : null}
                                  {question.explanation ? (
                                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">
                                      Giải thích: {question.explanation}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => editQuestion(question)}
                                    className="rounded-full bg-[#ffcd00] p-2 text-[#071a2f] transition hover:bg-[#f0bd00]"
                                    aria-label="Sửa câu hỏi"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteQuestion(question.id)}
                                    className="rounded-full bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                                    aria-label="Xóa câu hỏi"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {question.answers.map((answer) => (
                                  <div
                                    key={answer.id}
                                    className={`rounded-xl px-3 py-2 text-sm font-bold ${
                                      answer.isCorrect
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-white text-slate-600"
                                    }`}
                                  >
                                    {answer.content}
                                  </div>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && activeTab === "backgrounds" ? (
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <form
                onSubmit={saveBackground}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center gap-3">
                  <ImagePlus className="h-7 w-7 text-[#0b4f8a]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#da251d]">
                      Background
                    </p>
                    <h2 className="text-2xl font-black text-[#0b4f8a]">
                      Thêm ảnh nền
                    </h2>
                  </div>
                </div>

                <label className="block text-sm font-bold text-slate-700">
                  Link ảnh background
                  <input
                    value={backgroundForm.imageUrl}
                    onChange={(event) =>
                      setBackgroundForm((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#4aa3df] focus:ring-4 focus:ring-[#4aa3df]/20"
                    placeholder="https://... hoặc /uploads/..."
                  />
                </label>

                <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                  Hiển thị trong game
                  <input
                    type="checkbox"
                    checked={backgroundForm.isActive}
                    onChange={(event) =>
                      setBackgroundForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[#0b4f8a]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSavingBackground}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b4f8a] px-5 py-3 font-black text-white shadow-lg transition hover:bg-[#083d6b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-5 w-5" />
                  {isSavingBackground ? "Đang thêm..." : "Thêm background"}
                </button>
              </form>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="mb-5 text-2xl font-black text-[#0b4f8a]">
                  Thư viện background
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {backgrounds.map((background) => (
                    <article
                      key={background.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                    >
                      <div
                        className="h-40 bg-slate-200 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${background.imageUrl}")`,
                        }}
                      />
                      <div className="space-y-3 p-4">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {background.imageUrl}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          Tạo lúc {formatDate(background.createdAt)}
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => toggleBackground(background)}
                            className={`rounded-full px-4 py-2 text-sm font-black transition ${
                              background.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {background.isActive ? "Đang bật" : "Đang tắt"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBackground(background.id)}
                            className="rounded-full bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                            aria-label="Xóa background"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {backgrounds.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center font-semibold text-slate-500">
                    Chưa có ảnh background.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {!isLoading && activeTab === "rewardCodes" ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-7 w-7 text-[#ffcd00]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#da251d]">
                      Rewards
                    </p>
                    <h2 className="text-2xl font-black text-[#0b4f8a]">
                      Mã thưởng đã phát hành
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshRewardCodes}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Làm mới
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#0b4f8a] text-white">
                    <tr>
                      <th className="px-4 py-3 font-black">Code</th>
                      <th className="px-4 py-3 font-black">Thời gian tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardCodes.map((rewardCode) => (
                      <tr key={rewardCode.id} className="border-t border-slate-200">
                        <td className="px-4 py-3 font-mono text-xl font-black tracking-[0.18em] text-[#071a2f]">
                          {rewardCode.code}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {formatDate(rewardCode.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rewardCodes.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center font-semibold text-slate-500">
                  Chưa có mã thưởng nào.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
