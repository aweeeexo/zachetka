import { createSlice, isAnyOf, isFulfilled, isPending, isRejected, type PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, toFailure } from '../../app/thunk';
import type {
  LoadStatus,
  NewProjectInput,
  Project,
  ProjectPatch,
  RequirementInput,
  RequirementPatch,
} from '../../types';

export interface DetailState {
  status: LoadStatus;
  error: string | null;
  notFound: boolean;
}

export interface ProjectsState {
  items: Project[];
  listStatus: LoadStatus;
  listError: string | null;
  /** Состояние загрузки отдельных проектов (страница проекта может открыться по прямой ссылке). */
  detail: Record<string, DetailState>;
  /** id пунктов и проектов, для которых сейчас идёт запрос (кнопки блокируются). */
  pending: string[];
}

export const initialState: ProjectsState = {
  items: [],
  listStatus: 'idle',
  listError: null,
  detail: {},
  pending: [],
};

// ---------- async thunks ----------

export const fetchProjects = createAppAsyncThunk(
  'projects/fetchAll',
  async (_: void, { extra, rejectWithValue }) => {
    try {
      return await extra.api.listProjects();
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
  { condition: (_, { getState }) => getState().projects.listStatus !== 'loading' },
);

export const fetchProject = createAppAsyncThunk('projects/fetchOne', async (id: string, { extra, rejectWithValue }) => {
  try {
    return await extra.api.getProject(id);
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

export const createProject = createAppAsyncThunk(
  'projects/create',
  async (input: NewProjectInput, { extra, rejectWithValue }) => {
    try {
      return await extra.api.createProject(input);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

export const updateProject = createAppAsyncThunk(
  'projects/update',
  async ({ projectId, patch }: { projectId: string; patch: ProjectPatch }, { extra, rejectWithValue }) => {
    try {
      return await extra.api.updateProject(projectId, patch);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

export const deleteProject = createAppAsyncThunk(
  'projects/delete',
  async ({ projectId }: { projectId: string }, { extra, rejectWithValue }) => {
    try {
      await extra.api.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

/** Отметить пункт. Интерфейс обновляется сразу (оптимистично) и откатывается, если сервер ответил ошибкой. */
export const toggleRequirement = createAppAsyncThunk(
  'projects/toggleRequirement',
  async (
    { projectId, requirementId, done }: { projectId: string; requirementId: string; done: boolean },
    { extra, rejectWithValue },
  ) => {
    try {
      return await extra.api.updateRequirement(projectId, requirementId, { status: done ? 'done' : 'todo' });
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

export const addRequirement = createAppAsyncThunk(
  'projects/addRequirement',
  async (
    { projectId, stageId, input }: { projectId: string; stageId: string; input: RequirementInput },
    { extra, rejectWithValue },
  ) => {
    try {
      return await extra.api.addRequirement(projectId, stageId, input);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

export const updateRequirement = createAppAsyncThunk(
  'projects/updateRequirement',
  async (
    { projectId, requirementId, patch }: { projectId: string; requirementId: string; patch: RequirementPatch },
    { extra, rejectWithValue },
  ) => {
    try {
      return await extra.api.updateRequirement(projectId, requirementId, patch);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

export const deleteRequirement = createAppAsyncThunk(
  'projects/deleteRequirement',
  async ({ projectId, requirementId }: { projectId: string; requirementId: string }, { extra, rejectWithValue }) => {
    try {
      return await extra.api.deleteRequirement(projectId, requirementId);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

/** Операции, которые меняют данные (для отслеживания «занятых» элементов и уведомлений). */
export const mutationThunks = [
  createProject,
  updateProject,
  deleteProject,
  toggleRequirement,
  addRequirement,
  updateRequirement,
  deleteRequirement,
] as const;

/** Проекты, которые возвращает сервер после изменения пунктов и самого проекта. */
const projectReturning = [updateProject, toggleRequirement, addRequirement, updateRequirement, deleteRequirement] as const;

/** Ключ «занятости»: id пункта, если операция над пунктом, иначе id проекта. */
function busyKey(arg: unknown): string | null {
  if (arg && typeof arg === 'object') {
    const a = arg as { requirementId?: string; stageId?: string; projectId?: string };
    return a.requirementId ?? (a.stageId ? `stage:${a.stageId}` : null) ?? a.projectId ?? null;
  }
  return null;
}

function upsert(state: ProjectsState, project: Project) {
  const index = state.items.findIndex((p) => p.id === project.id);
  if (index === -1) state.items.unshift(project);
  else state.items[index] = project;
}

function setRequirementStatus(state: ProjectsState, projectId: string, requirementId: string, done: boolean) {
  const project = state.items.find((p) => p.id === projectId);
  const requirement = project?.stages.flatMap((s) => s.requirements).find((r) => r.id === requirementId);
  if (requirement) requirement.status = done ? 'done' : 'todo';
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    /** Сбросить ошибку списка (например, перед повторной попыткой). */
    clearListError(state) {
      state.listError = null;
    },
    /** Подставить проекты напрямую (используется в тестах и при восстановлении). */
    projectsReplaced(state, action: PayloadAction<Project[]>) {
      state.items = action.payload;
      state.listStatus = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload?.message ?? action.error.message ?? 'Не удалось загрузить проекты';
      })

      .addCase(fetchProject.pending, (state, action) => {
        state.detail[action.meta.arg] = { status: 'loading', error: null, notFound: false };
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        upsert(state, action.payload);
        state.detail[action.meta.arg] = { status: 'succeeded', error: null, notFound: false };
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.detail[action.meta.arg] = {
          status: 'failed',
          error: action.payload?.message ?? action.error.message ?? 'Не удалось загрузить проект',
          notFound: action.payload?.status === 404,
        };
      })

      .addCase(createProject.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        delete state.detail[action.payload];
      })

      // Оптимистичное обновление галочки и откат при ошибке.
      .addCase(toggleRequirement.pending, (state, action) => {
        const { projectId, requirementId, done } = action.meta.arg;
        setRequirementStatus(state, projectId, requirementId, done);
      })
      .addCase(toggleRequirement.rejected, (state, action) => {
        const { projectId, requirementId, done } = action.meta.arg;
        setRequirementStatus(state, projectId, requirementId, !done);
      })

      .addMatcher(isFulfilled(...projectReturning), (state, action) => {
        upsert(state, action.payload);
      })
      .addMatcher(isPending(...mutationThunks), (state, action) => {
        const key = busyKey(action.meta.arg);
        if (key && !state.pending.includes(key)) state.pending.push(key);
      })
      .addMatcher(isAnyOf(isFulfilled(...mutationThunks), isRejected(...mutationThunks)), (state, action) => {
        const key = busyKey(action.meta.arg);
        state.pending = state.pending.filter((k) => k !== key);
      });
  },
});

export const { clearListError, projectsReplaced } = projectsSlice.actions;
export default projectsSlice.reducer;
