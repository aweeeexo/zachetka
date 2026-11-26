import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Типизированные хуки: в компонентах используем их вместо useDispatch/useSelector.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
