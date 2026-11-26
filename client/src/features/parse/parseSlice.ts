import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, toFailure } from '../../app/thunk';
import type { DraftStage, LoadStatus, ParseResult } from '../../types';
import { createProject } from '../projects/projectsSlice';

export interface ParseState {
  status: LoadStatus;
  error: string | null;
  draft: ParseResult | null;
}

export const initialState: ParseState = { status: 'idle', error: null, draft: null };

/** Разбор задания (на этапе 4 — запрос POST /api/parse к AI на сервере). */
export const parseAssignment = createAppAsyncThunk(
  'parse/run',
  async (text: string, { extra, rejectWithValue }) => {
    try {
      return await extra.api.parseAssignment(text);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

function recount(stages: DraftStage[], lines: number): ParseResult {
  return {
    stages,
    stats: { lines, stages: stages.length, requirements: stages.reduce((s, st) => s + st.requirements.length, 0) },
  };
}

const parseSlice = createSlice({
  name: 'parse',
  initialState,
  reducers: {
    draftReset: () => initialState,
    draftStageRenamed(state, action: PayloadAction<{ stageIndex: number; title: string }>) {
      const stage = state.draft?.stages[action.payload.stageIndex];
      if (stage) stage.title = action.payload.title;
    },
    draftDeadlineChanged(state, action: PayloadAction<{ stageIndex: number; deadline: string | null }>) {
      const stage = state.draft?.stages[action.payload.stageIndex];
      if (stage) stage.deadline = action.payload.deadline || null;
    },
    draftStageRemoved(state, action: PayloadAction<{ stageIndex: number }>) {
      if (!state.draft) return;
      const stages = state.draft.stages.filter((_, i) => i !== action.payload.stageIndex);
      state.draft = recount(stages, state.draft.stats.lines);
    },
    draftRequirementRemoved(state, action: PayloadAction<{ stageIndex: number; requirementIndex: number }>) {
      if (!state.draft) return;
      const stage = state.draft.stages[action.payload.stageIndex];
      if (!stage) return;
      stage.requirements.splice(action.payload.requirementIndex, 1);
      state.draft = recount(state.draft.stages, state.draft.stats.lines);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(parseAssignment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(parseAssignment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.draft = action.payload;
      })
      .addCase(parseAssignment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? action.error.message ?? 'Не удалось разобрать задание';
      })
      // После сохранения проекта черновик больше не нужен.
      .addCase(createProject.fulfilled, () => initialState);
  },
});

export const { draftReset, draftStageRenamed, draftDeadlineChanged, draftStageRemoved, draftRequirementRemoved } =
  parseSlice.actions;
export default parseSlice.reducer;
